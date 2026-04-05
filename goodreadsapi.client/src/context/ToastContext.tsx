import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { Locale } from '@/types';

type ToastTone = 'success' | 'info' | 'warning';
type ToastMessage = string | Record<Locale, string>;

interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  showToast: (message: ToastMessage, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneIconMap = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
} as const;

export function ToastProvider({ children }: PropsWithChildren) {
  const { locale } = useLanguage();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (message: ToastMessage, tone: ToastTone = 'info') => {
      const id = `toast-${crypto.randomUUID().slice(0, 8)}`;
      const resolvedMessage = typeof message === 'string' ? message : message[locale];

      setToasts((currentToasts) => [...currentToasts, { id, message: resolvedMessage, tone }]);
      window.setTimeout(() => {
        setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
      }, 3200);
    },
    [locale],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          const Icon = toneIconMap[toast.tone];
          return (
            <article
              key={toast.id}
              className={`toast toast--${toast.tone}`}
            >
              <Icon size={16} />
              <span>{toast.message}</span>
            </article>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return context;
};
