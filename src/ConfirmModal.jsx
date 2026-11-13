import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { soft } from './ui';

export default function ConfirmModal({
  isOpen,
  title = 'Emin misiniz?',
  message = 'Bu işlem geri alınamaz.',
  confirmText = 'Sil',
  cancelText = 'Vazgeç',
  onConfirm,
  onCancel,
  danger = true,
}) {
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Escape' && isOpen) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)]">
          {/* Karartma arka planı */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm"
          />

          {/* Yukarıdan kayarak gelen modal */}
          <motion.div
            role="alertdialog"
            aria-modal="true"
            initial={{ y: -70, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -70, opacity: 0, scale: 0.94 }}
            transition={soft}
            className="glass relative z-10 w-full max-w-[380px] overflow-hidden rounded-[28px] border border-white/80 p-5 shadow-2xl dark:border-white/10 dark:bg-zinc-900/90"
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`grid size-10 flex-none place-items-center rounded-2xl ${
                  danger
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    : 'bg-[#F5E6B3]/20 text-[#8F6D1D] dark:text-[#F3E5AB]'
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-5 fill-none stroke-current"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold leading-tight text-zinc-900 dark:text-white">
                  {title}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {message}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onCancel}
                className="h-11 rounded-2xl bg-zinc-900/5 font-medium text-zinc-700 transition active:scale-[.98] dark:bg-white/10 dark:text-zinc-200"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`h-11 rounded-2xl font-semibold shadow-md transition active:scale-[.98] ${
                  danger
                    ? 'bg-gradient-to-b from-rose-500 to-red-600 text-white shadow-rose-500/25'
                    : 'bg-gradient-to-b from-[#F7EBBF] to-[#E5CD82] text-zinc-900 shadow-[#E5CD82]/20'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
