import { useState, useEffect, useMemo } from 'react';
import type { Record } from '../../types';
import { formatTimeWithPeriod } from '../../utils/dateUtils';

const MS_PER_HOUR = 3600000;
const MS_PER_MIN = 60000;

interface FeedCountdownProps {
  records: Record[];
  feedIntervalMs: number;
  staleMs?: number;
}

export const FeedCountdown: React.FC<FeedCountdownProps> = ({
  records, feedIntervalMs, staleMs = 12 * MS_PER_HOUR,
}) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    const start = () => { timer = setInterval(() => setNow(Date.now()), 1000); };
    const stop = () => clearInterval(timer);
    const onVis = () => (document.visibilityState === 'visible' ? start() : stop());
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  const feed = useMemo(() => {
    const last = records.find((r) => !r.isDeleted && r.type === 'feeding');
    if (!last) return null;
    const hr = new Date(last.timestamp).getHours();
    if (hr === 23 || hr === 0) return { skip: true as const };
    const target = last.timestamp + feedIntervalMs;
    const diff = target - now;
    if (diff <= -staleMs) return null;
    const abs = Math.abs(diff);
    const elapsed = now - last.timestamp;
    const progress = Math.min(1, Math.max(0, elapsed / feedIntervalMs));
    return {
      skip: false as const,
      str: `${Math.floor(abs / MS_PER_HOUR)}h ${Math.floor((abs % MS_PER_HOUR) / MS_PER_MIN)}m`,
      isOver: diff < 0,
      targetStr: formatTimeWithPeriod(target),
      progress,
    };
  }, [records, now, feedIntervalMs, staleMs]);

  if (!feed) return null;

  return (
    <div
      className={`p-6 rounded-2xl shadow-sm border-2 transition-all ${
        feed.skip
          ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
          : feed.isOver
          ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
          : 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="text-left">
          <p className="text-xs uppercase opacity-60 mb-1">
            {feed.skip ? '長睡眠時段' : `下餐預計 ${feed.targetStr}`}
          </p>
          <p className="text-3xl tracking-tighter font-bold">
            {feed.skip ? '🌙 靜音中' : feed.str}
          </p>
        </div>
        <div className="text-3xl">{feed.skip ? '😴' : feed.isOver ? '⚠️' : '🍼'}</div>
      </div>
      {!feed.skip && (
        <div className="mt-3 h-2 bg-white/60 dark:bg-slate-700/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              feed.isOver ? 'bg-rose-400' : 'bg-indigo-400'
            }`}
            style={{ width: `${Math.min(100, feed.progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};
