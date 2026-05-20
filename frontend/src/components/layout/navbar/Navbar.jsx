import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import useAuthStore from '../../../store/authStore'
import './Navbar.css'

const TITLES = {
  '/': { title: 'Dashboard', sub: 'Your health overview' },
  '/analyze': { title: 'Analyze Report', sub: 'Upload and interpret medical reports' },
  '/symptoms': { title: 'Symptoms', sub: 'Describe symptoms, get test suggestions' },
  '/history': { title: 'History', sub: 'Past reports and queries' },
}

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuthStore()
  const { title, sub } = TITLES[pathname] || { title: 'HealthLense', sub: '' }
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">{title}</h1>
        {sub && <p className="navbar-sub">{sub}</p>}
      </div>
      <div className="navbar-right">
        <div
          className="navbar-user"
          ref={ref}
          onClick={() => setOpen(o => !o)}
          title={user?.name}>
          <div className="navbar-avatar">{initials}</div>
          {open && (
            <div
              className="navbar-dropdown"
              onClick={e => e.stopPropagation()}>
              <div className="navbar-dropdown-info">
                <p className="navbar-dropdown-name">{user?.name}</p>
                <p className="navbar-dropdown-email">{user?.email}</p>
              </div>
              <button
                className="navbar-dropdown-btn"
                onClick={() => { setOpen(false); logout(); }}>
                <svg width="15" 
                     height="15" 
                     viewBox="0 0 24 24" 
                     fill="none" 
                     stroke="currentColor" 
                     strokeWidth="1.8">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}