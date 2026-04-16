import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { fetchGapCategories } from '../../utils/api'
import { GAP_CATEGORIES as STATIC_FALLBACK } from '../../data/gapCategories'
import styles from './TopicPickerScreen.module.css'

export default function TopicPickerScreen() {
  const navigate = useNavigate()
  const { state = {} } = useLocation()
  const { reviewText = '', sessionId = '' } = state

  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    fetchGapCategories()
      .then(cats => setCategories(cats))
      .catch(() => setCategories(STATIC_FALLBACK))
      .finally(() => setLoading(false))
  }, [])

  function toggleCategory(cat) {
    setSelectedIds(prev =>
      prev.includes(cat.id)
        ? prev.filter(id => id !== cat.id)
        : [...prev, cat.id]
    )
  }

  function handleContinue() {
    if (selectedIds.length === 0) return
    const orderedCategories = selectedIds.map(id =>
      categories.find(c => c.id === id)
    )
    navigate('/review/text/question', {
      state: {
        mode: 'question',
        categories: orderedCategories,
        currentCategoryIndex: 0,
        completedCategories: [],
        previousAnswer: null,
        reviewText,
        sessionId,
      },
    })
  }

  return (
    <div className={styles.screen}>
      <div className={styles.statusBar} />

      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M14 17L8 11L14 5" stroke="#5BA3F5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className={styles.scoutBadge}>● SCOUT</div>
        <div className={styles.headerRight} />
      </header>

      <div className={styles.scrollable}>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>What can you tell us?</h2>
          <p className={styles.subtitle}>
            We're missing info on a few things. What did you experience?
          </p>
        </div>

        {loading ? (
          <div className={styles.gridLoading}>
            <div className={styles.loadingDots}><span /><span /><span /></div>
            <p className={styles.loadingText}>Finding gaps…</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {categories.map(cat => {
              const isSelected    = selectedIds.includes(cat.id)
              const selectionOrder = selectedIds.indexOf(cat.id)
              return (
                <button
                  key={cat.id}
                  className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
                  onClick={() => toggleCategory(cat)}
                >
                  {isSelected && (
                    <div className={styles.selectionBadge}>{selectionOrder + 1}</div>
                  )}
                  <span className={styles.cardIcon}>{cat.icon}</span>
                  <span className={styles.cardLabel}>{cat.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className={styles.rewardsBanner}>
        <span>🏅</span>
        <span className={styles.rewardsText}>+50 pts for each topic you help with</span>
      </div>

      <div className={styles.footer}>
        <button
          className={styles.continueBtn}
          onClick={handleContinue}
          disabled={selectedIds.length === 0 || loading}
        >
          Continue
          {selectedIds.length > 0 && (
            <span className={styles.continueBadge}>{selectedIds.length}</span>
          )}
        </button>
        <button className={styles.skipBtn} onClick={() => navigate('/')}>
          Skip all topics
        </button>
      </div>
    </div>
  )
}
