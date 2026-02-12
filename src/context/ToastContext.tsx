import React, { useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import type { Toast } from '../types/types';
import { ToastItem } from '../components/ToastItem';

const DEFAULT_DURATION = 3000;

interface ToastContextValue {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const duration = toast.duration ?? DEFAULT_DURATION;

    setToasts((prev) => {
      const existing = prev.find(
        (t) => t.message === toast.message && t.type === toast.type
      );

      if (existing) {
        return prev.map((t) =>
          t.id === existing.id
            ? { ...t, duration, resetKey: (t.resetKey ?? 0) + 1 }
            : t
        );
      }

      const id = crypto.randomUUID();
      const newToast: Toast = {
        ...toast,
        id,
        duration,
        resetKey: 0,
      };
      return [...prev, newToast];
    });
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-list">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};
