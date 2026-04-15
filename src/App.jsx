import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MobileShell from './components/MobileShell'
import PostCheckoutScreen from './screens/PostCheckoutScreen'
import ReviewLandingScreen from './screens/ReviewLandingScreen'
import TextReviewFlow from './screens/TextReviewFlow'
import VoiceScreen from './screens/VoiceScreen'
import OwnerDashboard from './screens/OwnerDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <MobileShell>
        <Routes>
          <Route path="/" element={<PostCheckoutScreen />} />
          <Route path="/review" element={<ReviewLandingScreen />} />
          <Route path="/review/text" element={<TextReviewFlow />} />
          <Route path="/review/voice" element={<VoiceScreen />} />
          <Route path="/dashboard" element={<OwnerDashboard />} />
        </Routes>
      </MobileShell>
    </BrowserRouter>
  )
}
