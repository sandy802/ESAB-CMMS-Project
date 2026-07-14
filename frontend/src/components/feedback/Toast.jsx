// components/feedback/Toast.jsx
// Lightweight toast system. No external library needed.
//
// Usage:
//   const toast = useToast();
//   toast.success('Asset created');
//   toast.error('Something went wrong');
//
// Mount <ToastContainer /> once in AppLayout.

import { useState, useCallback, useEffect, createContext, useContext, useRef } from 'react';

const ToastContext = createContext(null);

let _toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = 'success') => {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    // Auto-remove after 3.5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => add(msg, 'success'),
    error:   (msg) => add(msg, 'error'),
    info:    (msg) => add(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container — fixed bottom-right */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const TOAST_STYLES = {
  success: {
    bar:  'bg-green-500',
    icon: 'text-green-500 dark:text-green-400',
    text: 'text-gray-800 dark:text-gray-100',
    svg: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    ),
  },
  error: {
    bar:  'bg-red-500',
    icon: 'text-red-500 dark:text-red-400',
    text: 'text-gray-800 dark:text-gray-100',
    svg: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    ),
  },
  info: {
    bar:  'bg-amber-500',
    icon: 'text-amber-500 dark:text-amber-400',
    text: 'text-gray-800 dark:text-gray-100',
    svg: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
};

const ToastItem = ({ toast: t, onRemove }) => {
  const style = TOAST_STYLES[t.type] || TOAST_STYLES.info;
  const [visible, setVisible] = useState(false);

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`
        pointer-events-auto relative overflow-hidden
        bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
        shadow-lg min-w-[260px] max-w-sm
        flex items-start gap-3 px-4 py-3
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      {/* Colored left bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bar}`} />

      {/* Icon */}
      <svg className={`w-4 h-4 mt-0.5 shrink-0 ${style.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {style.svg}
      </svg>

      {/* Message */}
      <p className={`text-xs font-medium flex-1 leading-relaxed ${style.text}`}>
        {t.message}
      </p>

      {/* Close */}
      <button
        onClick={() => onRemove(t.id)}
        className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors shrink-0"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};

export default ToastProvider;