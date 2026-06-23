import { NavLink } from 'react-router-dom'
import useAuthStore from '../../../store/authStore'
import './Sidebar.css'

const NAV = [
  { 
    to: '/', 
    label: 'Dashboard',  
    icon: GridIcon  
  },
  { 
    to: '/analyze', 
    label: 'Analyze Report', 
    icon: ScanIcon  
  },
  { 
    to: '/symptoms', 
    label: 'Symptoms', 
    icon: PulseIcon 
  },
  { 
    to: '/history', 
    label: 'History', 
    icon: ClockIcon 
  },
]

export default function Sidebar() {
  const { logout } = useAuthStore()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/healthLense.png" alt="HealthLense" className="logo-img" />
        <span className="logo-text">Health<em>Lense</em></span>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

    </aside>
  )
}

function GridIcon() {
  return <svg width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.8">
                <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5"/>
          </svg>
}

function ScanIcon() {
  return <svg width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.8">
                <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
                <line x1="7" y1="12" x2="17" y2="12"/>
                </svg>
}

function PulseIcon() {
  return <svg width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.8">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
}

function ClockIcon() {
  return <svg width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.8">
                <circle cx="12" cy="12" r="9"/>
                <polyline points="12 7 12 12 15 15"/>
          </svg>
}

function LogoutIcon() {
  return <svg width="15" 
              height="15" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.8">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
}