import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface SwipeableRecordItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  onEdit: () => void;
  onLongPress?: () => void;
}

export const SwipeableRecordItem: React.FC<SwipeableRecordItemProps> = ({ children, onDelete, onEdit, onLongPress }) => {
  const [isOpen, setIsOpen] = useState(false);
  const x = useMotionValue(0);
  const MAX_DRAG = -80;
  const hasDragged = useRef(false);
  const longPressTriggered = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const opacity = useTransform(x, [0, MAX_DRAG], [0, 1]);

  const clearLongPress = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  };

  const handleDragStart = () => {
    hasDragged.current = true;
    clearLongPress();
    document.body.dataset.dragLock = 'true';
    document.body.style.overflow = 'hidden';
  };

  const handleDragEnd = (_: any, info: any) => {
    delete document.body.dataset.dragLock;
    if (!document.querySelector('[data-bottom-sheet]')) {
      document.body.style.overflow = '';
    }
    const shouldOpen = info.offset.x < -30 || info.velocity.x < -300;
    setIsOpen(shouldOpen);
    if (!shouldOpen) x.set(0);
  };

  const variants = {
    closed: { x: 0 },
    open: { x: MAX_DRAG }
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-rose-500 select-none"
      style={{ WebkitUserSelect: 'none', touchAction: 'pan-y' }}
    >
      <motion.div
        style={{ opacity }}
        className="absolute inset-y-0 right-0 w-20 flex items-center justify-center z-0"
      >
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); setIsOpen(false); }}
          className="w-full h-full text-white flex flex-col items-center justify-center gap-1 active:opacity-70"
        >
          <span className="text-xl">🗑️</span>
          <span className="text-[9px] uppercase">Delete</span>
        </button>
      </motion.div>

      <motion.div
        drag="x"
        dragDirectionLock
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{ left: MAX_DRAG, right: 0 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={isOpen ? 'open' : 'closed'}
        variants={variants}
        transition={{ type: 'spring', stiffness: 600, damping: 45 }}
        style={{
          x,
          touchAction: 'pan-y',
          willChange: 'transform',
          WebkitTapHighlightColor: 'transparent'
        }}
        onPointerDown={() => {
          hasDragged.current = false;
          longPressTriggered.current = false;
          if (onLongPress) {
            longPressTimer.current = setTimeout(() => {
              longPressTriggered.current = true;
              onLongPress();
            }, 600);
          }
        }}
        onPointerUp={clearLongPress}
        onPointerCancel={clearLongPress}
        onTap={() => {
          clearLongPress();
          if (hasDragged.current || longPressTriggered.current) return;
          const currentX = Math.abs(x.get());
          if (currentX > 5) {
            if (isOpen) setIsOpen(false);
            return;
          }
          onEdit();
        }}
        className="relative z-10 bg-white dark:bg-slate-800 shadow-sm border border-slate-50 dark:border-slate-700 overflow-hidden rounded-2xl"
      >
        {children}
      </motion.div>
    </div>
  );
};
