import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTimeWithPeriod } from '../../utils/dateUtils';

interface SleepBannerProps {
  startTime: number | null;
  onFinish: () => void;
}

export const SleepBanner: React.FC<SleepBannerProps> = ({ startTime, onFinish }) => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    if (!startTime) return;
    const update = () => {
      const diff = Date.now() - startTime;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setElapsed(`${h}h ${m}m`);
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <AnimatePresence>
      {startTime && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-indigo-600 p-6 rounded-2xl shadow-xl border border-indigo-400/30 flex items-center justify-between text-white overflow-hidden relative"
        >
          <div className="absolute -right-4 -top-4 text-6xl opacity-10 rotate-12 select-none">💤</div>
          <div className="relative z-10 flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-indigo-200">寶寶正在睡覺中...</span>
            <div className="text-xs text-indigo-300">{formatTimeWithPeriod(startTime)} 開始</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{elapsed}</span>
              <span className="text-indigo-200 text-xs">已睡覺</span>
            </div>
          </div>
          <button onClick={onFinish} aria-label="結束睡眠紀錄" className="relative z-10 bg-white text-indigo-600 px-5 py-3 rounded-xl text-xs uppercase shadow-lg active:scale-95 transition-transform font-semibold">
            起來了 ☀️
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
