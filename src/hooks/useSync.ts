import { useState, useCallback } from 'react';
import type { BabyInfo, Record } from '../types';
import { generateCSVString, csvToRecords } from '../utils/csvUtils';
import { mergeRecords } from '../utils/mergeUtils';

export const useSync = (babyInfo: BabyInfo | null, showToast: (msg: string) => void) => {
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem('google-access-token'));
  const [tokenExpire, setTokenExpire] = useState<number>(() => Number(localStorage.getItem('google-token-expire') || 0));
  const [isSyncing, setIsSyncing] = useState(false);

  const updateToken = useCallback((token: string, expiresAt: number) => {
    setAccessToken(token);
    setTokenExpire(expiresAt);
    localStorage.setItem('google-access-token', token);
    localStorage.setItem('google-token-expire', expiresAt.toString());
  }, []);

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
    try {
      await fetch(data.gasUrl, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isTest ? "test" : "schedule", token: data.lineToken, userId: data.lineUserId, targetTime: targetTs, babyName: data.name })
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
        body: JSON.stringify({ action: "cancel", userId: data.lineUserId })
      });
      console.log("☁️ 雲端排程已要求取消");
    } catch (err) { console.error(err); }
  }, [babyInfo]);

  const handleGoogleLogin = useCallback((callback?: (token: string) => void) => {
    if (!babyInfo?.googleClientId) { showToast("請先在設定中輸入 Google Client ID ⚙️"); return; }
    const client = (window as any).google?.accounts.oauth2.initTokenClient({
      client_id: babyInfo.googleClientId,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (response: any) => {
        if (response.access_token) {
          const expiresAt = Date.now() + response.expires_in * 1000;
          updateToken(response.access_token, expiresAt);
          showToast("Google 雲端連結已續約 ☁️");
          if (callback) callback(response.access_token);
        }
      },
    });
    client.requestAccessToken({ prompt: '' });
  }, [babyInfo, showToast, updateToken]);

  const pullRecordsFromDrive = useCallback(async (overrideToken?: string): Promise<Record[]> => {
    const token = overrideToken || accessToken;
    if (!token || Date.now() > tokenExpire) return [];

    const d = new Date();
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const fileName = `baby_records_${dateStr}.csv`;

    try {
      const folderQuery = babyInfo?.googleFolderId ? ` and '${babyInfo.googleFolderId}' in parents` : '';
      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and trashed=false${folderQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const searchData = await searchRes.json();
      const existingFile = searchData.files?.[0];

      if (existingFile) {
        const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const content = await fileRes.text();
        return csvToRecords(content);
      }
    } catch (err) {
      console.error("Pull Records Error:", err);
    }
    return [];
  }, [accessToken, tokenExpire, babyInfo]);

  const syncToDriveDirect = useCallback(async (data: Record[], overrideToken?: string) => {
    const token = overrideToken || accessToken;
    if (!token || Date.now() > tokenExpire) {
      if (overrideToken) return;
      handleGoogleLogin((newToken: string) => syncToDriveDirect(data, newToken));
      return;
    }

    const d = new Date();
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const fileName = `baby_records_${dateStr}.csv`;
    const csv = generateCSVString(data);

    try {
      const folderQuery = babyInfo?.googleFolderId ? ` and '${babyInfo.googleFolderId}' in parents` : '';
      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and trashed=false${folderQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const searchData = await searchRes.json();
      const existingFile = searchData.files?.[0];

      const metadata: any = { name: fileName, mimeType: 'text/csv' };
      if (babyInfo?.googleFolderId && !existingFile) metadata.parents = [babyInfo.googleFolderId];

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([csv], { type: 'text/csv' }));

      if (existingFile) {
        await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`, {
          method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: form
        });
      } else {
        await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form
        });
      }
      console.log("☁️ Google Drive 同步完成");
    } catch (err) { console.error("Drive Sync Error:", err); }
  }, [accessToken, tokenExpire, babyInfo, handleGoogleLogin]);

  const fullSync = useCallback(async (localRecords: Record[], onSyncComplete: (merged: Record[]) => void) => {
    if (!accessToken || Date.now() > tokenExpire) {
      handleGoogleLogin(async (newToken) => {
        setIsSyncing(true);
        const remote = await pullRecordsFromDrive(newToken);
        const merged = mergeRecords(localRecords, remote);
        onSyncComplete(merged);
        await syncToDriveDirect(merged, newToken);
        setIsSyncing(false);
      });
      return;
    }

    setIsSyncing(true);
    try {
      const remote = await pullRecordsFromDrive();
      const merged = mergeRecords(localRecords, remote);
      onSyncComplete(merged);
      await syncToDriveDirect(merged);
    } catch (err) {
      console.error("Full Sync Error:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [accessToken, tokenExpire, handleGoogleLogin, pullRecordsFromDrive, syncToDriveDirect]);

  return {
    accessToken,
    isSyncing,
    sendLineAction,
    callGasApi,
    cancelGasSchedule,
    handleGoogleLogin,
    syncToDriveDirect,
    pullRecordsFromDrive,
    fullSync
  };
};
