import { useState, useCallback, useRef } from 'react';
import type { BabyInfo, Record } from '../types';
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

  const syncingRef = useRef(false);
  const pendingSyncRef = useRef<Record[] | null>(null);

  const updateToken = useCallback((token: string) => {
    setAccessToken(token);
    setSyncError(null);
    localStorage.setItem('google-access-token', token);
  }, []);

  const updateFingerprints = useCallback((newFingerprints: Record<string, string>) => {
    const updated = { ...fingerprints, ...newFingerprints };
    setFingerprints(updated);
    localStorage.setItem('baby-sync-fingerprints', JSON.stringify(updated));
  }, [fingerprints]);

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

  // --- 批量同步核心邏輯 ---
  const callBatchSync = useCallback(async (pullFiles: string[], pushData: {name: string, csv: string}[]) => {
    const pullReqs = pullFiles.map(name => ({ name, md5: fingerprints[name] || "" }));
    
    const result = await callGasProxy('batchSync', {
      pull: pullReqs,
      push: pushData
    });

    if (result.status === 'success' && result.results) {
      const remoteRecords: Record[] = [];
      const newFingerprints: Record<string, string> = {};

      Object.entries(result.results).forEach(([fileName, res]: [string, any]) => {
        if (res.md5) newFingerprints[fileName] = res.md5;
        if (res.status === 'updated' && res.csv) {
          remoteRecords.push(...csvToRecords(res.csv));
        }
      });

      updateFingerprints(newFingerprints);
      return remoteRecords;
    }
    return [];
  }, [callGasProxy, fingerprints, updateFingerprints]);

  // --- 舊有的 Pull/Push 保留作為相容性 (或內部調用) ---
  const pullRecordsFromDrive = useCallback(async (): Promise<Record[]> => {
    if (!accessToken) return [];
    try {
      const listResult = await callGasProxy('listRecent', {});
      if (listResult.status !== 'success' || !listResult.files) return [];
      return await callBatchSync(listResult.files, []);
    } catch (err) {
      console.error("Pull Recent Records Error:", err);
      throw err;
    }
  }, [accessToken, callGasProxy, callBatchSync]);

  const fullSync = useCallback(async (localRecords: Record[], onSyncComplete: (merged: Record[]) => void, options?: { silent?: boolean }) => {
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
      // 1. 偵測雲端變動清單
      const listResult = await callGasProxy('listRecent', {});
      const recentFiles = (listResult.status === 'success' && listResult.files) ? listResult.files : [];

      // 2. 準備推送資料 (Group by Date)
      const groups: Record<string, Record[]> = {};
      const latestLocal = await db.records.toArray(); // FRESH READ
      latestLocal.forEach(r => {
        const d = new Date(r.timestamp);
        const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
        if (!groups[dateStr]) groups[dateStr] = [];
        groups[dateStr].push(r);
      });

      // 找出受影響的日期（這裡為了效能，通常只推送最近 2 天或有顯著變動的）
      // 策略：推送最近 2 天的資料 + 雲端最近變動清單中也存在於本地的
      const today = new Date();
      const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}${String(yesterday.getMonth() + 1).padStart(2, '0')}${String(yesterday.getDate()).padStart(2, '0')}`;
      
      const pushDates = Array.from(new Set([todayStr, yesterdayStr]));
      const pushData = pushDates
        .filter(d => groups[d])
        .map(d => ({ name: `baby_records_${d}.csv`, csv: generateCSVString(groups[d]) }));

      // 3. 執行單次 BATCH SYNC (Pull + Push)
      const remoteUpdate = await callBatchSync(recentFiles, pushData);
      
      // 4. 合併並更新 UI
      const finalMerged = mergeRecords(latestLocal, remoteUpdate);
      onSyncComplete(finalMerged);
      
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
  }, [accessToken, babyInfo, callGasProxy, callBatchSync, showToast]);

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
