import { AnimatePresence, motion as Motion } from 'framer-motion'
import { Eye, Heart, MessageCircle, Play, X } from 'lucide-react'
import { createElement } from 'react'
import { Button } from './ui/button'

export default function ReelModal({ reel, onClose }) {
  return (
    <AnimatePresence>
      {reel ? (
        <Motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/78 p-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <Motion.div
            className="relative grid w-full max-w-4xl overflow-hidden rounded-[8px] border border-white/15 bg-[#0b0610] shadow-[0_0_100px_rgba(217,70,239,0.28)] md:grid-cols-[0.72fr_1fr]"
            initial={{ opacity: 0, scale: 0.92, y: 36 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 36 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <Button
              size="icon"
              variant="glass"
              className="absolute right-4 top-4 z-10"
              aria-label="Close reel preview"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="relative aspect-[9/16] min-h-[560px] overflow-hidden bg-black">
              <img src={reel.image} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
              <div className="absolute inset-0 grid place-items-center">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-white/15 backdrop-blur-xl">
                  <Play className="h-8 w-8 fill-white text-white" />
                </span>
              </div>
            </div>
            <div className="flex flex-col justify-end p-7 sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fuchsia-200">{reel.tag} Reel</p>
              <h3 className="mt-4 text-4xl font-black leading-none text-white">{reel.title}</h3>
              <p className="mt-5 text-white/62">
                A cinematic vertical cut with transition hooks, beauty lighting, and a scroll-stopping first frame.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  [Eye, reel.views],
                  [Heart, reel.likes],
                  [MessageCircle, reel.comments],
                ].map(([LucideIcon, value]) => (
                  <div key={value} className="rounded-[8px] border border-white/10 bg-white/[0.06] p-4">
                    {createElement(LucideIcon, { className: 'mb-3 h-5 w-5 text-pink-200' })}
                    <p className="text-lg font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Motion.div>
        </Motion.div>
      ) : null}
    </AnimatePresence>
  )
}
