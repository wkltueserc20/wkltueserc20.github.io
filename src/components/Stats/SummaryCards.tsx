import React, { useState, useRef } from 'react';
import type { Record } from '../../types';

interface SummaryCardsProps {
  searchDate: string;
  setSearchDate: (date: string) => void;
  isTodaySearch: boolean;
  stats: {
    milkTotal: number;
    sleepH: number;
    sleepM: number;
    maxSleepSession: number;
    latestGrowth?: Record;
    daysSinceGrowth: number | null;
    maxTemp: number | null;
    tempCount: number;
    yesterday: {
      milkTotal: number;
      sleepMins: number;
    };
  };
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  searchDate, setSearchDate, isTodaySearch, stats,
}) => {
  const [showDetail, setShowDetail] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = (offset: number) => {
    const d = new Date(searchDate + 'T00:00:00');
    d.setDate(d.getDate() + offset);
    setSearchDate(d.toLocaleDateString('en-CA'));
  };

  const dateLabel = (() => {
    if (isTodaySearch) return '今天';
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    if (searchDate === yest.toLocaleDateString('en-CA')) return '昨天';
    return new Date(searchDate + 'T00:00:00').toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
  })();

  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => setShowDetail(true), 500);
  };
  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const hasSleep = stats.sleepH > 0 || stats.sleepM > 0;
  const isFever = stats.maxTemp !== null && stats.maxTemp >= 37.5;
  const sleepTotalMins = stats.sleepH * 60 + stats.sleepM;
  const milkDiff = stats.milkTotal - stats.yesterday.milkTotal;
  const sleepDiff = sleepTotalMins - stats.yesterday.sleepMins;

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {/* Date navigation */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <button
            onClick={() => goTo(-1)}
            className="w-8 h-8 flex items-center justify-center text-slate-300 dark:text-slate-500 active:scale-90 transition-all text-xs"
          >
            ◀
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{dateLabel}</span>
            {!isTodaySearch && (
              <button
                onClick={() => setSearchDate(new Date().toLocaleDateString('en-CA'))}
                className="text-[10px] text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md font-semibold"
              >
                回今天
              </button>
            )}
          </div>
          <button
            onClick={() => goTo(1)}
            disabled={isTodaySearch}
            className="w-8 h-8 flex items-center justify-center text-slate-300 dark:text-slate-500 active:scale-90 transition-all text-xs disabled:opacity-20"
          >
            ▶
          </button>
        </div>

        {/* Compact stats row */}
        <div
          className="flex items-center justify-around px-4 pb-3 select-none"
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
        >
          <div className="flex flex-col items-center gap-0.5 min-w-[52px]">
            <span className="text-xl">🍼</span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 leading-none">
              {stats.milkTotal > 0 ? stats.milkTotal : '—'}
            </span>
            <span className="text-[9px] text-slate-400 uppercase tracking-wide">ml</span>
          </div>

          <div className="w-px h-8 bg-slate-100 dark:bg-slate-700" />

          <div className="flex flex-col items-center gap-0.5 min-w-[52px]">
            <span className="text-xl">💤</span>
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400 leading-none">
              {hasSleep ? `${stats.sleepH}h${stats.sleepM}m` : '—'}
            </span>
            <span className="text-[9px] text-slate-400 uppercase tracking-wide">睡眠</span>
          </div>

          {stats.maxTemp !== null && (
            <>
              <div className="w-px h-8 bg-slate-100 dark:bg-slate-700" />
              <div className="flex flex-col items-center gap-0.5 min-w-[52px]">
                <span className="text-xl">🌡️</span>
                <span className={`text-sm font-bold leading-none ${isFever ? 'text-rose-600 dark:text-rose-400' : 'text-orange-500 dark:text-orange-400'}`}>
                  {stats.maxTemp.toFixed(1)}
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wide">°C</span>
              </div>
            </>
          )}

          {stats.latestGrowth && (
            <>
              <div className="w-px h-8 bg-slate-100 dark:bg-slate-700" />
              <div className="flex flex-col items-center gap-0.5 min-w-[52px]">
                <span className="text-xl">🌱</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-none">
                  {stats.latestGrowth.weight}kg
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wide">成長</span>
              </div>
            </>
          )}
        </div>

        <div className="pb-2 text-center">
          <span className="text-[9px] text-slate-300 dark:text-slate-600 uppercase tracking-widest">長按查看詳情</span>
        </div>
      </div>

      {/* Detail modal */}
      {showDetail && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center p-4" onClick={() => setShowDetail(false)}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div
            className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-sm space-y-1"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{dateLabel} 摘要</span>
              <button onClick={() => setShowDetail(false)} className="text-slate-400 active:scale-90">✕</button>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span>🍼</span>
                <span className="text-sm text-slate-600 dark:text-slate-300">奶量</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{stats.milkTotal} ml</div>
                {stats.yesterday.milkTotal > 0 && (
                  <div className={`text-xs ${milkDiff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    比昨天 {milkDiff >= 0 ? '+' : ''}{milkDiff} ml
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span>💤</span>
                <span className="text-sm text-slate-600 dark:text-slate-300">睡眠</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-purple-600 dark:text-purple-400">{stats.sleepH}h {stats.sleepM}m</div>
                {stats.maxSleepSession > 0 && (
                  <div className="text-xs text-slate-400">最長一覺 {Math.floor(stats.maxSleepSession / 60)}h{stats.maxSleepSession % 60}m</div>
                )}
                {stats.yesterday.sleepMins > 0 && (
                  <div className={`text-xs ${sleepDiff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    比昨天 {sleepDiff >= 0 ? '+' : ''}{sleepDiff} m
                  </div>
                )}
              </div>
            </div>

            {stats.maxTemp !== null && (
              <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span>🌡️</span>
                  <span className="text-sm text-slate-600 dark:text-slate-300">體溫</span>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${isFever ? 'text-rose-600 dark:text-rose-400' : 'text-orange-500'}`}>
                    最高 {stats.maxTemp.toFixed(1)}°C{isFever ? ' ⚠️' : ''}
                  </div>
                  <div className="text-xs text-slate-400">共量測 {stats.tempCount} 次</div>
                </div>
              </div>
            )}

            {stats.latestGrowth && (
              <div className="flex justify-between items-center py-3">
                <div className="flex items-center gap-2">
                  <span>🌱</span>
                  <span className="text-sm text-slate-600 dark:text-slate-300">成長</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {stats.latestGrowth.weight}kg / {stats.latestGrowth.height}cm
                  </div>
                  {stats.daysSinceGrowth !== null && (
                    <div className={`text-xs ${stats.daysSinceGrowth > 14 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {stats.daysSinceGrowth === 0 ? '今日量測' : `${stats.daysSinceGrowth} 天前量測`}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
