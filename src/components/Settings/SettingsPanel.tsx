import React, { useRef } from 'react';
import type { BabyInfo, Record } from '../../types';

interface SettingsPanelProps {
  babyInfo: BabyInfo;
  setBabyInfo: (info: BabyInfo) => void;
  records: Record[];
  setRecords: (records: Record[]) => void;
  accessToken: string | null;
  isSyncing?: boolean;
  onFullSync?: () => void;
  handleGoogleLogin: () => void;
  handleExportCSV: () => void;
  handleImportCSV: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendLineTest: () => void;
  onCallGasTest: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  babyInfo,
  setBabyInfo,
  records,
  setRecords,
  accessToken,
  isSyncing,
  onFullSync,
  handleGoogleLogin,
  handleExportCSV,
  handleImportCSV,
  onImageUpload,
  onSendLineTest,
  onCallGasTest,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const clearAllData = () => {
    if (window.confirm('⚠️ 警告：確定要清空所有紀錄嗎？')) {
      setRecords([]);
    }
  };

  const resetBabyInfo = () => {
    if (window.confirm('確定要重設寶寶資訊嗎？')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-500 font-black">
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 text-center font-black">
        <div className="relative inline-block mb-6 font-black">
          <div className="w-28 h-28 rounded-[2.25rem] bg-indigo-50 border-4 border-white shadow-2xl overflow-hidden mx-auto transition-transform active:scale-95 font-black">
            {babyInfo.avatar ? (
              <img src={babyInfo.avatar} className="w-full h-full object-cover font-black" />
            ) : (
              <div className="text-5xl mt-6 font-black">👶</div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-3 -right-3 bg-indigo-600 text-white p-3 rounded-2xl shadow-2xl border-4 border-white active:scale-90 transition-all font-black"
          >
            <svg className="w-5 h-5 font-black" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImageUpload}
            accept="image/*"
            className="hidden font-black"
          />
        </div>
        <h2 className="text-3xl text-slate-900 tracking-tighter mb-1 font-black">
          {babyInfo.name}
        </h2>
        <p className="text-[11px] text-slate-400 uppercase tracking-widest font-black">
          寶寶個人設定
        </p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100 space-y-4 font-black">
        <h3 className="text-[10px] text-slate-400 uppercase tracking-widest px-1 font-black">
          LINE 雲端排程設定 (GAS)
        </h3>
        <div className="flex items-center justify-between p-2 font-black">
          <span className="text-sm font-black">啟用自動通知功能</span>
          <button
            onClick={() => setBabyInfo({ ...babyInfo, lineEnabled: !babyInfo.lineEnabled })}
            className={`w-12 h-6 rounded-full transition-colors relative font-black ${
              babyInfo.lineEnabled ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all font-black ${
                babyInfo.lineEnabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
        <input
          type="password"
          value={babyInfo.lineToken || ''}
          onChange={(e) => setBabyInfo({ ...babyInfo, lineToken: e.target.value })}
          placeholder="LINE Token"
          className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-xs border border-slate-100 font-black"
        />
        <input
          type="text"
          value={babyInfo.lineUserId || ''}
          onChange={(e) => setBabyInfo({ ...babyInfo, lineUserId: e.target.value })}
          placeholder="LINE User ID"
          className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-xs border border-slate-100 font-black"
        />
        <input
          type="text"
          value={babyInfo.gasUrl || ''}
          onChange={(e) => setBabyInfo({ ...babyInfo, gasUrl: e.target.value })}
          placeholder="GAS URL"
          className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-xs border border-slate-100 font-black"
        />
        <input
          type="password"
          value={babyInfo.syncSecret || ''}
          onChange={(e) => setBabyInfo({ ...babyInfo, syncSecret: e.target.value })}
          placeholder="GAS 通訊密鑰 (SYNC_SECRET)"
          className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-xs border border-slate-100 font-black"
        />
        <div className="grid grid-cols-2 gap-3 font-black">
          <button
            onClick={onSendLineTest}
            className="py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase active:scale-95 transition-all font-black"
          >
            測試 LINE
          </button>
          <button
            onClick={onCallGasTest}
            className="py-3 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase active:scale-95 transition-all font-black"
          >
            測試 GAS
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100 space-y-4 font-black">
        <h3 className="text-[10px] text-slate-400 uppercase tracking-widest px-1 font-black">
          Google Drive 自動備份設定
        </h3>
        <input
          type="text"
          value={babyInfo.googleClientId || ''}
          onChange={(e) => setBabyInfo({ ...babyInfo, googleClientId: e.target.value })}
          placeholder="Google OAuth Client ID"
          className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-xs border border-slate-100 font-black"
        />
        <input
          type="text"
          value={babyInfo.googleFolderId || ''}
          onChange={(e) => setBabyInfo({ ...babyInfo, googleFolderId: e.target.value })}
          placeholder="Google Drive 資料夾 ID (選填)"
          className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-xs border border-slate-100 font-black"
        />
        <button
          onClick={handleGoogleLogin}
          className={`w-full py-4 rounded-2xl font-black text-xs uppercase transition-all ${
            accessToken ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-600 text-white shadow-lg active:scale-95'
          }`}
        >
          {accessToken ? '✅ 已建立長效雲端連結' : '🔗 連結 Google 雲端 (永久授權)'}
        </button>
        {accessToken && (
          <div className="space-y-4">
            <button
              onClick={onFullSync}
              disabled={isSyncing}
              className="w-full py-4 bg-white border-2 border-indigo-100 text-indigo-600 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <span className={isSyncing ? 'animate-spin' : ''}>🔄</span>
              {isSyncing ? '同步中...' : '立即雙向同步'}
            </button>
            <div className="text-[9px] text-slate-400 text-center uppercase tracking-widest animate-pulse">
              自動同步已啟動，每次儲存將自動更新雲端 CSV
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100 space-y-4 font-black">
        <button
          onClick={handleExportCSV}
          className="w-full flex items-center justify-between p-6 bg-slate-50 rounded-[1.75rem] border border-slate-100 active:scale-[0.98] transition-all font-black"
        >
          <span>📥 匯出資料 (CSV)</span>
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm text-xs text-indigo-600 font-black">
            {records.length}
          </div>
        </button>
        <button
          onClick={() => csvInputRef.current?.click()}
          className="w-full p-6 bg-slate-50 rounded-[1.75rem] border border-slate-100 font-black text-[11px] active:scale-[0.98] font-black uppercase tracking-wider text-left transition-all font-black"
        >
          📤 匯入歷史資料
        </button>
        <input
          type="file"
          ref={csvInputRef}
          onChange={handleImportCSV}
          accept=".csv"
          className="hidden font-black"
        />
        <button
          onClick={clearAllData}
          className="w-full p-6 bg-rose-50 rounded-[1.75rem] border border-rose-100 text-rose-600 active:scale-[0.98] font-black uppercase text-left transition-all font-black"
        >
          🗑️ 清除所有數據
        </button>
      </div>
      <div className="text-center font-black">
        <button
          onClick={resetBabyInfo}
          className="w-full p-6 bg-slate-200 text-slate-500 rounded-[1.75rem] font-black text-[11px] uppercase active:scale-95 transition-all font-black"
        >
          重新設定寶寶
        </button>
        <p className="mt-6 text-[9px] text-slate-300 tracking-[0.3em] font-black uppercase font-black">
          v9.7 (20260325)
        </p>
      </div>
    </div>
  );
};
