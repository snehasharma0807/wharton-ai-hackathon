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
            <path d="M14 17L8 11L14 5" stroke="#1668F5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 className={styles.headerTitle}>Rate Your Stay</h2>
        <div className={styles.headerRight} />
      </header>

      <div className={styles.scrollable}>
        {/* Hotel info chip */}
        <div className={styles.hotelChip}>
          <div className={styles.hotelChipIcon}>🏨</div>
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
              <span className={styles.ratingEmoji}>
                {rating >= 5 ? '🤩' : rating >= 4 ? '😊' : rating >= 3 ? '😐' : rating >= 2 ? '😕' : '😞'}
              </span>
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
                <span className={styles.modeCardEmoji}>💬</span>
                <span className={styles.ptsChip}>+50 pts per question</span>
              </div>
              <h4 className={styles.modeCardTitle}>Text</h4>
              <p className={styles.modeCardDesc}>Answer at your own pace</p>
              <div className={styles.modeCardFeatures}>
                <span>✓ Type when ready</span>
                <span>✓ Edit before sending</span>
              </div>
              <div className={styles.modeCardArrow}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="#1668F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>

            {/* Voice card */}
            <button
              className={`${styles.modeCard} ${styles.modeCardVoice}`}
              onClick={() => handleModeSelect('voice')}
            >
              <div className={styles.modeCardHeader}>
                <span className={styles.modeCardEmoji}>📞</span>
                <span className={styles.ptsChip}>+50 pts per question</span>
              </div>
              <h4 className={styles.modeCardTitle}>Voice Call</h4>
              <p className={styles.modeCardDesc}>Talk to our AI in ~2 min</p>
              <div className={styles.modeCardFeatures}>
                <span>✓ Hands-free</span>
                <span>✓ Conversational</span>
              </div>
              <div className={styles.modeCardArrow}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="#1668F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          </div>

          <p className={styles.footnote}>
            🏅 Complete all questions to earn up to <strong>200 pts</strong> redeemable for travel
          </p>
        </section>
      </div>

      <div className={styles.bottomPad} />
    </div>
  )
}
