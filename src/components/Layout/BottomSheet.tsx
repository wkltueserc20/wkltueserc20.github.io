import React, { useEffect } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, children, title }) => {
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

  if (!isOpen) return null;

  return (
    <div data-bottom-sheet className="fixed inset-0 z-[100] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-full duration-500 ease-out max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex flex-col items-center py-4 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full mb-2" />
          {title && <h3 className="text-sm text-slate-400 uppercase tracking-widest">{title}</h3>}
        </div>
        <div className="px-6 pb-12 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
