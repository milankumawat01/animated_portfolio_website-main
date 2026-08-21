import Layout from './components/Layout'
import Home from './sections/Home'
import About from './sections/About'
import AIPractice from './sections/AIPractice'
import Stack from './sections/Stack'
import Services from './sections/Services'
import Works from './sections/Works'
import Freelance from './sections/Freelance'
import Contact from './sections/Contact'

function App() {
  return (
    <Layout>
      <Home />
      <About />
      <AIPractice />
      <Stack />
      <Services />
      <Works />
      <Freelance />
      <Contact />
    </Layout>
  )
}

export default App
