import { useState, useCallback, useEffect } from 'react';
import type { Record } from '../types';

export const useRecords = () => {
  const [records, setRecords] = useState<Record[]>([]);

  // Load records from local storage on mount
  useEffect(() => {
    const savedRecords = localStorage.getItem('baby-records');
    if (savedRecords) {
      try {
        const parsed = JSON.parse(savedRecords);
        // Ensure data integrity: filter out old 'diaper' type if any remain
        const filtered = parsed
          .filter((r: any) => r.type !== 'diaper')
          .sort((a: Record, b: Record) => b.timestamp - a.timestamp);
        setRecords(filtered);
      } catch (e) {
        console.error('Failed to parse records', e);
      }
    }
  }, []);

  // Persist records to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('baby-records', JSON.stringify(records));
  }, [records]);

  const addRecord = useCallback((newRecord: Record) => {
    setRecords((prev) => [newRecord, ...prev].sort((a, b) => b.timestamp - a.timestamp));
  }, []);

  const updateRecord = useCallback((updatedRecord: Record) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)).sort((a, b) => b.timestamp - a.timestamp)
    );
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const setAllRecords = useCallback((newRecords: Record[]) => {
    setRecords(newRecords.sort((a, b) => b.timestamp - a.timestamp));
  }, []);

  return {
    records,
    addRecord,
    updateRecord,
    deleteRecord,
    setAllRecords,
  };
};
