import { createContext, useContext, useState, useCallback } from 'react';

// ==========================================================
// CRÉATION DU CONTEXTE
// ==========================================================
const ToastContext = createContext();

// ==========================================================
// HOOK PERSONNALISÉ
// ==========================================================
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// ==========================================================
// PROVIDER
// ==========================================================
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Rendu des toasts */}
      <div style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        maxWidth: '90%'
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              background: toast.type === 'error' ? '#dc3545' : '#1a1a1a',
              color: '#ffffff',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              fontFamily: '"Segoe UI", sans-serif',
              fontSize: '0.85rem',
              fontWeight: '600',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              animation: 'fadeInUp 0.3s ease',
              textAlign: 'center',
              minWidth: '200px'
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};