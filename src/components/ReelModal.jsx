import { AnimatePresence, motion as Motion } from 'framer-motion'
import { ExternalLink, Eye, Heart, MessageCircle, Play, X } from 'lucide-react'
import { createElement, useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'

export default function ReelModal({ reel, onClose }) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const hasVideo = Boolean(reel?.videoUrl)

  const playVideo = (withSound = false) => {
    const video = videoRef.current
    if (!video) return

    video.muted = !withSound
    setIsMuted(!withSound)
    video.play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        video.muted = true
        setIsMuted(true)
        video.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false))
      })
  }

  useEffect(() => {
    if (!reel) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, reel])

  useEffect(() => {
    if (!hasVideo) return
    playVideo(false)
  }, [hasVideo, reel])

  return (
    <AnimatePresence>
      {reel ? (
        <Motion.div
          className="fixed inset-0 z-[100] overflow-y-auto bg-black/88 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <Motion.div
            className="relative grid min-h-full w-full bg-[#050108] lg:h-full lg:overflow-hidden lg:grid-cols-[minmax(320px,44vw)_1fr]"
            initial={{ opacity: 0, scale: 0.92, y: 36 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 36 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <img src={reel.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20 blur-3xl" />
            <Button
              size="icon"
              variant="glass"
              className="absolute right-4 top-4 z-20"
              aria-label="Close reel preview"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="relative z-10 flex min-h-[100svh] items-center justify-center px-4 py-16 lg:min-h-full lg:px-10">
              <div className="relative aspect-[9/16] h-[min(78svh,820px)] max-h-[820px] overflow-hidden rounded-[8px] border border-white/15 bg-black shadow-[0_0_100px_rgba(217,70,239,0.28)]">
                {hasVideo ? (
                  <>
                    <video
                      ref={videoRef}
                      src={reel.videoUrl}
                      poster={reel.image}
                      className="h-full w-full object-cover"
                      controls
                      loop
                      muted={isMuted}
                      playsInline
                      preload="metadata"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onVolumeChange={(event) => setIsMuted(event.currentTarget.muted)}
                    />
                    {(!isPlaying || isMuted) ? (
                      <button
                        type="button"
                        className="absolute inset-0 grid place-items-center bg-black/10 transition hover:bg-black/0"
                        aria-label="Play reel with sound"
                        onClick={(event) => {
                          event.stopPropagation()
                          playVideo(true)
                        }}
                      >
                        <span className="grid h-20 w-20 place-items-center rounded-full bg-white/18 text-white shadow-[0_0_45px_rgba(236,72,153,0.45)] backdrop-blur-xl">
                          <Play className="ml-1 h-9 w-9 fill-white text-white" />
                        </span>
                      </button>
                    ) : null}
                  </>
                ) : (
                  <>
                    <img src={reel.image} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 grid place-items-center">
                      <span className="grid h-20 w-20 place-items-center rounded-full bg-white/15 backdrop-blur-xl">
                        <Play className="h-8 w-8 fill-white text-white" />
                      </span>
                    </div>
                  </>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/25" />
              </div>
            </div>
            <div className="relative z-10 flex flex-col justify-end border-t border-white/10 bg-black/30 p-6 backdrop-blur-xl lg:border-l lg:border-t-0 lg:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fuchsia-200">
                {reel.isPinned ? 'Featured' : reel.tag} Reel
              </p>
              <h3 className="mt-4 max-w-2xl text-4xl font-black leading-none text-white sm:text-5xl">{reel.title}</h3>
              <p className="mt-5 max-w-xl leading-7 text-white/62">
                {reel.caption || 'A cinematic vertical cut with transition hooks, beauty lighting, and a scroll-stopping first frame.'}
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
              <div className="mt-7 flex flex-wrap gap-3">
                {reel.permalink ? (
                  <Button asChild variant="glass">
                    <a href={reel.permalink} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                      Open Reel
                    </a>
                  </Button>
                ) : null}
                <Button asChild>
                  <a href="#contact" onClick={onClose}>
                    <MessageCircle className="h-4 w-4" />
                    Book Similar
                  </a>
                </Button>
              </div>
            </div>
          </Motion.div>
        </Motion.div>
      ) : null}
    </AnimatePresence>
  )
}
