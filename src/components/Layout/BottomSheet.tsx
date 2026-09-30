import React, { useEffect } from 'react';
import { motion, AnimatePresence, useDragControls, type PanInfo } from 'framer-motion';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

// 往下拖超過這個距離、或甩得夠快就關閉
const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 500;

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, children, title }) => {
  // 只從抓手區啟動拖曳（dragListener={false}），否則內容區的捲動會跟拖曳打架
  const dragControls = useDragControls();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      history.pushState({ bottomSheet: true }, '');
      const onPopState = () => onClose();
      window.addEventListener('popstate', onPopState);
      return () => {
        window.removeEventListener('popstate', onPopState);
        if (!document.body.dataset.dragLock) document.body.style.overflow = '';
      };
    } else if (!document.body.dataset.dragLock) {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > CLOSE_DISTANCE || info.velocity.y > CLOSE_VELOCITY) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div data-bottom-sheet className="fixed inset-0 z-[100] flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            // 上下都約束在 0，往下用 elastic 近似 1:1 跟手，放手沒過門檻會自己彈回
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.9 }}
            onDragEnd={handleDragEnd}
            className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl max-h-[90dvh] overflow-y-auto overscroll-contain flex flex-col"
          >
            <div
              onPointerDown={(e) => dragControls.start(e)}
              // touch-action: none 這塊才抓得動；內容區不設，留給捲動
              style={{ touchAction: 'none' }}
              className="flex flex-col items-center py-4 sticky top-0 bg-white dark:bg-slate-800 z-10 select-none cursor-grab active:cursor-grabbing"
            >
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full mb-2" />
              {title && <h3 className="text-sm text-slate-400 uppercase tracking-widest">{title}</h3>}
            </div>
            <div className="px-6 pb-[calc(3rem+env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
