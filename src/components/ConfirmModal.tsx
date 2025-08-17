import React, { useEffect } from 'react';

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'danger' | 'warning';
  closeOnBackdrop?: boolean;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  icon,
  variant = 'primary',
  closeOnBackdrop = true,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const gradient = variant === 'danger'
    ? 'from-rose-600 via-rose-600 to-red-600'
    : variant === 'warning'
    ? 'from-amber-500 via-orange-500 to-amber-600'
    : 'from-indigo-600 via-fuchsia-600 to-violet-600';

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        >
          <div className={`p-4 text-white bg-gradient-to-r ${gradient}`}>
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                  <span className="text-white">{icon}</span>
                </div>
              )}
              <h3 className="text-lg font-semibold">{title}</h3>
            </div>
          </div>
          {description && (
            <div className="px-5 pt-4 text-sm text-slate-600">{description}</div>
          )}
          <div className="px-5 pb-5 pt-3 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {cancelText}
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg bg-gradient-to-r ${gradient}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
