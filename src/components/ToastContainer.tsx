import React from 'react';
import { ToastMessage } from '../types/attendance';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const isAlert = toast.type === 'alert';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-3 ${
              isAlert
                ? 'bg-red-950/90 border-red-800/80 text-red-100 dark:bg-red-950/95 dark:border-red-700/80'
                : isSuccess
                ? 'bg-slate-900/95 border-emerald-500/50 text-slate-100 dark:bg-slate-900/95 dark:border-emerald-500/40'
                : 'bg-slate-900/95 border-slate-700 text-slate-200'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isAlert && <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />}
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {!isAlert && !isSuccess && <Info className="w-5 h-5 text-sky-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold tracking-tight">{toast.title}</h4>
                <span className="text-[10px] text-slate-400 font-mono tabular-nums">{toast.timestamp}</span>
              </div>
              <p className="mt-1 text-xs text-slate-300/90 leading-relaxed break-words">{toast.description}</p>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 text-slate-400 hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-lg hover:bg-white/10"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
