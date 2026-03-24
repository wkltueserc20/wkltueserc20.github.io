import { useState, useCallback, useEffect } from 'react';
import type { Record } from '../types';
import { db } from '../db/db';

export const useRecords = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load records from IndexedDB on mount
  useEffect(() => {
    const loadAndMigrate = async () => {
      try {
        // 1. Check if we need to migrate from LocalStorage
        const savedRecords = localStorage.getItem('baby-records');
        const isMigrated = localStorage.getItem('baby-records-migrated');
        const dbCount = await db.records.count();

        if (savedRecords && !isMigrated && dbCount === 0) {
          console.log('🚚 Detecting legacy data in LocalStorage, starting migration...');
          const parsed = JSON.parse(savedRecords);
          const filtered = parsed.filter((r: any) => r.type !== 'diaper');
          
          if (filtered.length > 0) {
            await db.records.bulkAdd(filtered);
            console.log(`✅ Successfully migrated ${filtered.length} records to IndexedDB.`);
          }
          localStorage.setItem('baby-records-migrated', 'true');
          // We keep the old data in LocalStorage for safety for now, 
          // but you could choose to clear it: localStorage.removeItem('baby-records');
        }

        // 2. Load data from IndexedDB
        const allRecords = await db.records.orderBy('timestamp').reverse().toArray();
        setRecords(allRecords);
      } catch (e) {
        console.error('Failed to load or migrate records', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadAndMigrate();
  }, []);

  const addRecord = useCallback(async (newRecord: Record) => {
    try {
      await db.records.add(newRecord);
      setRecords((prev) => [newRecord, ...prev].sort((a, b) => b.timestamp - a.timestamp));
    } catch (e) {
      console.error('Failed to add record', e);
    }
  }, []);

  const updateRecord = useCallback(async (updatedRecord: Record) => {
    try {
      await db.records.put(updatedRecord);
      setRecords((prev) =>
        prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)).sort((a, b) => b.timestamp - a.timestamp)
      );
    } catch (e) {
      console.error('Failed to update record', e);
    }
  }, []);

  const setAllRecords = useCallback(async (newRecords: Record[]) => {
    try {
      // Use bulkPut to avoid clear() and ensure atomicity/no data loss during sync gaps
      await db.records.bulkPut(newRecords);
      setRecords(newRecords.sort((a, b) => b.timestamp - a.timestamp));
    } catch (e) {
      console.error('Failed to set all records', e);
    }
  }, []);

  return {
    records,
    isLoading, // Added loading state for potential UI feedback
    addRecord,
    updateRecord,
    setAllRecords,
  };
};
