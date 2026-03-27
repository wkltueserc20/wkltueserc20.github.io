import React from 'react';
import type { Record, MilkType } from '../../types';
import { formatTimeWithPeriod } from '../../utils/dateUtils';

interface QuickRecordProps {
  records: Record[];
  onQuickFeed: (milkType: MilkType, amount: number) => void;
}

const formatRelative = (ts: number): string => {
  const diff = Date.now() - ts;
  if (diff < 60000) return '剛剛';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分鐘前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小時前`;
  return `${Math.floor(diff / 86400000)} 天前`;
};

export const QuickRecord: React.FC<QuickRecordProps> = ({ records, onQuickFeed }) => {
  const lastFeed = records.find(r => !r.isDeleted && r.type === 'feeding');
  const lastMilkType = lastFeed?.milkType || 'formula';
  const lastAmount = lastFeed?.amount || 180;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      {lastFeed && (
        <div className="flex items-center gap-2 px-1 mb-3 text-xs text-slate-400">
          <span>上次：{formatTimeWithPeriod(lastFeed.timestamp)}</span>
          <span>·</span>
          <span>{lastAmount}ml {lastMilkType === 'formula' ? '配方' : '母奶'}</span>
          <span>·</span>
          <span>{formatRelative(lastFeed.timestamp)}</span>
        </div>
      )}
      <p className="text-xs text-slate-400 uppercase tracking-widest mb-3 px-1 font-semibold">快速紀錄</p>
      <div className="flex gap-2">
        <button
          onClick={() => onQuickFeed(lastMilkType as MilkType, lastAmount)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl active:scale-95 transition-all font-semibold"
        >
          <span>{lastMilkType === 'formula' ? '🍼' : '🤱'}</span>
          <span className="text-sm">{lastAmount}ml</span>
        </button>
        <button
          onClick={() => onQuickFeed(lastMilkType === 'formula' ? 'breast' : 'formula', lastAmount)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl active:scale-95 transition-all font-semibold"
        >
          <span>{lastMilkType === 'formula' ? '🤱' : '🍼'}</span>
          <span className="text-sm">{lastMilkType === 'formula' ? '母奶' : '配方'}{lastAmount}ml</span>
        </button>
      </div>
    </div>
  );
};
