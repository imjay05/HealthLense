import { useState, useEffect } from 'react'
import { toast as toastBus } from '../utils/toast'

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    return toastBus.subscribe((t) => {
      setToasts((prev) => [...prev, t])
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3500)
    })
  }, [])

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'i'}</span>
          {t.message}
        </div>
      ))}
    </div>
  )
}