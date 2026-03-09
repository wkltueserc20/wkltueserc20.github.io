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
    latestGrowth?: Record;
  };
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  searchDate,
  setSearchDate,
  isTodaySearch,
  stats,
}) => {
  return (
    <>
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex items-center justify-between font-black">
        <div className="flex flex-col text-left">
          <span className="text-[9px] text-slate-400 uppercase tracking-widest mb-1 ml-1 font-black">
            選擇日期
          </span>
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="text-indigo-600 bg-transparent outline-none text-base"
          />
        </div>
        {!isTodaySearch && (
          <button
            onClick={() => setSearchDate(new Date().toLocaleDateString('en-CA'))}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-[1.25rem] text-[10px] shadow-lg active:scale-95 transition-all font-black"
          >
            回今天
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 font-black">
        <div className="col-span-2 bg-white p-7 rounded-[2.5rem] shadow-sm border-b-4 border-indigo-500/30 text-center flex justify-between items-center px-10">
          <p className="text-[12px] text-slate-400 uppercase tracking-widest">今日總奶量</p>
          <p className="text-4xl text-indigo-600 tracking-tighter font-black">
            {stats.milkTotal}
            <span className="text-sm ml-1 opacity-40">ml</span>
          </p>
        </div>
        <div className="bg-white p-6 rounded-[2.25rem] shadow-sm border-b-4 border-purple-500/30 text-center">
          <p className="text-[10px] text-slate-400 uppercase mb-1">睡眠時數</p>
          <p className="text-2xl text-purple-600 tracking-tighter font-black">
            {stats.sleepH}h{stats.sleepM}m
          </p>
        </div>
        <div className="bg-white p-6 rounded-[2.25rem] shadow-sm border-b-4 border-emerald-500/30 text-center">
          <p className="text-[10px] text-slate-400 uppercase mb-1">最新成長</p>
          <p className="text-[15px] text-emerald-600 tracking-tighter font-black">
            {stats.latestGrowth
              ? `${stats.latestGrowth.weight}kg / ${stats.latestGrowth.height}cm`
              : '尚無數據'}
          </p>
        </div>
      </div>
    </>
  );
};
