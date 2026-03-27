import { useMemo, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { Record } from '../../types';
import { isSameDay, getRecordTargetTs } from '../../utils/dateUtils';

interface StatsTabProps {
  records: Record[];
}

export const StatsTab: React.FC<StatsTabProps> = ({ records }) => {
  const [statsRange, setStatsRange] = useState(7);

  const milkChartData = useMemo(() => {
    const data = [];
    for (let i = statsRange - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      const dayTotal = records
        .filter((r) => !r.isDeleted && isSameDay(r.timestamp, dateStr) && r.type === 'feeding')
        .reduce((s, r) => s + (r.amount || 0), 0);
      data.push({
        name: d.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }),
        amount: dayTotal,
      });
    }
    return data;
  }, [records, statsRange]);

  const sleepChartData = useMemo(() => {
    const data = [];
    for (let i = statsRange - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      const mins = records
        .filter((r) => !r.isDeleted && r.type === 'sleep' && isSameDay(getRecordTargetTs(r), dateStr))
        .reduce((s, r) => s + (r.amount || 0), 0);
      data.push({
        name: d.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }),
        hours: parseFloat((mins / 60).toFixed(1)),
      });
    }
    return data;
  }, [records, statsRange]);

  const growthChartData = useMemo(
    () =>
      records
        .filter((r) => !r.isDeleted && r.type === 'growth')
        .sort((a, b) => a.timestamp - b.timestamp)
        .map((r) => ({
          date: new Date(r.timestamp).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }),
          weight: r.weight,
          height: r.height,
        })),
    [records]
  );

  const barSize = statsRange > 14 ? 12 : 28;
  const tickFontSize = statsRange > 14 ? 8 : 10;

  return (
    <div className="space-y-7 pb-16 animate-in fade-in duration-700 text-slate-800">
      <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-1" role="tablist" aria-label="統計時間區間">
        {[7, 14, 28].map((range) => (
          <button
            key={range}
            role="tab"
            aria-selected={statsRange === range}
            onClick={() => setStatsRange(range)}
            className={`flex-1 py-3.5 rounded-xl text-[11px] uppercase transition-all ${
              statsRange === range
                ? 'bg-slate-900 text-white shadow-lg scale-[1.02]'
                : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            {range} Days
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 p-7 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-[11px] text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-2 text-left">
          <div className="w-2 h-5 bg-indigo-500 rounded-full" /> 每日奶量 (ml)
        </h2>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={milkChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: tickFontSize, fill: '#94a3b8', fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
              <Tooltip cursor={{ fill: '#F8FAFC', radius: 12 }} />
              <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 8, 8]} barSize={barSize} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-7 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-[11px] text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-2 text-left">
          <div className="w-2 h-5 bg-purple-500 rounded-full" /> 每日睡眠 (hrs)
        </h2>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sleepChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: tickFontSize, fill: '#94a3b8', fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
              <Tooltip cursor={{ fill: '#F8FAFC', radius: 12 }} />
              <Bar dataKey="hours" fill="#a855f7" radius={[8, 8, 8, 8]} barSize={barSize} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-7 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-left">
        <h2 className="text-[11px] text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-2">
          <div className="w-2 h-5 bg-emerald-500 rounded-full" /> 成長曲線紀錄
        </h2>
        {growthChartData.length > 0 ? (
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                <YAxis yAxisId="left" stroke="#10b981" tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" tick={{ fontSize: 10, fontWeight: 700 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingTop: '25px' }} />
                <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={5} dot={{ r: 5, fill: '#fff', strokeWidth: 4 }} name="體重(kg)" />
                <Line yAxisId="right" type="monotone" dataKey="height" stroke="#3b82f6" strokeWidth={5} dot={{ r: 5, fill: '#fff', strokeWidth: 4 }} name="身高(cm)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <span className="text-4xl opacity-30">🌱</span>
            <p className="text-xs text-slate-300 uppercase tracking-widest">尚未記錄成長數據</p>
          </div>
        )}
      </div>
    </div>
  );
};
