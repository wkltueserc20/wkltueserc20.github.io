import type { Record } from '../types';

/**
 * Merge local and remote records based on their unique IDs.
 * If IDs match, the records are assumed to be identical or updated.
 * The resulting array is sorted by timestamp descending.
 */
export const mergeRecords = (local: Record[], remote: Record[]): Record[] => {
  const mergedMap = new Map<string, Record>();

  // Remote records usually represent the collective truth from other devices
  remote.forEach((r) => {
    if (r.id) mergedMap.set(r.id, r);
  });

  // Local records might contain new entries or local modifications
  local.forEach((r) => {
    if (r.id) {
      // In case of conflict, we can decide which one to keep.
      // For now, if it exists locally, we assume it's valid or newer.
      mergedMap.set(r.id, r);
    }
  });

  return Array.from(mergedMap.values()).sort((a, b) => b.timestamp - a.timestamp);
};
