'use client';

/**
 * Toast.tsx — 알림 토스트 컴포넌트
 *
 * DESIGN_SYSTEM.md §5.9 기반:
 *   - 4개 variant: success / error / warning / info
 *   - 4초 자동 사라짐 (dismiss 가능)
 *   - role="status" + aria-live="polite" 접근성
 *
 * 사용:
 *   const toast = useToast();
 *   toast.show({ variant: 'success', message: '저장됨' });
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ── 타입 ─────────────────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  variant?: ToastVariant;
  message: string;
  /** ms 단위. 0 또는 음수면 수동으로 닫을 때까지 유지 */
  duration?: number;
}

interface ActiveToast extends Required<Pick<ToastOptions, 'variant' | 'message'>> {
  id: number;
  duration: number;
}

interface ToastContextValue {
  show: (opts: ToastOptions) => void;
  dismiss: (id: number) => void;
  clear: () => void;
}

// ── Context ──────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Hook ─────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Provider 외부 호출 시 무력화(크래시 방지)
    return {
      show: () => {},
      dismiss: () => {},
      clear: () => {},
    };
  }
  return ctx;
}

// ── Provider ─────────────────────────────────────────────────

let _seq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clear = useCallback(() => {
    setToasts([]);
  }, []);

  const show = useCallback((opts: ToastOptions) => {
    const id = ++_seq;
    const toast: ActiveToast = {
      id,
      variant: opts.variant ?? 'info',
      message: opts.message,
      duration: opts.duration ?? 4000,
    };
    setToasts((prev) => [...prev, toast]);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ show, dismiss, clear }), [show, dismiss, clear]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ── Viewport (우측 하단에 고정) ──────────────────────────────

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ActiveToast[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] sm:w-auto pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

// ── 개별 Toast ───────────────────────────────────────────────

const VARIANT_STYLES: Record<ToastVariant, { bg: string; border: string; icon: ReactNode }> = {
  success: {
    bg: 'bg-success-100',
    border: 'border-success-500',
    icon: <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />,
  },
  error: {
    bg: 'bg-error-100',
    border: 'border-error-500',
    icon: <XCircle className="w-5 h-5 text-error-500 flex-shrink-0" />,
  },
  warning: {
    bg: 'bg-warning-100',
    border: 'border-warning-500',
    icon: <AlertTriangle className="w-5 h-5 text-warning-500 flex-shrink-0" />,
  },
  info: {
    bg: 'bg-info-100',
    border: 'border-info-500',
    icon: <Info className="w-5 h-5 text-info-500 flex-shrink-0" />,
  },
};

function ToastItem({ toast, onDismiss }: { toast: ActiveToast; onDismiss: () => void }) {
  useEffect(() => {
    if (toast.duration <= 0) return;
    const t = setTimeout(onDismiss, toast.duration);
    return () => clearTimeout(t);
  }, [toast.duration, onDismiss]);

  const style = VARIANT_STYLES[toast.variant];

  return (
    <div
      role="status"
      className={[
        'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg',
        'animate-[toastIn_0.2s_ease-out]',
        style.bg,
        style.border,
      ].join(' ')}
    >
      {style.icon}
      <p className="flex-1 text-sm text-text-primary leading-relaxed">{toast.message}</p>
      <button
        onClick={onDismiss}
        aria-label="알림 닫기"
        className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      <style jsx>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
