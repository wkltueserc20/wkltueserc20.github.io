import React, { useMemo, useState, useRef, useCallback } from 'react';
import type { Record } from '../../types';

interface SolidFoodStatsPageProps {
  records: Record[];
}

interface FoodGroup {
  label: string;
  count: number;
  totalGrams: number;
  latestTimestamp: number;
  latestGrams: number;
  history: { timestamp: number; grams: number }[];
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const LONG_PRESS_MS = 500;

export const SolidFoodStatsPage: React.FC<SolidFoodStatsPageProps> = ({ records }) => {
  const [expandedFood, setExpandedFood] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchMovedRef = useRef(false);

  const groups = useMemo<FoodGroup[]>(() => {
    const map = new Map<string, FoodGroup>();
    records
      .filter(r => !r.isDeleted && r.type === 'babyfood' && r.label)
      .forEach(r => {
        const label = r.label!;
        if (!map.has(label)) {
          map.set(label, { label, count: 0, totalGrams: 0, latestTimestamp: 0, latestGrams: 0, history: [] });
        }
        const g = map.get(label)!;
        g.count += 1;
        g.totalGrams += r.amount || 0;
        g.history.push({ timestamp: r.timestamp, grams: r.amount || 0 });
        if (r.timestamp > g.latestTimestamp) {
          g.latestTimestamp = r.timestamp;
          g.latestGrams = r.amount || 0;
        }
      });

    return Array.from(map.values())
      .map(g => ({ ...g, history: [...g.history].sort((a, b) => b.timestamp - a.timestamp) }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  const handleLongPress = useCallback((label: string) => {
    setExpandedFood(prev => (prev === label ? null : label));
    try { navigator.vibrate?.(15); } catch {}
  }, []);

  const startPress = useCallback((label: string) => {
    touchMovedRef.current = false;
    timerRef.current = setTimeout(() => {
      if (!touchMovedRef.current) handleLongPress(label);
    }, LONG_PRESS_MS);
  }, [handleLongPress]);

  const cancelPress = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <span className="text-5xl">🥣</span>
        <p className="text-slate-400 dark:text-slate-500 text-sm">還沒有副食品記錄</p>
        <p className="text-slate-300 dark:text-slate-600 text-xs">從日常頁點「＋」新增副食品記錄</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map(g => (
        <div key={g.label}>
          <div
            className={`bg-white dark:bg-slate-800 rounded-2xl px-5 py-4 shadow-sm border border-slate-100 dark:border-slate-700 select-none cursor-pointer active:scale-[0.98] transition-transform duration-150 ${
              expandedFood === g.label ? 'rounded-b-none border-b-0' : ''
            }`}
            onTouchStart={() => startPress(g.label)}
            onTouchMove={() => { touchMovedRef.current = true; cancelPress(); }}
            onTouchEnd={cancelPress}
            onContextMenu={e => { e.preventDefault(); handleLongPress(g.label); }}
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-slate-800 dark:text-slate-100">{g.label}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">長按展開</span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              <span>共 <b className="text-slate-700 dark:text-slate-200">{g.count}</b> 次</span>
              <span>·</span>
              <span>總計 <b className="text-slate-700 dark:text-slate-200">{g.totalGrams}g</b></span>
            </div>
            <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              最近：{formatTime(g.latestTimestamp)} · {g.latestGrams}g
            </div>
          </div>

          {expandedFood === g.label && (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-b-2xl border border-t-0 border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
              {g.history.map((h, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{formatTime(h.timestamp)}</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{h.grams}g</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
