import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GAP_CATEGORIES } from '../../data/gapCategories'
import styles from './TopicPickerScreen.module.css'

export default function TopicPickerScreen() {
  const navigate = useNavigate()
  // Array of category ids in the order they were tapped
  const [selectedIds, setSelectedIds] = useState([])

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
      GAP_CATEGORIES.find(c => c.id === id)
    )
    navigate('/review/text/question', {
      state: {
        mode: 'question',
        categories: orderedCategories,
        currentCategoryIndex: 0,
        completedCategories: [],
        previousAnswer: null,
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

        {/* Category grid — renders however many categories come from the data source */}
        <div className={styles.grid}>
          {GAP_CATEGORIES.map(cat => {
            const isSelected = selectedIds.includes(cat.id)
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
                {/* data-status drives the badge color via CSS — no JS logic needed */}
                <span
                  className={styles.cardGapLabel}
                  data-status={cat.statusColor}
                >
                  {cat.gapReason}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Rewards banner — static, always shown */}
      <div className={styles.rewardsBanner}>
        <span>🏅</span>
        <span className={styles.rewardsText}>+50 pts for each topic you help with</span>
      </div>

      <div className={styles.footer}>
        <button
          className={styles.continueBtn}
          onClick={handleContinue}
          disabled={selectedIds.length === 0}
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
