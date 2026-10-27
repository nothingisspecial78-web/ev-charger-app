import React, { createContext, useContext, useMemo, useState } from 'react';
import { CheckCircle2, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastItem = { id: number; tone: 'success' | 'error'; message: string };
type ToastContextValue = { toast: (message: string, tone?: ToastItem['tone']) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);
  const toast = (message: string, tone: ToastItem['tone'] = 'success') => {
    const id = Date.now() + Math.random();
    setItems(current => [...current, { id, message, tone }]);
    window.setTimeout(() => setItems(current => current.filter(item => item.id !== id)), 4000);
  };
  const value = useMemo(() => ({ toast }), []);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-20 z-[70] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
        {items.map(item => (
          <div key={item.id} className={cn('flex items-start gap-2 rounded-control border bg-surface p-3 text-sm shadow-lg', item.tone === 'success' ? 'border-success/30' : 'border-danger/30')}>
            {item.tone === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />}
            <span className="flex-1 text-foreground">{item.message}</span>
            <button type="button" aria-label="Dismiss notification" onClick={() => setItems(current => current.filter(entry => entry.id !== item.id))} className="min-h-6 min-w-6 text-muted hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
