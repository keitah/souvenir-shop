import React, { createContext, useCallback, useContext, useState } from 'react'

type ToastVariant = 'success' | 'error' | 'info'

type Toast = {
  id: number
  message: string
  variant: ToastVariant
}

type ToastContextType = {
  showSuccess: (message: string) => void
  showError: (message: string) => void
  showInfo: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const AUTO_DISMISS_MS = 3500

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, variant: ToastVariant) => {
    const id = Date.now() + Math.random()
    const toast: Toast = { id, message, variant }
    setToasts(prev => [...prev, toast])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, AUTO_DISMISS_MS)
  }, [])

  const showSuccess = (message: string) => addToast(message, 'success')
  const showError = (message: string) => addToast(message, 'error')
  const showInfo = (message: string) => addToast(message, 'info')

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo }}>
      {children}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1080 }}>
        {toasts.map(t => (
          <div
            key={t.id}
            className={
              'toast show text-white mb-2 ' +
              (t.variant === 'success'
                ? 'bg-success'
                : t.variant === 'error'
                  ? 'bg-danger'
                  : 'bg-primary')
            }
          >
            <div className="d-flex">
              <div className="toast-body small">
                {t.message}
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
