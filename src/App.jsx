import { AnimatePresence, motion as Motion } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import AnimatedCursor from './components/AnimatedCursor'
import ScrollProgress from './components/ScrollProgress'
import Home from './pages/Home'
import './App.css'

function App() {
  const location = useLocation()

  return (
    <>
      <ScrollProgress />
      <AnimatedCursor />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <Motion.main
                initial={{ opacity: 0, y: 24, filter: 'blur(14px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -24, filter: 'blur(14px)' }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <Home />
              </Motion.main>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default App
