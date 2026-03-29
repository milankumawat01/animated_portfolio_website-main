import { useEffect } from 'react'
import Layout from './components/Layout'
import Home from './sections/Home'
import About from './sections/About'
import Services from './sections/Services'
import Works from './sections/Works'
import Blogs from './sections/Blogs'
import Contact from './sections/Contact'

function App() {
  useEffect(() => {
    const goFullscreen = () => {
      const el = document.documentElement
      if (!document.fullscreenElement) {
        el.requestFullscreen?.() ||
          el.webkitRequestFullscreen?.() ||
          el.msRequestFullscreen?.()
      }
    }

    // Browsers require a user gesture to enter fullscreen
    const events = ['click', 'keydown', 'touchstart', 'scroll']
    events.forEach((e) => window.addEventListener(e, goFullscreen, { once: true }))

    // Re-enter fullscreen if user exits it
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // Re-attach listeners so next interaction goes fullscreen again
        events.forEach((e) => window.addEventListener(e, goFullscreen, { once: true }))
      }
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)

    return () => {
      events.forEach((e) => window.removeEventListener(e, goFullscreen))
      document.removeEventListener('fullscreenchange', onFullscreenChange)
    }
  }, [])

  return (
    <Layout>
      <Home />
      <About />
      <Services />
      <Works />
      <Blogs />
      <Contact />
    </Layout>
  )
}

export default App
