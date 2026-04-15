import { useNavigate } from 'react-router-dom'
import StarRating from '../components/StarRating'
import styles from './PostCheckoutScreen.module.css'

const HOTEL = {
  name: 'The Westin Copley Place, Boston',
  stars: 4,
  dates: 'Apr 10 – Apr 13, 2025',
}

export default function PostCheckoutScreen() {
  const navigate = useNavigate()

  return (
    <div className={styles.screen}>
      {/* Status bar spacer */}
      <div className={styles.statusBar} />

      {/* Top nav */}
      <header className={styles.header}>
        <ExpediaLogo />
        <button className={styles.menuBtn} aria-label="Menu">
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* Hero area */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L10.163 5.279L15 5.972L11.5 9.323L12.326 14L8 11.779L3.674 14L4.5 9.323L1 5.972L5.837 5.279L8 1Z" fill="#f5a623" stroke="#f5a623" strokeWidth="1" strokeLinejoin="round"/>
          </svg>
          Checkout Complete
        </div>
        <p className={styles.heroSub}>You've just checked out of</p>
        <h1 className={styles.hotelName}>{HOTEL.name}</h1>
        <div className={styles.hotelMeta}>
          <StarRating value={HOTEL.stars} readonly size="sm" />
          <span className={styles.metaDivider}>·</span>
          <span className={styles.dates}>{HOTEL.dates}</span>
        </div>

        {/* Confirmation number */}
        <div className={styles.confirmRow}>
          <span className={styles.confirmLabel}>Booking</span>
          <span className={styles.confirmCode}>#EXP-2025-88214</span>
        </div>
      </section>

      {/* Illustration strip */}
      <div className={styles.illustrationStrip}>
        <div className={styles.illustrationInner}>
          <HotelIllustration />
        </div>
      </div>

      {/* Review card */}
      <div className={styles.cardWrap}>
        <div className={styles.card}>
          <div className={styles.cardTop}>
            <div className={styles.cardIcon}>💬</div>
            <div className={styles.cardText}>
              <h3 className={styles.cardTitle}>Share your experience</h3>
              <p className={styles.cardSub}>Help future travelers & earn rewards</p>
            </div>
            <div className={styles.pointsBadge}>
              <span className={styles.pointsMedal}>🏅</span>
              <span className={styles.pointsText}>
                Earn up to<br />
                <strong>200 pts</strong>
              </span>
            </div>
          </div>

          <div className={styles.perksRow}>
            <div className={styles.perk}>
              <span className={styles.perkIcon}>⚡</span>
              <span>Quick 2-min review</span>
            </div>
            <div className={styles.perk}>
              <span className={styles.perkIcon}>🎁</span>
              <span>Redeem for travel</span>
            </div>
          </div>
        </div>

        <button
          className={styles.ctaButton}
          onClick={() => navigate('/review')}
        >
          Leave a Review
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button className={styles.skipButton} onClick={() => {}}>
          Maybe later
        </button>
      </div>

      <div className={styles.bottomPad} />
    </div>
  )
}

function ExpediaLogo() {
  return (
    <div className={styles.logo}>
      <svg width="110" height="28" viewBox="0 0 110 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Expedia wordmark approximation */}
        <text x="2" y="22" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="21" fill="#1668F5" letterSpacing="-0.5">expedia</text>
        <circle cx="103" cy="12" r="5" fill="#f5a623"/>
      </svg>
    </div>
  )
}

function HotelIllustration() {
  return (
    <svg width="320" height="100" viewBox="0 0 320 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sky gradient */}
      <rect width="320" height="100" fill="url(#skyGrad)" rx="0"/>
      {/* Building */}
      <rect x="80" y="20" width="160" height="80" fill="#cbd5e1" rx="4"/>
      <rect x="90" y="10" width="140" height="90" fill="#e2e8f0" rx="4"/>
      {/* Windows rows */}
      {[0,1,2,3,4].map(row =>
        [0,1,2,3,4,5,6].map(col => (
          <rect key={`${row}-${col}`} x={98 + col*19} y={18 + row*14} width="10" height="9" fill={row === 2 && col === 3 ? '#fbbf24' : '#93c5fd'} rx="1" opacity="0.85"/>
        ))
      )}
      {/* Door */}
      <rect x="148" y="72" width="24" height="28" fill="#1668F5" rx="2"/>
      <circle cx="167" cy="86" r="1.5" fill="white"/>
      {/* Foreground grass */}
      <rect x="0" y="88" width="320" height="20" fill="#86efac"/>
      {/* Trees */}
      <circle cx="60" cy="72" r="18" fill="#4ade80"/>
      <rect x="57" y="85" width="6" height="15" fill="#713f12"/>
      <circle cx="260" cy="68" r="22" fill="#4ade80"/>
      <rect x="257" y="85" width="6" height="15" fill="#713f12"/>
      {/* Sky sun */}
      <circle cx="280" cy="22" r="12" fill="#fde68a" opacity="0.8"/>
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#dbeafe"/>
          <stop offset="1" stopColor="#bfdbfe"/>
        </linearGradient>
      </defs>
    </svg>
  )
}
