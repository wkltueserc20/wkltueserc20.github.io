import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface SwipeableRecordItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  onEdit: () => void;
}

export const SwipeableRecordItem: React.FC<SwipeableRecordItemProps> = ({ children, onDelete, onEdit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const x = useMotionValue(0);
  const MAX_DRAG = -80;
  
  const opacity = useTransform(x, [0, MAX_DRAG], [0, 1]);

  const handleDragStart = () => {
    // 當開始水平拖曳時，鎖定 Body 捲動，防止 Y 軸移動
    document.body.style.overflow = 'hidden';
  };

  const handleDragEnd = (_: any, info: any) => {
    // 拖曳結束，恢復 Body 捲動
    document.body.style.overflow = '';

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
      className="relative overflow-hidden rounded-[2.25rem] bg-rose-500 select-none"
      style={{ WebkitUserSelect: 'none', touchAction: 'pan-y' }}
    >
      {/* Bottom Layer: Action Button */}
      <motion.div 
        style={{ opacity }}
        className="absolute inset-y-0 right-0 w-20 flex items-center justify-center z-0"
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
            setIsOpen(false);
          }}
          className="w-full h-full text-white flex flex-col items-center justify-center gap-1 active:opacity-70"
        >
          <span className="text-xl">🗑️</span>
          <span className="text-[9px] font-black uppercase">Delete</span>
        </button>
      </motion.div>

      {/* Top Layer: Content */}
      <motion.div
        drag="x"
        dragDirectionLock // 關鍵：偵測到水平意圖後鎖定方向
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
          touchAction: 'pan-y', // 關鍵：告訴瀏覽器水平方向由 JS 處理，垂直才由瀏覽器捲動
          willChange: 'transform',
          WebkitTapHighlightColor: 'transparent'
        }}
        onTap={() => {
          const currentX = Math.abs(x.get());
          if (currentX > 5) {
            if (isOpen) setIsOpen(false);
            return;
          }
          onEdit();
        }}
        className="relative z-10 bg-white shadow-sm border border-slate-50 overflow-hidden rounded-[2.25rem]"
      >
        {children}
      </motion.div>
    </div>
  );
};
