import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './TextReviewFlow.module.css'

const QUESTIONS = [
  {
    id: 'cleanliness',
    emoji: '🛏️',
    category: 'Cleanliness',
    question: 'How clean was your room and the hotel overall?',
    placeholder: 'e.g. The room was spotless, towels were fresh daily...',
  },
  {
    id: 'service',
    emoji: '🤝',
    category: 'Service',
    question: 'How would you rate the staff and service quality?',
    placeholder: 'e.g. Concierge was incredibly helpful with restaurant recommendations...',
  },
]

export default function TextReviewFlow() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state || {}

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const currentQ = QUESTIONS[step]
  const currentAnswer = answers[currentQ?.id] || ''
  const progress = ((step) / QUESTIONS.length) * 100
  const totalPts = step * 50

  function handleNext() {
    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1)
    } else {
      setSubmitted(true)
    }
  }

  function handleAnswerChange(val) {
    setAnswers(prev => ({ ...prev, [currentQ.id]: val }))
  }

  if (submitted) {
    return <SuccessScreen navigate={navigate} ptsEarned={QUESTIONS.length * 50 + (state.rating ? 50 : 0)} />
  }

  return (
    <div className={styles.screen}>
      <div className={styles.statusBar} />

      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => step === 0 ? navigate(-1) : setStep(s => s - 1)} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M14 17L8 11L14 5" stroke="#1668F5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className={styles.headerCenter}>
          <span className={styles.headerStep}>Question {step + 1} of {QUESTIONS.length}</span>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
          </div>
        </div>
        <div className={styles.headerPts}>
          <span className={styles.ptsValue}>+{totalPts}</span>
          <span className={styles.ptsUnit}>pts</span>
        </div>
      </header>

      <div className={styles.content}>
        {/* Category tag */}
        <div className={styles.categoryTag}>
          <span>{currentQ.emoji}</span>
          <span>{currentQ.category}</span>
        </div>

        {/* Question */}
        <h2 className={styles.question}>{currentQ.question}</h2>

        {/* Answer input */}
        <textarea
          className={styles.textarea}
          placeholder={currentQ.placeholder}
          value={currentAnswer}
          onChange={(e) => handleAnswerChange(e.target.value)}
          rows={5}
          autoFocus
        />
        <div className={styles.charCount}>{currentAnswer.length} / 300</div>

        {/* Skip */}
        <button className={styles.skipBtn} onClick={handleNext}>
          Skip this question
        </button>
      </div>

      {/* Bottom CTA */}
      <div className={styles.footer}>
        <div className={styles.footerPtsHint}>
          {currentAnswer.length >= 20
            ? <span className={styles.ptsEarn}>🏅 +50 pts will be added for this answer</span>
            : <span className={styles.ptsHint}>Write at least 20 characters to earn +50 pts</span>
          }
        </div>
        <button
          className={styles.nextBtn}
          onClick={handleNext}
          disabled={currentAnswer.length === 0}
        >
          {step < QUESTIONS.length - 1 ? 'Next Question' : 'Submit Review'}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

function SuccessScreen({ navigate, ptsEarned }) {
  return (
    <div className={styles.successScreen}>
      <div className={styles.statusBar} />
      <div className={styles.successContent}>
        <div className={styles.successIcon}>🎉</div>
        <h2 className={styles.successTitle}>Review Submitted!</h2>
        <p className={styles.successSub}>Thank you for helping fellow travelers</p>

        <div className={styles.ptsCard}>
          <div className={styles.ptsCardIcon}>🏅</div>
          <div>
            <div className={styles.ptsCardLabel}>Points earned</div>
            <div className={styles.ptsCardValue}>+{ptsEarned} pts</div>
          </div>
        </div>

        <div className={styles.successActions}>
          <button className={styles.primaryBtn} onClick={() => navigate('/')}>
            Back to Home
          </button>
          <button className={styles.secondaryBtn} onClick={() => navigate('/dashboard')}>
            View My Points
          </button>
        </div>
      </div>
    </div>
  )
}
