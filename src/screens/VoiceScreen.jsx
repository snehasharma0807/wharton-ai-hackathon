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
            <path d="M14 17L8 11L14 5" stroke="#1668F5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
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
          <span className={styles.idleIcon}>🎙️</span>
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
          <span>⏱️</span>
          <span>~2 minutes</span>
        </div>
        <div className={styles.idleFeature}>
          <span>🏅</span>
          <span>Earn 100 pts</span>
        </div>
        <div className={styles.idleFeature}>
          <span>🔒</span>
          <span>Private & secure</span>
        </div>
      </div>

      <button className={styles.callBtn} onClick={startCall}>
        <span className={styles.callBtnIcon}>📞</span>
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
        <span className={styles.connectingIcon}>🎙️</span>
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
          <span className={styles.avatarEmoji}>🤖</span>
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
        <div className={styles.doneIcon}>✅</div>
        <h2 className={styles.doneTitle}>Call Complete!</h2>
        <p className={styles.doneSub}>Great conversation — your review has been saved</p>

        <div className={styles.ptsCard}>
          <span className={styles.ptsCardIcon}>🏅</span>
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
