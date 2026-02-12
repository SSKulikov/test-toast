import React, { useEffect, useRef, useState } from 'react';
import type { Toast } from '../types/types';

const DEFAULT_DURATION = 3000;

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const EXIT_ANIMATION_MS = 250;

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const duration = toast.duration ?? DEFAULT_DURATION;
  const [remainingTime, setRemainingTime] = useState(duration);
  const [paused, setPaused] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevResetKeyRef = useRef(toast.resetKey ?? 0);

  useEffect(() => {
    const resetKey = toast.resetKey ?? 0;
    if (resetKey !== prevResetKeyRef.current) {
      prevResetKeyRef.current = resetKey;
      setRemainingTime(duration);
    }
  }, [toast.resetKey, duration]);

  useEffect(() => {
    if (paused || remainingTime <= 0) return;

    timerRef.current = setTimeout(() => {
      setIsExiting(true);
    }, remainingTime);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [paused, remainingTime, toast.id]);

  const handleMouseEnter = () => setPaused(true);
  const handleMouseLeave = () => setPaused(false);

  const handleRemove = () => {
    if (isExiting) return;
    setIsExiting(true);
  };

  useEffect(() => {
    if (!isExiting) return;
    const timer = setTimeout(() => onRemove(toast.id), EXIT_ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [isExiting, toast.id, onRemove]);

  const animationClass = isExiting ? 'toast-exit' : 'toast-enter';

  return (
    <div
      className={`toast toast-${toast.type} ${animationClass}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
    >
      <span>{toast.message}</span>
      <button onClick={handleRemove} aria-label="Close">
        ×
      </button>
    </div>
  );
};
