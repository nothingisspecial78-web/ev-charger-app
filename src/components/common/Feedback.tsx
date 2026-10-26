import React from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';

export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-2xl border border-border p-5 shadow-sm animate-pulse space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2 w-2/3">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3.5 bg-gray-100 rounded w-1/2"></div>
      </div>
      <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
    </div>
    <div className="flex gap-2">
      <div className="h-5 w-16 bg-gray-100 rounded"></div>
      <div className="h-5 w-14 bg-gray-100 rounded"></div>
    </div>
    <div className="h-px bg-gray-100 my-2"></div>
    <div className="flex justify-between items-center pt-2">
      <div className="h-6 w-24 bg-gray-200 rounded"></div>
      <div className="h-9 w-28 bg-gray-200 rounded-xl"></div>
    </div>
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}> = ({ title, description, actionText, onAction, icon }) => (
  <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-6">
    <div className="w-14 h-14 rounded-full bg-[#EAF3EF] text-[#174D3A] flex items-center justify-center mb-4">
      {icon || <AlertCircle className="w-7 h-7" />}
    </div>
    <h3 className="text-lg font-bold text-[#17231F] mb-1">{title}</h3>
    <p className="text-sm text-[#66736D] max-w-sm mb-6 leading-relaxed">{description}</p>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#174D3A] hover:bg-[#123D2E] text-white text-sm font-semibold transition-all shadow-sm"
      >
        <span>{actionText}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    )}
  </div>
);

export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Failed to load', message, onRetry }) => (
  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-md mx-auto my-6">
    <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
      <AlertTriangle className="w-6 h-6" />
    </div>
    <h4 className="text-base font-bold text-rose-900 mb-1">{title}</h4>
    <p className="text-sm text-rose-700 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-700 text-white hover:bg-rose-800 text-sm font-medium transition"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Try Again</span>
      </button>
    )}
  </div>
);

export const ConfirmModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  noteInput?: boolean;
  notePlaceholder?: string;
  onConfirm: (note?: string) => void;
  onCancel: () => void;
}> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  isDestructive = false,
  noteInput = false,
  notePlaceholder = 'Optional note...',
  onConfirm,
  onCancel,
}) => {
  const [note, setNote] = React.useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
        <h3 className="text-lg font-bold text-[#17231F]">{title}</h3>
        <p className="text-sm text-[#66736D] leading-relaxed">{message}</p>

        {noteInput && (
          <div>
            <label className="block text-xs font-semibold text-[#17231F] mb-1.5">
              Response Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={notePlaceholder}
              rows={3}
              maxLength={300}
              className="w-full text-sm rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-[#174D3A] focus:border-transparent resize-none"
            />
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(note)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-sm'
                : 'bg-[#174D3A] hover:bg-[#123D2E] shadow-sm'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
