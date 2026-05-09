import { motion as Motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 130, damping: 28, restDelta: 0.001 })

  return (
    <Motion.div
      className="fixed left-0 top-0 z-[90] h-1 w-full origin-left bg-gradient-to-r from-fuchsia-400 via-pink-300 to-violet-400"
      style={{ scaleX }}
    />
  )
}
