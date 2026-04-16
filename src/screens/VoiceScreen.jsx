import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './VoiceScreen.module.css'

const PHASES = ['idle', 'connecting', 'active', 'done']

const MOCK_TRANSCRIPT = [
  { role: 'ai', text: "Hi! I'm your Expedia review assistant. How was your overall experience at the Westin Copley Place?" },
  { role: 'user', text: "It was really great overall. The staff were incredibly helpful and the location is perfect." },
  { role: 'ai', text: "That sounds wonderful! Was there anything that could have been improved during your stay?" },
  { role: 'user', text: "The pool hours were a bit limited, but otherwise everything was fantastic." },
  { role: 'ai', text: "Thank you for sharing that! Your feedback helps other travelers make informed decisions. You've earned 100 bonus points!" },
]

export default function VoiceScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state || {}

  const [phase, setPhase] = useState('idle')
  const [transcript, setTranscript] = useState([])
  const [elapsed, setElapsed] = useState(0)
  const [pulsing, setPulsing] = useState(false)
  const intervalRef = useRef(null)
  const transcriptRef = useRef(null)

  function startCall() {
    setPhase('connecting')
    setTimeout(() => {
      setPhase('active')
      setPulsing(true)
      startTimer()
      playMockTranscript()
    }, 1800)
  }

  function startTimer() {
    intervalRef.current = setInterval(() => {
      setElapsed(e => e + 1)
    }, 1000)
  }

  function playMockTranscript() {
    MOCK_TRANSCRIPT.forEach((msg, i) => {
      setTimeout(() => {
        setTranscript(prev => [...prev, msg])
      }, i * 2800)
    })
    setTimeout(() => {
      setPhase('done')
      setPulsing(false)
      clearInterval(intervalRef.current)
    }, MOCK_TRANSCRIPT.length * 2800 + 500)
  }

  function endCall() {
    clearInterval(intervalRef.current)
    setPhase('done')
    setPulsing(false)
  }

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [transcript])

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  if (phase === 'done') {
    return <DoneScreen navigate={navigate} transcript={transcript} />
  }

  return (
    <div className={styles.screen}>
      <div className={styles.statusBar} />

      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M14 17L8 11L14 5" stroke="#5B8EFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 className={styles.headerTitle}>Voice Review</h2>
        {phase === 'active' && (
          <span className={styles.timer}>{formatTime(elapsed)}</span>
        )}
        {phase !== 'active' && <div className={styles.headerRight} />}
      </header>

      {phase === 'idle' && (
        <IdleView startCall={startCall} />
      )}

      {phase === 'connecting' && (
        <ConnectingView />
      )}

      {phase === 'active' && (
        <ActiveView
          transcript={transcript}
          transcriptRef={transcriptRef}
          pulsing={pulsing}
          endCall={endCall}
        />
      )}
    </div>
  )
}

function IdleView({ startCall }) {
  return (
    <div className={styles.idleContent}>
      <div className={styles.idleIllustration}>
        <div className={styles.idleOrb}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect x="13" y="4" width="10" height="18" rx="5" stroke="white" strokeWidth="2"/>
            <path d="M7 18C7 24.075 11.925 29 18 29C24.075 29 29 24.075 29 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M18 29V33M14 33H22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className={styles.idleRing1} />
        <div className={styles.idleRing2} />
      </div>

      <h2 className={styles.idleTitle}>Talk to our AI</h2>
      <p className={styles.idleSub}>
        Answer 2 short questions about your stay via voice. Takes about 2 minutes.
      </p>

      <div className={styles.idleFeatures}>
        <div className={styles.idleFeature}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="#8896B0" strokeWidth="1.4"/>
            <path d="M8 5V8.5L10 10" stroke="#8896B0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>~2 minutes</span>
        </div>
        <div className={styles.idleFeature}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L9.8 5.4L14.5 5.9L11 9L12.1 13.5L8 11.1L3.9 13.5L5 9L1.5 5.9L6.2 5.4L8 1Z" fill="#FFD000" strokeWidth="0.5" stroke="#FFD000"/>
          </svg>
          <span>Earn 100 pts</span>
        </div>
        <div className={styles.idleFeature}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="#8896B0" strokeWidth="1.4"/>
            <path d="M5 7V5C5 3.34 6.34 2 8 2C9.66 2 11 3.34 11 5V7" stroke="#8896B0" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="8" cy="11" r="1" fill="#8896B0"/>
          </svg>
          <span>Private & secure</span>
        </div>
      </div>

      <button className={styles.callBtn} onClick={startCall}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5.5 8.7C6.2 10.3 7.7 11.7 9.5 12.5L10.9 11.1C11.1 10.9 11.4 10.8 11.7 10.9C12.5 11.2 13.4 11.3 14.3 11.3C14.7 11.3 15 11.6 15 12V14.5C15 14.9 14.7 15.2 14.3 15.2C8.3 15.2 3.5 10.4 3.5 4.4C3.5 4 3.8 3.7 4.2 3.7H6.7C7.1 3.7 7.4 4 7.4 4.4C7.4 5.3 7.5 6.2 7.8 7C7.9 7.3 7.8 7.6 7.6 7.8L5.5 8.7Z" fill="white"/>
        </svg>
        Start Voice Review
      </button>
      <p className={styles.callDisclaimer}>By continuing, you consent to AI voice processing</p>
    </div>
  )
}

function ConnectingView() {
  return (
    <div className={styles.connectingContent}>
      <div className={styles.connectingOrb}>
        <div className={styles.connectingSpinner} />
        <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
          <rect x="13" y="4" width="10" height="18" rx="5" stroke="white" strokeWidth="2"/>
          <path d="M7 18C7 24.075 11.925 29 18 29C24.075 29 29 24.075 29 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M18 29V33M14 33H22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <h3 className={styles.connectingTitle}>Connecting…</h3>
      <p className={styles.connectingSub}>Starting your AI review session</p>
    </div>
  )
}

function ActiveView({ transcript, transcriptRef, pulsing, endCall }) {
  return (
    <div className={styles.activeContent}>
      {/* AI avatar */}
      <div className={styles.avatarWrap}>
        <div className={`${styles.avatar} ${pulsing ? styles.avatarPulsing : ''}`}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="8" y="4" width="16" height="12" rx="4" stroke="white" strokeWidth="1.8"/>
            <circle cx="12" cy="10" r="2" fill="white"/>
            <circle cx="20" cy="10" r="2" fill="white"/>
            <path d="M6 20C6 17.8 7.8 16 10 16H22C24.2 16 26 17.8 26 20V26C26 27.1 25.1 28 24 28H8C6.9 28 6 27.1 6 26V20Z" stroke="white" strokeWidth="1.8"/>
            <path d="M12 22H20M14 25H18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        {pulsing && (
          <>
            <div className={styles.pulseRing1} />
            <div className={styles.pulseRing2} />
          </>
        )}
        <div className={styles.liveChip}>
          <span className={styles.liveDot} />
          LIVE
        </div>
      </div>

      {/* Transcript */}
      <div className={styles.transcript} ref={transcriptRef}>
        {transcript.length === 0 && (
          <p className={styles.transcriptEmpty}>Listening…</p>
        )}
        {transcript.map((msg, i) => (
          <div
            key={i}
            className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi}`}
          >
            {msg.role === 'ai' && <span className={styles.bubbleLabel}>AI</span>}
            <p>{msg.text}</p>
          </div>
        ))}
      </div>

      {/* End call */}
      <div className={styles.endCallWrap}>
        <button className={styles.endCallBtn} onClick={endCall}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M16.5 9.4L7.5 14.6M7.5 9.4L16.5 14.6" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>
        <span className={styles.endCallLabel}>End Call</span>
      </div>
    </div>
  )
}

function DoneScreen({ navigate, transcript }) {
  return (
    <div className={styles.doneScreen}>
      <div className={styles.statusBar} />
      <div className={styles.doneContent}>
        <div className={styles.doneIcon}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M9 18L15.5 24.5L27 12" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className={styles.doneTitle}>Call Complete!</h2>
        <p className={styles.doneSub}>Great conversation — your review has been saved</p>

        <div className={styles.ptsCard}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 1L12.2 6.4L18 6.9L13.8 10.6L15.1 16.3L10 13.3L4.9 16.3L6.2 10.6L2 6.9L7.8 6.4L10 1Z" fill="#FFD000" stroke="#FFD000" strokeWidth="0.5" strokeLinejoin="round"/>
          </svg>
          <div>
            <div className={styles.ptsCardLabel}>Points earned</div>
            <div className={styles.ptsCardValue}>+100 pts</div>
          </div>
        </div>

        {transcript.length > 0 && (
          <div className={styles.transcriptSummary}>
            <p className={styles.transcriptSummaryLabel}>Call summary</p>
            <p className={styles.transcriptSummaryText}>
              {transcript.filter(m => m.role === 'user').map(m => m.text).join(' ')}
            </p>
          </div>
        )}

        <div className={styles.doneActions}>
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
