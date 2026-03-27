import { useState } from 'react';
import type { BabyInfo } from '../../types';

interface DebugConsoleProps {
  babyInfo: BabyInfo;
  onClose: () => void;
}

interface QueryRecord {
  id: string;
  type: string;
  milkType?: string | null;
  time: string;
  timestamp: number;
  endTimestamp?: number | null;
  amount?: number | null;
  weight?: number | null;
  height?: number | null;
  note?: string;
  updatedAt: number;
  isDeleted?: boolean;
}

export const DebugConsole: React.FC<DebugConsoleProps> = ({ babyInfo, onClose }) => {
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [type, setType] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [limit, setLimit] = useState(50);
  const [results, setResults] = useState<QueryRecord[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuery = async () => {
    if (!babyInfo.syncUrl || !babyInfo.syncSecret) {
      setError('未設定同步 URL 或密碼');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const body: Record<string, unknown> = { syncSecret: babyInfo.syncSecret, includeDeleted, limit };
      if (date) body.date = date;
      if (type) body.type = type;
      const res = await fetch(`${babyInfo.syncUrl}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setResults(data.records);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || 'Query failed');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full p-3 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 rounded-xl outline-none text-xs border border-slate-100 dark:border-slate-600";

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Debug Console</h3>
        <button onClick={onClose} className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 active:scale-90 transition-all">✕</button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1 font-semibold">日期</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1 font-semibold">類型</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
              <option value="">全部</option>
              <option value="feeding">餵奶</option>
              <option value="sleep">睡眠</option>
              <option value="growth">成長</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-600 dark:text-slate-300">顯示已刪除</label>
            <button
              onClick={() => setIncludeDeleted(!includeDeleted)}
              className={`w-10 h-5 rounded-full transition-colors relative ${includeDeleted ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${includeDeleted ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">筆數</label>
            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="p-2 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 rounded-lg text-xs border border-slate-100 dark:border-slate-600">
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>

        <button onClick={handleQuery} disabled={loading} className="w-full py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-xs uppercase active:scale-95 transition-all disabled:opacity-50 font-semibold">
          {loading ? '查詢中...' : '查詢 D1'}
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs">{error}</div>
      )}

      {results !== null && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400 uppercase tracking-wider px-1">共 {total} 筆，顯示 {results.length} 筆</div>
          {results.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center text-xs text-slate-300 border border-slate-100 dark:border-slate-700">無資料</div>
          ) : (
            results.map((r) => (
              <div key={r.id} className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border text-left space-y-1 ${r.isDeleted ? 'border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-900/10' : 'border-slate-100 dark:border-slate-700'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-lg uppercase font-semibold ${
                    r.type === 'feeding' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' :
                    r.type === 'sleep' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {r.type}{r.milkType ? ` (${r.milkType})` : ''}
                  </span>
                  {r.isDeleted && <span className="text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-500 px-2 py-0.5 rounded-lg">DELETED</span>}
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300">{r.time}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-400">
                  {r.amount != null && <div>amount: {r.amount}</div>}
                  {r.weight != null && <div>weight: {r.weight}</div>}
                  {r.height != null && <div>height: {r.height}</div>}
                  {r.note && <div className="col-span-2">note: {r.note}</div>}
                  <div>updated: {new Date(r.updatedAt).toLocaleString('zh-TW')}</div>
                  <div className="truncate" title={r.id}>id: {r.id.slice(0, 8)}...</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
