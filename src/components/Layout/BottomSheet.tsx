import React, { useEffect } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, children, title }) => {
  // 阻止背景捲動
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center font-black">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Sheet Content */}
      <div className="relative w-full max-w-md bg-white rounded-t-[3rem] shadow-2xl animate-in slide-in-from-bottom-full duration-500 ease-out max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Handle bar */}
        <div className="flex flex-col items-center py-4 sticky top-0 bg-white z-10">
          <div className="w-12 h-1.5 bg-slate-100 rounded-full mb-2" />
          {title && <h3 className="text-sm text-slate-400 uppercase tracking-widest">{title}</h3>}
        </div>

        <div className="px-6 pb-12 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
