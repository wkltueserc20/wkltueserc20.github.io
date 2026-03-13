import { useState, useCallback, useRef } from 'react';
import type { BabyInfo, Record } from '../types';
import { generateCSVString, csvToRecords } from '../utils/csvUtils';
import { mergeRecords } from '../utils/mergeUtils';

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
    
    // 獲取昨日與今日的檔名
    const d = new Date();
    const todayStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterdayStr = `${y.getFullYear()}${String(y.getMonth() + 1).padStart(2, '0')}${String(y.getDate()).padStart(2, '0')}`;

    const dates = [yesterdayStr, todayStr];
    let allRemoteRecords: Record[] = [];

    try {
      // 併行抓取昨今兩日的資料
      const results = await Promise.all(dates.map(date => 
        callGasProxy('pull', { fileName: `baby_records_${date}.csv` }).catch(() => ({ status: 'not_found' }))
      ));

      results.forEach(result => {
        if (result.status === 'success' && result.csv) {
          allRemoteRecords = mergeRecords(allRemoteRecords, csvToRecords(result.csv));
        }
      });

      return allRemoteRecords;
    } catch (err) {
      console.error("Pull Multi-day Records Error:", err);
      throw err;
    }
  }, [accessToken, callGasProxy]);

  const syncToDriveDirect = useCallback(async (data: Record[]) => {
    if (!accessToken) return;
    const d = new Date();
    const todayStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const fileName = `baby_records_${todayStr}.csv`;
    
    // 注意：存檔時只存「今天」日期的紀錄到對應檔案中，
    // 雖然全量紀錄在 IndexedDB，但雲端 CSV 仍維持每日一個。
    // 這裡我們只過濾出屬於今天檔案的紀錄，或者維持 LWW 全量推送到當日檔也可以（因為 mergeRecords 會處理）。
    // 為了簡單且安全，我們直接將當前 IndexedDB 的所有資料推送到當日 CSV。
    const csv = generateCSVString(data);

    try {
      await callGasProxy('push', { fileName, csv });
      console.log("☁️ GAS 代理同步完成");
    } catch (err) { 
      console.error("GAS Sync Error:", err);
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
      const remote = await pullRecordsFromDrive();
      const merged = mergeRecords(localRecords, remote);
      onSyncComplete(merged);
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
