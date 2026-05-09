import { motion as Motion, useMotionValue, useSpring } from 'framer-motion'

export default function MagneticButton({ children, className = '' }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 260, damping: 18 })
  const springY = useSpring(y, { stiffness: 260, damping: 18 })

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    x.set((event.clientX - rect.left - rect.width / 2) * 0.22)
    y.set((event.clientY - rect.top - rect.height / 2) * 0.22)
  }

  return (
    <Motion.span
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
      style={{ x: springX, y: springY }}
    >
      {children}
    </Motion.span>
  )
}
