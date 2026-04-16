import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StarRating from '../components/StarRating'
import styles from './ReviewLandingScreen.module.css'

const HOTEL = {
  name: 'The Westin Copley Place, Boston',
  stars: 4,
}

export default function ReviewLandingScreen() {
  const navigate = useNavigate()
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')

  const ratingLabels = ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Excellent']

  function handleModeSelect(mode) {
    navigate(`/review/${mode}`, {
      state: { rating, reviewText, hotel: HOTEL },
    })
  }

  return (
    <div className={styles.screen}>
      {/* Status bar */}
      <div className={styles.statusBar} />

      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M14 17L8 11L14 5" stroke="#5B8EFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 className={styles.headerTitle}>Rate Your Stay</h2>
        <div className={styles.headerRight} />
      </header>

      <div className={styles.scrollable}>
        {/* Hotel info chip */}
        <div className={styles.hotelChip}>
          <div className={styles.hotelChipIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="7" width="16" height="11" rx="1.5" stroke="#8896B0" strokeWidth="1.5"/>
              <path d="M6 18V13H9V18M11 18V13H14V18" stroke="#8896B0" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M2 10L10 4L18 10" stroke="#8896B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.hotelChipInfo}>
            <span className={styles.hotelChipName}>{HOTEL.name}</span>
            <StarRating value={HOTEL.stars} readonly size="sm" />
          </div>
        </div>

        {/* Rating section */}
        <section className={styles.section}>
          <h3 className={styles.sectionLabel}>How was your stay?</h3>
          <div className={styles.starsRow}>
            <StarRating value={rating} onChange={setRating} size="xl" />
          </div>
          {rating > 0 && (
            <div className={styles.ratingLabel}>
              <span className={styles.ratingText}>{ratingLabels[rating]}</span>
            </div>
          )}
        </section>

        {/* Text input */}
        <section className={styles.section}>
          <label className={styles.inputLabel} htmlFor="reviewText">
            Tell us about your stay <span className={styles.optional}>(optional)</span>
          </label>
          <textarea
            id="reviewText"
            className={styles.textarea}
            placeholder="What stood out? Any highlights or suggestions..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
          />
          <div className={styles.charCount}>{reviewText.length} / 500</div>
        </section>

        {/* Divider */}
        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>Help future travelers by answering 1–2 quick questions</span>
          <div className={styles.dividerLine} />
        </div>

        {/* Mode selection */}
        <section className={styles.section}>
          <div className={styles.modeGrid}>
            {/* Text card */}
            <button
              className={`${styles.modeCard} ${styles.modeCardText}`}
              onClick={() => handleModeSelect('text')}
            >
              <div className={styles.modeCardHeader}>
                <span className={styles.modeCardIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H8L12 22L16 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" stroke="#5B8EFF" strokeWidth="1.6" strokeLinejoin="round"/>
                    <path d="M7 8H17M7 12H13" stroke="#5B8EFF" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </span>
                <span className={styles.ptsChip}>+50 pts</span>
              </div>
              <h4 className={styles.modeCardTitle}>Text</h4>
              <p className={styles.modeCardDesc}>Answer at your own pace</p>
              <div className={styles.modeCardFeatures}>
                <span>Type when ready</span>
                <span>Edit before sending</span>
              </div>
              <div className={styles.modeCardArrow}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="#5B8EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>

            {/* Voice card */}
            <button
              className={`${styles.modeCard} ${styles.modeCardVoice}`}
              onClick={() => handleModeSelect('voice')}
            >
              <div className={styles.modeCardHeader}>
                <span className={styles.modeCardIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M6.6 10.8C7.4 12.4 8.8 13.7 10.5 14.5L11.9 13.1C12.1 12.9 12.4 12.8 12.6 12.9C13.4 13.2 14.3 13.3 15.2 13.3C15.6 13.3 16 13.7 16 14.1V16.5C16 16.9 15.6 17.3 15.2 17.3C9 17.3 4 12.3 4 6.1C4 5.7 4.4 5.3 4.8 5.3H7.2C7.6 5.3 8 5.7 8 6.1C8 7 8.1 7.9 8.4 8.7C8.5 9 8.4 9.3 8.2 9.5L6.6 10.8Z" stroke="#5B8EFF" strokeWidth="1.6" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className={styles.ptsChip}>+50 pts</span>
              </div>
              <h4 className={styles.modeCardTitle}>Voice Call</h4>
              <p className={styles.modeCardDesc}>Talk to our AI in ~2 min</p>
              <div className={styles.modeCardFeatures}>
                <span>Hands-free</span>
                <span>Conversational</span>
              </div>
              <div className={styles.modeCardArrow}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="#5B8EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          </div>

          <p className={styles.footnote}>
            Complete all questions to earn up to <strong>200 pts</strong> redeemable for travel
          </p>
        </section>
      </div>

      <div className={styles.bottomPad} />
    </div>
  )
}
