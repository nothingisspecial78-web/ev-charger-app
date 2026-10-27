import React from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';

export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-3xl border border-border p-6 shadow-card animate-pulse space-y-4">
    <div className="flex justify-between items-start gap-4">
      <div className="space-y-2.5 w-2/3">
        <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
        <div className="h-3.5 bg-gray-100 rounded-lg w-1/2"></div>
      </div>
      <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-14 bg-gray-100/70 rounded-2xl w-full"></div>
    <div className="flex gap-2">
      <div className="h-6 w-20 bg-gray-100 rounded-lg"></div>
      <div className="h-6 w-16 bg-gray-100 rounded-lg"></div>
    </div>
    <div className="h-px bg-gray-100 my-2"></div>
    <div className="flex justify-between items-center pt-2">
      <div className="h-4 w-28 bg-gray-100 rounded"></div>
      <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
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
  <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-10 sm:p-14 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8 shadow-2xs">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EAF3EF] to-[#D5E9DF] text-[#174D3A] flex items-center justify-center mb-5 shadow-2xs">
      {icon || <AlertCircle className="w-8 h-8" />}
    </div>
    <h3 className="text-xl font-extrabold text-[#17231F] mb-1.5">{title}</h3>
    <p className="text-xs sm:text-sm text-[#66736D] max-w-sm mb-7 leading-relaxed font-medium">{description}</p>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#174D3A] hover:bg-[#123D2E] text-white text-xs sm:text-sm font-bold transition-all shadow-card hover:shadow-elevated hover:scale-105"
      >
        <span>{actionText}</span>
        <ArrowRight className="w-4 h-4 text-[#C8F169]" />
      </button>
    )}
  </div>
);

export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Failed to load', message, onRetry }) => (
  <div className="bg-rose-50 border border-rose-200 rounded-3xl p-7 text-center max-w-md mx-auto my-8 shadow-sm">
    <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
      <AlertTriangle className="w-7 h-7" />
    </div>
    <h4 className="text-lg font-extrabold text-rose-900 mb-1">{title}</h4>
    <p className="text-xs sm:text-sm text-rose-700 mb-5 leading-relaxed">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-700 text-white hover:bg-rose-800 text-xs sm:text-sm font-bold transition shadow-xs"
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
  notePlaceholder = 'Optional note for the driver...',
  onConfirm,
  onCancel,
}) => {
  const [note, setNote] = React.useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-extrabold text-[#17231F] tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-[#66736D] leading-relaxed font-medium">{message}</p>

        {noteInput && (
          <div>
            <label className="block text-xs font-bold text-[#17231F] mb-1.5">
              Response Note / Gate Instructions (Optional)
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={notePlaceholder}
              rows={3}
              maxLength={300}
              className="w-full text-xs sm:text-sm rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-[#174D3A] focus:border-transparent resize-none font-medium"
            />
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-border text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-50 transition min-h-[44px] flex items-center justify-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(note)}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold text-white transition-all min-h-[44px] flex items-center justify-center shadow-card ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-[#174D3A] hover:bg-[#123D2E]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
