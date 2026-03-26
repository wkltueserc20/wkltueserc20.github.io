import { useState, useCallback, useRef } from 'react';
import type { BabyInfo, Record as BabyRecord } from '../types';
import { generateCSVString, csvToRecords } from '../utils/csvUtils';
import { mergeRecords } from '../utils/mergeUtils';
import { db } from '../db/db';

export const useSync = (babyInfo: BabyInfo | null, showToast: (msg: string) => void) => {
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem('google-access-token'));
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Fingerprint Cache: fileName -> md5Checksum
  const [fingerprints, setFingerprints] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('baby-sync-fingerprints');
    return saved ? JSON.parse(saved) : {};
  });

  // Dirty Dates: 追蹤有本地異動但尚未同步的日期
  const [dirtyDates, setDirtyDates] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('baby-sync-dirty-dates');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const syncingRef = useRef(false);
  const pendingSyncRef = useRef<BabyRecord[] | null>(null);

  const updateToken = useCallback((token: string) => {
    setAccessToken(token);
    setSyncError(null);
    localStorage.setItem('google-access-token', token);
  }, []);

  const updateFingerprints = useCallback((newFingerprints: Record<string, string>) => {
    setFingerprints(prev => {
      const updated = { ...prev, ...newFingerprints };
      localStorage.setItem('baby-sync-fingerprints', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const saveDirtyDates = useCallback((dates: Set<string>) => {
    setDirtyDates(dates);
    localStorage.setItem('baby-sync-dirty-dates', JSON.stringify([...dates]));
  }, []);

  const markDateDirty = useCallback((timestamp: number) => {
    const d = new Date(timestamp);
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    setDirtyDates(prev => {
      const next = new Set(prev);
      next.add(dateStr);
      localStorage.setItem('baby-sync-dirty-dates', JSON.stringify([...next]));
      return next;
    });
  }, []);

  // --- GAS 代理請求輔助函式 ---
  const callGasProxy = useCallback(async (action: string, payload: any) => {
    if (!babyInfo?.gasUrl) throw new Error("Missing GAS URL");

    const response = await fetch(babyInfo.gasUrl, {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        action,
        syncSecret: babyInfo.syncSecret
      })
    });

    if (!response.ok) throw new Error(`GAS Error: ${response.status}`);
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    return result;
  }, [babyInfo]);

  // --- LINE 動作與 GAS 其它 API ---
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

  // --- smartSync: 單一請求完成 list + pull + push ---
  const callSmartSync = useCallback(async (pushData: {name: string, csv: string}[]) => {
    const result = await callGasProxy('smartSync', {
      fingerprints,
      push: pushData
    });

    if (result.status === 'success') {
      const remoteRecords: BabyRecord[] = [];
      const newFingerprints: Record<string, string> = {};

      if (result.results) {
        Object.entries(result.results).forEach(([fileName, res]: [string, any]) => {
          if (res.md5) newFingerprints[fileName] = res.md5;
          if (res.status === 'updated' && res.csv) {
            remoteRecords.push(...csvToRecords(res.csv));
          }
        });
      }

      updateFingerprints(newFingerprints);
      return remoteRecords;
    }
    return [];
  }, [callGasProxy, fingerprints, updateFingerprints]);

  // --- 保留舊版輔助函式供向後相容 ---
  const pullRecordsFromDrive = useCallback(async (): Promise<BabyRecord[]> => {
    if (!accessToken) return [];
    try {
      return await callSmartSync([]);
    } catch (err) {
      console.error("Pull Recent Records Error:", err);
      throw err;
    }
  }, [accessToken, callSmartSync]);

  const syncToDriveDirect = useCallback(async (data: BabyRecord[]) => {
    if (!accessToken) return;

    const groups: Record<string, BabyRecord[]> = {};
    data.forEach(r => {
      const d = new Date(r.timestamp);
      const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(r);
    });

    const today = new Date();
    const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}${String(yesterday.getMonth() + 1).padStart(2, '0')}${String(yesterday.getDate()).padStart(2, '0')}`;

    const pushDates = Array.from(new Set([todayStr, yesterdayStr]));
    const pushData = pushDates
      .filter(d => groups[d])
      .map(d => ({ name: `baby_records_${d}.csv`, csv: generateCSVString(groups[d]) }));

    await callSmartSync(pushData);
  }, [accessToken, callSmartSync]);

  const fullSync = useCallback(async (localRecords: BabyRecord[], onSyncComplete: (merged: BabyRecord[]) => void, options?: { silent?: boolean }) => {
    if (syncingRef.current) {
      pendingSyncRef.current = localRecords;
      return;
    }

    const isSilent = options?.silent || false;
    if (!accessToken || !babyInfo) return;

    setSyncError(null);
    syncingRef.current = true;
    setIsSyncing(true);

    try {
      // 從 IndexedDB 讀取最新本地資料並按日期分組
      const groups: Record<string, BabyRecord[]> = {};
      const latestLocal = await db.records.toArray();
      latestLocal.forEach(r => {
        const d = new Date(r.timestamp);
        const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
        if (!groups[dateStr]) groups[dateStr] = [];
        groups[dateStr].push(r);
      });

      // 根據 dirtyDates 產生 push 資料（自適應推送）
      // 若 dirtyDates 為空（例如 silent sync），至少推送 today + yesterday
      const today = new Date();
      const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}${String(yesterday.getMonth() + 1).padStart(2, '0')}${String(yesterday.getDate()).padStart(2, '0')}`;

      const pushDateSet = new Set(dirtyDates);
      pushDateSet.add(todayStr);
      pushDateSet.add(yesterdayStr);

      const pushData = Array.from(pushDateSet)
        .filter(d => groups[d])
        .map(d => ({ name: `baby_records_${d}.csv`, csv: generateCSVString(groups[d]) }));

      // 單一 smartSync 請求完成 list + pull + push
      const remoteUpdate = await callSmartSync(pushData);
      const finalMerged = mergeRecords(latestLocal, remoteUpdate);
      onSyncComplete(finalMerged);

      // 同步成功，清空 dirtyDates
      saveDirtyDates(new Set());

      if (!isSilent) showToast("同步完成 ✅");
    } catch (err) {
      console.error("Full Sync Error:", err);
      setSyncError("sync_failed");
      // 同步失敗，保留 dirtyDates
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
  }, [accessToken, babyInfo, dirtyDates, callSmartSync, saveDirtyDates, showToast]);

  return {
    accessToken,
    isSyncing,
    syncError,
    markDateDirty,
    sendLineAction,
    callGasApi,
    cancelGasSchedule,
    handleGoogleLogin,
    syncToDriveDirect,
    pullRecordsFromDrive,
    fullSync
  };
};
