import { useState, useCallback, useRef } from 'react';
import type { BabyInfo, Record } from '../types';
import { generateCSVString, csvToRecords } from '../utils/csvUtils';
import { mergeRecords } from '../utils/mergeUtils';
import { db } from '../db/db';

export const useSync = (babyInfo: BabyInfo | null, showToast: (msg: string) => void) => {
  // accessToken 這裡改為表示「是否已完成長效連結」的狀態標記
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem('google-access-token'));
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  const syncingRef = useRef(false);
  const pendingSyncRef = useRef<Record[] | null>(null);

  const updateToken = useCallback((token: string) => {
    setAccessToken(token);
    setSyncError(null);
    localStorage.setItem('google-access-token', token);
  }, []);

  // --- GAS 代理請求輔助函式 ---
  const callGasProxy = useCallback(async (action: string, payload: any) => {
    if (!babyInfo?.gasUrl) throw new Error("Missing GAS URL");
    
    const response = await fetch(babyInfo.gasUrl, {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        action,
        syncSecret: babyInfo.syncSecret // 使用通訊密鑰
      })
    });

    if (!response.ok) throw new Error(`GAS Error: ${response.status}`);
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    return result;
  }, [babyInfo]);

  const sendLineAction = useCallback(async (message: string, isAuto = false) => {
    const data = babyInfo;
    if (!data?.lineToken || !data?.lineUserId || !data?.lineEnabled) return;
    try {
      const apiUrl = 'https://api.line.me/v2/bot/message/push';
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${data.lineToken}` },
        body: JSON.stringify({ to: data.lineUserId, messages: [{ type: 'text', text: message }] })
      });
      if (response.ok && !isAuto) showToast("測試 LINE 成功 ✅");
    } catch (err) { console.error(err); }
  }, [babyInfo, showToast]);

  const callGasApi = useCallback(async (targetTs: number, isTest = false) => {
    const data = babyInfo;
    if (!data?.gasUrl || !data?.lineToken || !data?.lineUserId) return;
    if (!data?.lineEnabled && !isTest) return;
    try {
      await fetch(data.gasUrl, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: isTest ? "test" : "schedule", 
          token: data.lineToken, 
          userId: data.lineUserId, 
          targetTime: targetTs, 
          babyName: data.name,
          syncSecret: data.syncSecret 
        })
      });
      if (isTest) showToast("GAS 指令已送出，請查收 LINE 🚀");
    } catch (err) { console.error(err); }
  }, [babyInfo, showToast]);

  const cancelGasSchedule = useCallback(async () => {
    const data = babyInfo;
    if (!data?.gasUrl || !data?.lineUserId) return;
    try {
      await fetch(data.gasUrl, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "cancel", userId: data.lineUserId, syncSecret: data.syncSecret })
      });
      console.log("☁️ 雲端排程已要求取消");
    } catch (err) { console.error(err); }
  }, [babyInfo]);

  const handleGoogleLogin = useCallback(() => {
    if (!babyInfo?.googleClientId) {
      showToast("請先在設定中輸入 Google Client ID ⚙️");
      return;
    }
    
    try {
      const client = (window as any).google?.accounts.oauth2.initCodeClient({
        client_id: babyInfo.googleClientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        ux_mode: 'popup',
        callback: async (response: any) => {
          if (response.code) {
            showToast("正在建立長效連結 ☁️...");
            try {
              await callGasProxy('auth', { code: response.code });
              updateToken('linked');
              showToast("Google 雲端長效連結成功 ✅");
            } catch (err) {
              console.error("Auth Exchange Error:", err);
              showToast("連結失敗，請檢查 GAS 設定 ❌");
            }
          }
        },
      });
      client.requestCode();
    } catch (err) {
      console.error("Auth Init Error:", err);
      showToast("Google Auth 初始化失敗");
    }
  }, [babyInfo, showToast, callGasProxy, updateToken]);

  const pullRecordsFromDrive = useCallback(async (): Promise<Record[]> => {
    if (!accessToken) return [];
    
    try {
      // Step 1: 詢問 GAS 最近有變動的檔案 (Smart Detect)
      const listResult = await callGasProxy('listRecent', {});
      if (listResult.status !== 'success' || !listResult.files) return [];
      
      const filesToPull = listResult.files; // 最近變動的 5 個檔案
      let allRemoteRecords: Record[] = [];

      // Step 2: 併行抓取變動檔案
      const results = await Promise.all(filesToPull.map((fileName: string) => 
        callGasProxy('pull', { fileName }).catch(() => ({ status: 'not_found' }))
      ));

      results.forEach(result => {
        if (result.status === 'success' && result.csv) {
          allRemoteRecords = mergeRecords(allRemoteRecords, csvToRecords(result.csv));
        }
      });

      return allRemoteRecords;
    } catch (err) {
      console.error("Pull Recent Records Error:", err);
      throw err;
    }
  }, [accessToken, callGasProxy]);

  const syncToDriveDirect = useCallback(async (data: Record[]) => {
    if (!accessToken) return;
    
    // 按日期將資料分組 (Group records by YYYYMMDD)
    const groups: { [date: string]: Record[] } = {};
    data.forEach(r => {
      const d = new Date(r.timestamp);
      const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(r);
    });

    // 取得受影響的日期清單，目前限制推送最近受影響的 3 個檔案以平衡效能與完整性
    // (通常一次操作只會影響 1-2 天，例如補登昨日紀錄)
    const targetDates = Object.keys(groups).sort().reverse().slice(0, 3);

    try {
      await Promise.all(targetDates.map(async (dateStr) => {
        const fileName = `baby_records_${dateStr}.csv`;
        const csv = generateCSVString(groups[dateStr]);
        await callGasProxy('push', { fileName, csv });
      }));
      console.log("☁️ GAS 分組同步完成");
    } catch (err) { 
      console.error("GAS Grouped Sync Error:", err);
      throw err; 
    }
  }, [accessToken, callGasProxy]);

  const fullSync = useCallback(async (localRecords: Record[], onSyncComplete: (merged: Record[]) => void, options?: { silent?: boolean }) => {
    if (syncingRef.current) {
      pendingSyncRef.current = localRecords;
      return;
    }
    
    const isSilent = options?.silent || false;
    if (!accessToken || !babyInfo) return; // 增加 babyInfo 檢查

    setSyncError(null);
    syncingRef.current = true;
    setIsSyncing(true);

    try {
      // Step 1: 拉取雲端變動資料
      const remote = await pullRecordsFromDrive();
      
      // Step 2: FRESH READ - 合併前重新讀取本地資料庫
      // 確保同步下載期間 (1~3s) 產生的任何新紀錄都能被納入合併範圍
      const latestLocal = await db.records.toArray();
      
      // Step 3: 執行 LWW 合併
      const merged = mergeRecords(latestLocal, remote);
      onSyncComplete(merged);
      
      // Step 4: 推送回雲端
      await syncToDriveDirect(merged);
      
      if (!isSilent) showToast("同步完成 ✅");
    } catch (err) {
      console.error("Full Sync Error:", err);
      setSyncError("sync_failed");
      if (!isSilent) showToast("同步失敗 ❌");
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
      if (pendingSyncRef.current) {
        const nextRecords = pendingSyncRef.current;
        pendingSyncRef.current = null;
        fullSync(nextRecords, onSyncComplete, options);
      }
    }
  }, [accessToken, pullRecordsFromDrive, syncToDriveDirect, showToast]);

  return {
    accessToken,
    isSyncing,
    syncError,
    sendLineAction,
    callGasApi,
    cancelGasSchedule,
    handleGoogleLogin,
    syncToDriveDirect,
    pullRecordsFromDrive,
    fullSync
  };
};
