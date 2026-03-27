import React from 'react';
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
    yesterday: {
      milkTotal: number;
      sleepMins: number;
    };
  };
}

const InsightTag: React.FC<{
  value: number;
  unit: string;
  compareValue: number;
}> = ({ value, unit, compareValue }) => {
  if (compareValue === 0) return null;
  const diff = value - compareValue;
  if (diff === 0) return <span className="text-xs text-slate-400">與昨日持平</span>;
  const isPositive = diff > 0;
  const colorClass = isPositive ? 'text-emerald-500' : 'text-rose-500';
  const icon = isPositive ? '📈' : '📉';
  const sign = isPositive ? '+' : '';
  return (
    <span className={`text-xs ${colorClass} animate-in fade-in slide-in-from-top-1 duration-500`}>
      {sign}{diff}{unit} ({sign}{((diff / compareValue) * 100).toFixed(0)}%) {icon}
    </span>
  );
};

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  searchDate, setSearchDate, isTodaySearch, stats,
}) => {
  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex flex-col text-left">
          <span className="text-xs text-slate-400 uppercase tracking-widest mb-1 ml-1">選擇日期</span>
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="text-indigo-600 bg-transparent outline-none text-base font-bold"
          />
        </div>
        {!isTodaySearch && (
          <button
            onClick={() => setSearchDate(new Date().toLocaleDateString('en-CA'))}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs shadow-lg active:scale-95 transition-all font-semibold"
          >
            回今天
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border-b-4 border-indigo-500/30 flex justify-between items-center px-8">
          <div className="text-left">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
              {isTodaySearch ? '今日' : new Date(searchDate).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}總奶量
            </p>
            <InsightTag value={stats.milkTotal} unit="ml" compareValue={stats.yesterday.milkTotal} />
          </div>
          <p className="text-4xl text-indigo-600 tracking-tighter font-bold">
            {stats.milkTotal}
            <span className="text-sm ml-1 opacity-40 font-normal">ml</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border-b-4 border-purple-500/30 text-center flex flex-col justify-between min-h-[120px]">
          <div>
            <p className="text-xs text-slate-400 uppercase mb-1">睡眠時數</p>
            <p className="text-2xl text-purple-600 tracking-tighter font-bold mb-1">
              {stats.sleepH}h{stats.sleepM}m
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <InsightTag
              value={stats.sleepH * 60 + stats.sleepM}
              unit="m"
              compareValue={stats.yesterday.sleepMins}
            />
            {stats.maxSleepSession > 0 && (
              <p className="text-xs text-slate-300 uppercase">
                最長一覺: {Math.floor(stats.maxSleepSession / 60)}h{stats.maxSleepSession % 60}m
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border-b-4 border-emerald-500/30 text-center flex flex-col justify-between min-h-[120px]">
          <div>
            <p className="text-xs text-slate-400 uppercase mb-1">最新成長</p>
            <p className="text-sm text-emerald-600 tracking-tighter font-bold">
              {stats.latestGrowth
                ? `${stats.latestGrowth.weight}kg / ${stats.latestGrowth.height}cm`
                : '尚無數據'}
            </p>
          </div>
          {stats.daysSinceGrowth !== null && (
            <p className={`text-xs uppercase ${stats.daysSinceGrowth > 14 ? 'text-rose-400' : 'text-slate-300'}`}>
              {stats.daysSinceGrowth === 0 ? '今日量測' : `${stats.daysSinceGrowth} 天前量測`}
            </p>
          )}
        </div>
      </div>
    </>
  );
};
