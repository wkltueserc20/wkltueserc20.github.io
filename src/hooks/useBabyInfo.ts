import { useState, useEffect, useCallback } from 'react';
import type { BabyInfo } from '../types';

export const useBabyInfo = () => {
  const [babyInfo, setBabyInfo] = useState<BabyInfo | null>(null);

  useEffect(() => {
    const savedInfo = localStorage.getItem('baby-info');
    if (savedInfo) {
      try {
        setBabyInfo(JSON.parse(savedInfo));
      } catch (e) {
        console.error('Failed to parse baby info', e);
      }
    }
  }, []);

  useEffect(() => {
    if (babyInfo) {
      localStorage.setItem('baby-info', JSON.stringify(babyInfo));
    }
  }, [babyInfo]);

  const updateBabyInfo = useCallback((info: BabyInfo) => {
    setBabyInfo(info);
  }, []);

  return {
    babyInfo,
    setBabyInfo: updateBabyInfo,
  };
};
