import { useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

/**
 * 有新版本時的提示。原本是在 main.tsx 用 document.createElement + innerHTML
 * 直接塞進 body，沒有關閉鈕、位置會壓到 header，而且完全繞過 React。
 */
export const UpdatePrompt = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const updateSWRef = useRef<((reload?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    // registerSW 只能註冊一次；StrictMode 下 effect 會跑兩次，用 ref 擋掉
    if (updateSWRef.current) return;
    updateSWRef.current = registerSW({
      onNeedRefresh: () => setNeedRefresh(true),
      onOfflineReady: () => {},
    });
  }, []);

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      className="fixed left-1/2 -translate-x-1/2 z-[300] top-[calc(1rem+env(safe-area-inset-top))] animate-in slide-in-from-top-4 fade-in duration-300"
    >
      <div className="bg-indigo-600 text-white pl-5 pr-2 py-2 rounded-full shadow-2xl text-xs flex items-center gap-3 border border-white/10">
        <span>有新版本可用</span>
        <button
          onClick={() => updateSWRef.current?.(true)}
          className="bg-white text-indigo-600 px-4 py-1.5 rounded-full text-[10px] uppercase font-bold active:scale-95 transition-transform"
        >
          更新
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          aria-label="稍後再更新"
          className="text-indigo-200 px-2 py-1 active:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
