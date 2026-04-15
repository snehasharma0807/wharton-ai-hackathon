import { useNavigate } from 'react-router-dom'
import styles from './OwnerDashboard.module.css'

export default function OwnerDashboard() {
  const navigate = useNavigate()

  return (
    <div className={styles.screen}>
      <div className={styles.statusBar} />

      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M14 17L8 11L14 5" stroke="#1668F5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 className={styles.headerTitle}>My Rewards</h2>
        <div className={styles.headerRight} />
      </header>

      <div className={styles.content}>
        {/* Points hero */}
        <div className={styles.pointsHero}>
          <div className={styles.pointsOrb}>
            <span className={styles.pointsOrbIcon}>🏅</span>
          </div>
          <div className={styles.pointsTotal}>200</div>
          <div className={styles.pointsLabel}>Expedia Rewards Points</div>
          <div className={styles.pointsValue}>≈ $2.00 travel value</div>
        </div>

        {/* Stats row */}
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statValue}>1</span>
            <span className={styles.statLabel}>Reviews</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>2</span>
            <span className={styles.statLabel}>Questions</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>Gold</span>
            <span className={styles.statLabel}>Status</span>
          </div>
        </div>

        {/* Coming soon */}
        <div className={styles.comingSoonCard}>
          <div className={styles.comingSoonIcon}>🚧</div>
          <h3 className={styles.comingSoonTitle}>Dashboard Coming Soon</h3>
          <p className={styles.comingSoonDesc}>
            Full analytics, review history, and reward redemption launching soon.
          </p>
        </div>

        {/* CTA */}
        <button className={styles.ctaBtn} onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    </div>
  )
}
