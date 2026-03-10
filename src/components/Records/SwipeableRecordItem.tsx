import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface SwipeableRecordItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  onEdit: () => void;
}

export const SwipeableRecordItem: React.FC<SwipeableRecordItemProps> = ({ children, onDelete, onEdit }) => {
  const x = useMotionValue(0);
  const DRAG_THRESHOLD = -40;
  const MAX_DRAG = -80;

  // 背景顏色的透明度隨滑動距離變化
  const opacity = useTransform(x, [0, MAX_DRAG], [0, 1]);
  const scale = useTransform(x, [0, MAX_DRAG], [0.8, 1]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < DRAG_THRESHOLD) {
      // 保持開啟
      x.set(MAX_DRAG);
    } else {
      // 收回
      x.set(0);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[2.25rem] font-black">
      {/* Bottom Layer: Action Button */}
      <motion.div 
        style={{ opacity, scale }}
        className="absolute inset-y-0 right-0 w-20 bg-rose-500 flex items-center justify-center z-0"
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
            x.set(0); // 刪除後收回
          }}
          className="w-full h-full text-white flex flex-col items-center justify-center gap-1"
        >
          <span className="text-xl">🗑️</span>
          <span className="text-[9px] font-black uppercase">Delete</span>
        </button>
      </motion.div>

      {/* Top Layer: Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: MAX_DRAG, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        onTap={() => {
          // 只有在沒滑開的情況下點擊才觸發編輯
          if (x.get() === 0) {
            onEdit();
          } else {
            // 如果已經滑開，點擊內容區則收回
            x.set(0);
          }
        }}
        className="relative z-10 bg-white cursor-pointer active:scale-[0.98] transition-transform duration-200"
      >
        {children}
      </motion.div>
    </div>
  );
};
