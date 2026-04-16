import { useLocation, useNavigate } from 'react-router-dom'
import styles from './MobileShell.module.css'

export default function MobileShell({ children }) {
  return (
    <div className={styles.shell}>
      <div className={styles.device}>
        <div className={styles.content}>
          {children}
        </div>
        <BottomNav />
      </div>
    </div>
  )
}

function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname

  const tabs = [
    {
      label: 'Home',
      path: '/',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M2.5 8L10 2.5L17.5 8V17C17.5 17.276 17.276 17.5 17 17.5H13V12.5H7V17.5H3C2.724 17.5 2.5 17.276 2.5 17V8Z"
            stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: 'Search',
      path: null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: 'Trips',
      path: null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2.5" y="7" width="15" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M6.5 7V5.5C6.5 4.12 7.62 3 9 3H11C12.38 3 13.5 4.12 13.5 5.5V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M2.5 11H17.5" stroke="currentColor" strokeWidth="1.4"/>
        </svg>
      ),
    },
    {
      label: 'Inbox',
      path: null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2.5" y="4" width="15" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M2.5 7.5L10 12L17.5 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: 'Account',
      path: '/dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M3.5 17C3.5 14.24 6.46 12 10 12C13.54 12 16.5 14.24 16.5 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      ),
    },
  ]

  return (
    <nav className={styles.bottomNav}>
      {tabs.map((tab) => {
        const active = tab.path !== null && (
          tab.path === '/' ? path === '/' : path.startsWith(tab.path)
        )
        return (
          <button
            key={tab.label}
            className={`${styles.navTab} ${active ? styles.navTabActive : ''}`}
            onClick={() => tab.path && navigate(tab.path)}
            aria-label={tab.label}
          >
            <span className={styles.navIcon}>{tab.icon}</span>
            <span className={styles.navLabel}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
