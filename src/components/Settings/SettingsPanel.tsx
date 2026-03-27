import React, { useRef, useState } from 'react';
import type { BabyInfo, Record } from '../../types';
import { DebugConsole } from './DebugConsole';

interface SettingsPanelProps {
  babyInfo: BabyInfo;
  setBabyInfo: (info: BabyInfo) => void;
  records: Record[];
  setRecords: (records: Record[]) => void;
  isConnected: boolean;
  isSyncing?: boolean;
  syncError?: string | null;
  onFullSync?: () => void;
  handleExportCSV: () => void;
  handleImportCSV: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  babyInfo, setBabyInfo, records, setRecords,
  isConnected, isSyncing, syncError, onFullSync,
  handleExportCSV, handleImportCSV, onImageUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [showDebug, setShowDebug] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAllData = () => {
    if (window.confirm('確定要清空所有紀錄嗎？')) setRecords([]);
  };
  const resetBabyInfo = () => {
    if (window.confirm('確定要重設寶寶資訊嗎？')) { localStorage.clear(); window.location.reload(); }
  };

  const inputCls = "w-full p-4 bg-slate-50 dark:bg-slate-700 dark:text-slate-200 rounded-xl outline-none text-sm border border-slate-100 dark:border-slate-600";
  const cardCls = "bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4";
  const actionBtnCls = "w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-100 dark:border-slate-600 active:scale-[0.98] transition-all";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Avatar & Name */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 text-center">
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 rounded-2xl bg-indigo-50 border-4 border-white shadow-xl overflow-hidden mx-auto transition-transform active:scale-95">
            {babyInfo.avatar ? (
              <img src={babyInfo.avatar} className="w-full h-full object-cover" />
            ) : (
              <div className="text-5xl mt-4">👶</div>
            )}
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2.5 rounded-xl shadow-xl border-4 border-white active:scale-90 transition-all">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          </button>
          <input type="file" ref={fileInputRef} onChange={onImageUpload} accept="image/*" className="hidden" />
        </div>
        <h2 className="text-2xl text-slate-900 dark:text-slate-100 tracking-tighter mb-1 font-bold">{babyInfo.name}</h2>
        <p className="text-xs text-slate-400 uppercase tracking-widest">寶寶個人設定</p>
      </div>

      {/* Sync Settings */}
      <div className={cardCls}>
        <h3 className="text-xs text-slate-400 uppercase tracking-widest px-1 font-semibold">雲端同步設定</h3>
        <input type="text" value={babyInfo.syncUrl || ''} onChange={(e) => setBabyInfo({ ...babyInfo, syncUrl: e.target.value })} placeholder="同步伺服器 URL" className={inputCls} />
        <input type="password" value={babyInfo.syncSecret || ''} onChange={(e) => setBabyInfo({ ...babyInfo, syncSecret: e.target.value })} placeholder="同步密碼" className={inputCls} />
        {isConnected && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className={`w-2 h-2 rounded-full ${syncError ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              <span className={`text-xs ${syncError ? 'text-rose-500' : 'text-emerald-500'}`}>{syncError ? '同步異常' : '已連線'}</span>
            </div>
            <button onClick={onFullSync} disabled={isSyncing} className="w-full py-3 bg-white dark:bg-slate-700 border-2 border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs uppercase flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 font-semibold">
              <span className={isSyncing ? 'animate-spin' : ''}>🔄</span>
              {isSyncing ? '同步中...' : '立即雙向同步'}
            </button>
            <p className="text-xs text-slate-400 text-center">自動同步已啟動</p>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className={cardCls}>
        <h3 className="text-xs text-slate-400 uppercase tracking-widest px-1 font-semibold">偏好設定</h3>
        <div className="flex items-center justify-between px-1">
          <span className="text-sm text-slate-600 dark:text-slate-300">餵奶間隔</span>
          <div className="flex items-center gap-2">
            {[2, 3, 4, 5].map(h => (
              <button key={h} onClick={() => setBabyInfo({ ...babyInfo, feedIntervalHours: h })}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all font-semibold ${
                  (babyInfo.feedIntervalHours || 4) === h ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-700 text-slate-400'
                }`}
              >{h}hr</button>
            ))}
          </div>
        </div>
        <input type="text" value={babyInfo.deviceName || ''} onChange={(e) => setBabyInfo({ ...babyInfo, deviceName: e.target.value })} placeholder="裝置名稱（例：爸爸的手機）" className={inputCls} />
      </div>

      {/* Data Management */}
      <div className={cardCls}>
        <button onClick={handleExportCSV} className={actionBtnCls}>
          <span className="text-sm">📥 匯出資料 (CSV)</span>
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-600 flex items-center justify-center shadow-sm text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{records.length}</div>
        </button>
        <button onClick={() => csvInputRef.current?.click()} className={`${actionBtnCls} text-sm text-left`}>📤 匯入歷史資料</button>
        <input type="file" ref={csvInputRef} onChange={handleImportCSV} accept=".csv" className="hidden" />
        <button onClick={clearAllData} className="w-full p-5 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 active:scale-[0.98] text-sm text-left transition-all">
          🗑️ 清除所有數據
        </button>
      </div>

      {/* Footer */}
      <div className="text-center">
        <button onClick={resetBabyInfo} className="w-full p-5 bg-slate-200 dark:bg-slate-700 text-slate-500 rounded-2xl text-xs uppercase active:scale-95 transition-all">重新設定寶寶</button>
        <p
          className="mt-6 text-xs text-slate-300 tracking-widest uppercase select-none"
          onTouchStart={() => { longPressTimer.current = setTimeout(() => setShowDebug(true), 1500); }}
          onTouchEnd={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
          onMouseDown={() => { longPressTimer.current = setTimeout(() => setShowDebug(true), 1500); }}
          onMouseUp={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
          onMouseLeave={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
        >v10.0 (20260327)</p>
      </div>

      {showDebug && <DebugConsole babyInfo={babyInfo} onClose={() => setShowDebug(false)} />}
    </div>
  );
};
