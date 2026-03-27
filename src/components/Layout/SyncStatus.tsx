import React, { useState, useEffect } from 'react';

interface SyncStatusProps {
  isSyncing: boolean;
  syncError?: string | null;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ isSyncing, syncError }) => {
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    if (!isSyncing && !syncError) {
      setShowCheck(true);
      const timer = setTimeout(() => setShowCheck(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSyncing, syncError]);

  if (!isSyncing && !showCheck && !syncError) return null;

  if (syncError) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/30 backdrop-blur-md rounded-full border border-rose-100 dark:border-rose-800 shadow-sm animate-in fade-in zoom-in duration-300">
        <span className="text-xs">⚠️</span>
        <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-tighter">Error</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 dark:bg-slate-700/50 backdrop-blur-md rounded-full border border-slate-100 dark:border-slate-600 shadow-sm animate-in fade-in zoom-in duration-300">
      {isSyncing ? (
        <>
          <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-tighter">Sync</span>
        </>
      ) : (
        <>
          <span className="text-xs">✨</span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-tighter">OK</span>
        </>
      )}
    </div>
  );
};
