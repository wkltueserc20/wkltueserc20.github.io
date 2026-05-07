import type { Record } from '../types';

/**
 * Merge local and remote records based on their unique IDs and update timestamps.
 * This implements a Last-Write-Wins (LWW) conflict resolution strategy.
 * If IDs match, the record with the larger updatedAt value is kept.
 * The resulting array is sorted by timestamp descending.
 */
export const mergeRecords = (local: Record[], remote: Record[]): Record[] => {
  const mergedMap = new Map<string, Record>();

  // Helper to merge a record into the map
  const addIfNewer = (record: Record) => {
    if (!record.id) return;
    const existing = mergedMap.get(record.id);
    if (!existing || (record.updatedAt || 0) > (existing.updatedAt || 0)) {
      mergedMap.set(record.id, record);
    }
  };

  // Process local first, then remote — remote wins only if strictly newer.
  // This ensures that same-timestamp local changes (e.g. just-saved fields like
  // ingredients that the server may not yet persist) are not silently dropped.
  local.forEach(addIfNewer);
  remote.forEach(addIfNewer);

  return Array.from(mergedMap.values()).sort((a, b) => b.timestamp - a.timestamp);
};
