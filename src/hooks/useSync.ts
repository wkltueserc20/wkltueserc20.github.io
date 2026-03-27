import { useState, useCallback, useRef } from 'react';
import type { BabyInfo, Record as BabyRecord } from '../types';
import { mergeRecords } from '../utils/mergeUtils';
import { db } from '../db/db';

export const useSync = (babyInfo: BabyInfo | null, showToast: (msg: string) => void) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const syncingRef = useRef(false);
  const pendingSyncRef = useRef<{ records: BabyRecord[]; callback: (merged: BabyRecord[]) => void; options?: { silent?: boolean } } | null>(null);
  const lastSyncAtRef = useRef<number>(
    Number(localStorage.getItem('baby-last-sync-at')) || 0
  );

  const babyInfoRef = useRef(babyInfo);
  babyInfoRef.current = babyInfo;

  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  const isConnected = !!(babyInfo?.syncUrl && babyInfo?.syncSecret);

  const fullSync = useCallback(async (
    localRecords: BabyRecord[],
    onSyncComplete: (merged: BabyRecord[]) => void,
    options?: { silent?: boolean }
  ) => {
    if (syncingRef.current) {
      pendingSyncRef.current = { records: localRecords, callback: onSyncComplete, options };
      return;
    }

    const info = babyInfoRef.current;
    const isSilent = options?.silent || false;
    if (!info?.syncUrl || !info?.syncSecret) return;

    setSyncError(null);
    syncingRef.current = true;
    setIsSyncing(true);

    try {
      const latestLocal = await db.records.toArray();
      const lastSync = lastSyncAtRef.current as number;
      const changes = latestLocal.filter(r => (r.updatedAt || 0) > lastSync);

      const response = await fetch(`${info.syncUrl}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncSecret: info.syncSecret,
          lastSyncAt: lastSync,
          changes,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.ok) {
        const remoteRecords: BabyRecord[] = (result.records || []).map((r: any) => ({
          id: r.id,
          type: r.type,
          milkType: r.milkType || undefined,
          time: r.time,
          timestamp: r.timestamp,
          endTimestamp: r.endTimestamp || undefined,
          amount: r.amount ?? undefined,
          weight: r.weight ?? undefined,
          height: r.height ?? undefined,
          note: r.note || undefined,
          updatedAt: r.updatedAt,
          isDeleted: r.isDeleted || false,
          deviceName: r.deviceName || undefined,
        }));

        const finalMerged = mergeRecords(latestLocal, remoteRecords);
        onSyncComplete(finalMerged);

        lastSyncAtRef.current = result.syncedAt;
        localStorage.setItem('baby-last-sync-at', result.syncedAt.toString());

        if (!isSilent) showToastRef.current('同步完成 ✅');
      }
    } catch (err) {
      console.error('Sync Error:', err);
      setSyncError('sync_failed');
      if (!isSilent) showToastRef.current('同步失敗 ❌');
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
      if (pendingSyncRef.current) {
        const { records: nextRecords, callback, options: nextOptions } = pendingSyncRef.current;
        pendingSyncRef.current = null;
        fullSync(nextRecords, callback, nextOptions);
      }
    }
  }, []); // No dependencies — all values read from refs

  return {
    isConnected,
    isSyncing,
    syncError,
    fullSync,
  };
};
