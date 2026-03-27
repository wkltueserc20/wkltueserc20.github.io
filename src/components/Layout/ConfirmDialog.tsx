import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen, title, message, confirmLabel = '確定', cancelLabel = '取消',
  onConfirm, onCancel,
}) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onCancel}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl max-w-sm w-full space-y-5"
        >
          <div className="text-center space-y-2">
            <h3 className="text-lg text-slate-900 dark:text-slate-100 font-bold">{title}</h3>
            <p className="text-xs text-slate-400">{message}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-xs uppercase active:scale-95 transition-all"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-4 bg-rose-500 text-white rounded-2xl text-xs uppercase shadow-lg active:scale-95 transition-all"
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
