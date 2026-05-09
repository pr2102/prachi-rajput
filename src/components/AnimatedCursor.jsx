import { motion as Motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function AnimatedCursor() {
  const [active, setActive] = useState(false)
  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)
  const x = useSpring(mouseX, { stiffness: 420, damping: 34 })
  const y = useSpring(mouseY, { stiffness: 420, damping: 34 })

  useEffect(() => {
    const move = (event) => {
      mouseX.set(event.clientX - 12)
      mouseY.set(event.clientY - 12)
    }
    const enter = () => setActive(true)
    const leave = () => setActive(false)

    window.addEventListener('mousemove', move)
    document.querySelectorAll('a, button, [data-cursor]').forEach((node) => {
      node.addEventListener('mouseenter', enter)
      node.addEventListener('mouseleave', leave)
    })

    return () => {
      window.removeEventListener('mousemove', move)
      document.querySelectorAll('a, button, [data-cursor]').forEach((node) => {
        node.removeEventListener('mouseenter', enter)
        node.removeEventListener('mouseleave', leave)
      })
    }
  }, [mouseX, mouseY])

  return (
    <Motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[80] hidden h-6 w-6 rounded-full border border-fuchsia-200/80 mix-blend-screen shadow-[0_0_25px_rgba(244,114,182,0.8)] md:block"
      animate={{ scale: active ? 2.8 : 1, opacity: active ? 0.5 : 0.9 }}
      style={{ x, y }}
      transition={{ duration: 0.2 }}
    />
  )
}
