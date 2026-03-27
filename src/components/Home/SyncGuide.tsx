import React from 'react';

interface SyncGuideProps {
  onGoToSettings: () => void;
  onDismiss: () => void;
}

export const SyncGuide: React.FC<SyncGuideProps> = ({ onGoToSettings, onDismiss }) => (
  <div className="bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-6 space-y-4">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">☁️</span>
        <div>
          <p className="text-sm text-indigo-700 font-semibold">設定雲端同步</p>
          <p className="text-xs text-indigo-400">在多台手機共享寶寶紀錄</p>
        </div>
      </div>
      <button onClick={onDismiss} className="text-indigo-300 text-xs active:scale-90 transition-all p-1" aria-label="關閉提示">✕</button>
    </div>
    <button
      onClick={onGoToSettings}
      className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs uppercase active:scale-95 transition-all shadow-md font-semibold"
    >
      前往設定
    </button>
  </div>
);
