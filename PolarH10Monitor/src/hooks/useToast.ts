import { useState, useRef, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

/**
 * Lightweight toast hook.
 * Call show() to display a message; it auto-dismisses after `durationMs`.
 */
export function useToast(durationMs = 4500) {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'error',
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (message: string, type: ToastType = 'error') => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ visible: true, message, type });
      timerRef.current = setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, durationMs);
    },
    [durationMs],
  );

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  return { toast, show, hide };
}
