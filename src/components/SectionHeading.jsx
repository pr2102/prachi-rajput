import { motion as Motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Badge } from './ui/badge'

export default function SectionHeading({ kicker, title, text, align = 'center' }) {
  return (
    <Motion.div
      className={align === 'left' ? 'mx-0 max-w-3xl text-left' : 'mx-auto max-w-3xl text-center'}
      initial={{ opacity: 0, y: 38 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-120px' }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      <Badge>
        <Sparkles className="h-3.5 w-3.5" />
        {kicker}
      </Badge>
      <h2 className="mt-5 text-4xl font-black leading-[0.95] text-white sm:text-5xl lg:text-7xl">
        {title}
      </h2>
      {text ? <p className="mt-5 text-base leading-8 text-white/62 sm:text-lg">{text}</p> : null}
    </Motion.div>
  )
}
