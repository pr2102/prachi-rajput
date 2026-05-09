import { createElement, useEffect, useMemo, useRef, useState } from 'react'
import { motion as Motion, useInView } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowUp,
  Camera,
  ChevronRight,
  Eye,
  Heart,
  Mail,
  MessageCircle,
  Play,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import LoadingScreen from '../components/LoadingScreen'
import MagneticButton from '../components/MagneticButton'
import ReelModal from '../components/ReelModal'
import SectionHeading from '../components/SectionHeading'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import {
  analytics,
  brandLogos,
  campaignStats,
  creator,
  gallery,
  heroImages,
  reels,
  services,
  testimonials,
} from '../data/creator'
import { useInstagramFeed } from '../hooks/useInstagramFeed'
import { useLenis } from '../hooks/useLenis'
import { cn } from '../lib/utils'

gsap.registerPlugin(ScrollTrigger)

const fadeUp = {
  hidden: { opacity: 0, y: 42, filter: 'blur(12px)' },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
  }),
}

function CountUp({ value, label, detail }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!inView) return
    let frame
    const numeric = Number.parseFloat(value.replace(/[^\d.]/g, ''))
    const suffix = value.replace(/[\d.]/g, '')
    const started = performance.now()

    const tick = (time) => {
      const progress = Math.min((time - started) / 1200, 1)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(`${Math.round(numeric * eased * 10) / 10}${suffix}`)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value])

  return (
    <div ref={ref} className="rounded-[8px] border border-white/12 bg-white/[0.075] p-4 backdrop-blur-xl">
      <p className="text-3xl font-black text-white">{display}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-100/80">{label}</p>
      {detail ? <p className="mt-2 text-xs text-white/45">{detail}</p> : null}
    </div>
  )
}

function useHoverTone(enabled) {
  return () => {
    if (!enabled) return
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const context = new AudioContext()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.frequency.value = 720
    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.04, context.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.12)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.13)
  }
}

function getFeedImage(item) {
  return item?.thumbnailUrl || item?.mediaUrl || ''
}

function Hero({ feed }) {
  const [imageIndex, setImageIndex] = useState(0)
  const liveImages = feed.items.map(getFeedImage).filter(Boolean)
  const images = liveImages.length ? liveImages.slice(0, 3) : heroImages
  const heroStats = feed.followersCount
    ? [
        { label: 'Followers', value: `${Math.round(feed.followersCount / 1000)}K`, detail: 'live from Instagram' },
        { label: 'Posts', value: `${feed.mediaCount || liveImages.length}`, detail: `@${feed.username}` },
        creator.stats[2],
      ]
    : creator.stats

  useEffect(() => {
    const timer = setInterval(() => {
      setImageIndex((current) => (current + 1) % images.length)
    }, 4200)
    return () => clearInterval(timer)
  }, [images.length])

  return (
    <section id="top" className="relative min-h-screen overflow-hidden px-4 pb-12 pt-4 sm:px-6 lg:px-8">
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between rounded-[8px] border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-2xl">
        <a href="#top" className="text-sm font-black uppercase tracking-[0.32em] text-white">
          Prachi
        </a>
        <div className="hidden items-center gap-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/55 md:flex">
          {['Reels', 'Brands', 'Analytics', 'Contact'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="transition hover:text-white">
              {item}
            </a>
          ))}
        </div>
        <Button asChild size="sm" variant="glass">
          <a href="#contact">Book</a>
        </Button>
      </nav>

      <div className="absolute inset-0">
        {images.map((image, index) => (
          <Motion.img
            key={image}
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            initial={false}
            animate={{ opacity: imageIndex === index ? 1 : 0, scale: imageIndex === index ? 1.04 : 1.1 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(217,70,239,0.42),transparent_34%),radial-gradient(circle_at_86%_42%,rgba(236,72,153,0.34),transparent_35%),linear-gradient(90deg,#050108_0%,rgba(5,1,8,0.82)_34%,rgba(5,1,8,0.28)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:70px_70px] opacity-35" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-end gap-8 pb-10 pt-16 lg:grid-cols-[1.08fr_0.92fr] lg:pt-24">
        <div>
          <Motion.div variants={fadeUp} initial="hidden" animate="visible">
            <Badge>
              <Sparkles className="h-3.5 w-3.5" />
              {creator.title}
            </Badge>
          </Motion.div>
          <Motion.h1
            className="mt-7 max-w-4xl text-6xl font-black leading-[0.86] text-white sm:text-8xl lg:text-[9.6rem]"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.12}
          >
            Prachi Rajput
          </Motion.h1>
          <Motion.p
            className="mt-7 max-w-2xl text-lg leading-8 text-white/68 sm:text-xl"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.24}
          >
            Cinematic reels, fashion-first storytelling, and brand moments designed to feel like culture before they feel like campaigns.
          </Motion.p>
          <Motion.div
            className="mt-9 flex flex-wrap gap-4"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.34}
          >
            <MagneticButton>
              <Button asChild>
                <a href="#reels">
                  <Play className="h-4 w-4 fill-black" />
                  Watch Reels
                </a>
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button asChild variant="glass">
                <a href="#contact">
                  Collaborate
                  <ChevronRight className="h-4 w-4" />
                </a>
              </Button>
            </MagneticButton>
          </Motion.div>
          <Motion.div
            className="mt-8 flex flex-wrap gap-3"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.42}
          >
            {creator.socials.map(({ label, href, icon: LucideIcon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                className="grid h-12 w-12 place-items-center rounded-full border border-white/12 bg-white/8 text-white backdrop-blur-xl transition hover:-translate-y-1 hover:border-fuchsia-200/60 hover:text-fuchsia-100 hover:shadow-[0_0_35px_rgba(236,72,153,0.4)]"
                aria-label={label}
              >
                {createElement(LucideIcon, { className: 'h-5 w-5' })}
              </a>
            ))}
          </Motion.div>
        </div>

        <Motion.div
          className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.45}
        >
          {heroStats.map((stat) => (
            <CountUp key={stat.label} {...stat} />
          ))}
        </Motion.div>
      </div>
    </section>
  )
}

function About({ feed }) {
  const aboutImage = getFeedImage(feed.items[1]) || getFeedImage(feed.items[0]) || 'https://images.unsplash.com/photo-1524503033411-c9566986fc8f?auto=format&fit=crop&w=900&q=85'

  return (
    <section id="about" className="section-shell gsap-panel">
      <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1fr]">
        <Motion.div
          className="relative mx-auto w-full max-w-md"
          initial={{ opacity: 0, rotateY: -16, y: 50 }}
          whileInView={{ opacity: 1, rotateY: 0, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-6 rounded-[8px] bg-fuchsia-500/25 blur-3xl" />
          <Card className="relative overflow-hidden p-3">
            <img
              src={aboutImage}
              alt="Prachi Rajput editorial portrait placeholder"
              className="aspect-[4/5] w-full rounded-[6px] object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-6 left-6 right-6 rounded-[8px] border border-white/12 bg-black/45 p-4 backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-fuchsia-100">Creator Mood</p>
              <p className="mt-2 text-2xl font-black text-white">Soft glam, sharp edits, main-character energy.</p>
            </div>
          </Card>
        </Motion.div>
        <div>
          <SectionHeading
            align="left"
            kicker="About the creator"
            title="A personal brand built for the scroll."
            text={creator.bio}
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {creator.aboutStats.map((stat) => (
              <CountUp key={stat.label} {...stat} />
            ))}
          </div>
          <p className="mt-7 leading-8 text-white/58">
            From fashion-first transitions to beauty launch storytelling, Prachi turns everyday moments into polished, high-retention reels with a feminine visual language and a confident editorial rhythm.
          </p>
        </div>
      </div>
    </section>
  )
}

function ReelCard({ reel, onPreview, soundEnabled, playTone }) {
  return (
    <Motion.button
      className="group relative aspect-[9/16] overflow-hidden rounded-[8px] border border-white/12 bg-white/[0.06] text-left shadow-[0_24px_80px_rgba(0,0,0,0.34)]"
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ duration: 0.28 }}
      onMouseEnter={playTone}
      onClick={() => onPreview(reel)}
      data-cursor
    >
      <img src={reel.image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
      <div className="absolute left-4 top-4 rounded-full bg-pink-500 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_0_25px_rgba(236,72,153,0.55)]">
        Trending
      </div>
      <div className="absolute inset-0 grid place-items-center opacity-0 transition duration-300 group-hover:opacity-100">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-white/16 backdrop-blur-xl">
          <Play className="h-7 w-7 fill-white text-white" />
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-100">{reel.tag}</p>
        <h3 className="mt-2 text-xl font-black leading-tight text-white">{reel.title}</h3>
        <div className="mt-4 flex items-center justify-between rounded-[8px] border border-white/10 bg-black/35 p-3 text-xs font-semibold text-white/80 backdrop-blur-xl">
          <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{reel.views}</span>
          <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" />{reel.likes}</span>
          <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" />{reel.comments}</span>
        </div>
      </div>
      {soundEnabled ? <span className="sr-only">Hover sound enabled</span> : null}
    </Motion.button>
  )
}

function ReelsShowcase({ feed }) {
  const [selected, setSelected] = useState(null)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const playTone = useHoverTone(soundEnabled)
  const displayReels = feed.items.length
    ? feed.items.slice(0, 5).map((item, index) => ({
        title: item.caption ? item.caption.split('\n')[0].slice(0, 46) || `Instagram Reel ${index + 1}` : `Instagram Reel ${index + 1}`,
        tag: item.mediaType === 'VIDEO' ? 'Reel' : 'Post',
        views: 'Live',
        likes: item.likeCount ? `${item.likeCount}` : 'IG',
        comments: item.commentsCount ? `${item.commentsCount}` : 'DM',
        image: getFeedImage(item),
        permalink: item.permalink,
      }))
    : reels

  return (
    <section id="reels" className="section-shell gsap-panel">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading
          align="left"
          kicker="Reels showcase"
          title="Vertical stories with a luxury pulse."
          text="Instagram-inspired cards, reel metrics, hover play states, and modal previews for campaign-ready creator work."
        />
        <Button variant="glass" onClick={() => setSoundEnabled((value) => !value)}>
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          Hover Sound
        </Button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {displayReels.map((reel, index) => (
          <Motion.div
            key={reel.title}
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-90px' }}
            transition={{ duration: 0.6, delay: index * 0.06 }}
          >
            <ReelCard reel={reel} onPreview={setSelected} soundEnabled={soundEnabled} playTone={playTone} />
          </Motion.div>
        ))}
      </div>
      <ReelModal reel={selected} onClose={() => setSelected(null)} />
    </section>
  )
}

function Brands() {
  return (
    <section id="brands" className="section-shell overflow-hidden">
      <SectionHeading
        kicker="Brand collaborations"
        title="Campaigns that feel editorial, then perform."
        text="A luxury marquee of sample partnerships, testimonials, and campaign result cards for brand teams."
      />
      <div className="marquee mt-12 border-y border-white/10 py-6">
        <div className="marquee-track">
          {[...brandLogos, ...brandLogos].map((brand, index) => (
            <span key={`${brand}-${index}`} className="mx-8 text-3xl font-black uppercase text-white/55">
              {brand}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {campaignStats.map(({ label, value, icon: LucideIcon }) => (
          <Card key={label} className="p-6">
            {createElement(LucideIcon, { className: 'h-6 w-6 text-fuchsia-200' })}
            <p className="mt-6 text-4xl font-black text-white">{value}</p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/45">{label}</p>
          </Card>
        ))}
      </div>
      <div className="mt-8">
        <Swiper
          modules={[Autoplay, EffectCoverflow, Pagination]}
          effect="coverflow"
          grabCursor
          centeredSlides
          slidesPerView="auto"
          autoplay={{ delay: 2600, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          coverflowEffect={{ rotate: 0, stretch: 0, depth: 140, modifier: 1.3, slideShadows: false }}
          className="testimonial-swiper"
        >
          {testimonials.map((item) => (
            <SwiperSlide key={item.name} className="max-w-xl">
              <Card className="min-h-64 p-8">
                <p className="text-xl font-semibold leading-9 text-white">"{item.quote}"</p>
                <p className="mt-8 font-black text-fuchsia-100">{item.name}</p>
                <p className="mt-1 text-sm text-white/45">{item.role}</p>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}

function Analytics() {
  return (
    <section id="analytics" className="section-shell gsap-panel">
      <SectionHeading
        kicker="Social analytics"
        title="Beautiful numbers, built for brand rooms."
        text="Sample creator analytics with follower growth, views, engagement, and campaign-readiness metrics."
      />
      <div className="mt-12 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5 sm:p-7">
          <div className="mb-7 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-fuchsia-100">Followers growth</p>
              <p className="mt-2 text-white/45">Six-month audience momentum</p>
            </div>
            <Badge>+62.8%</Badge>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics}>
                <defs>
                  <linearGradient id="followersGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.75} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#12071b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff' }} />
                <Area type="monotone" dataKey="followers" stroke="#f472b6" strokeWidth={3} fill="url(#followersGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <div className="grid gap-5">
          <Card className="p-5 sm:p-7">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-fuchsia-100">Views + engagement</p>
            <div className="mt-6 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics}>
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#12071b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff' }} />
                  <Line type="monotone" dataKey="views" stroke="#c084fc" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="engagement" stroke="#fb7185" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Engagement', '8.6%'],
              ['Avg. views', '3.1M'],
            ].map(([label, value]) => (
              <Card key={label} className="p-5">
                <p className="text-3xl font-black text-white">{value}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-white/45">{label}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Gallery({ feed }) {
  const [filter, setFilter] = useState('all')
  const liveGallery = useMemo(
    () =>
      feed.items.length
        ? feed.items.slice(0, 9).map((item, index) => ({
            category: item.mediaType === 'VIDEO' ? 'reels' : 'instagram',
            image: getFeedImage(item),
            height: index % 3 === 0 ? 'tall' : index % 3 === 1 ? 'medium' : 'short',
          }))
        : gallery,
    [feed.items],
  )
  const filtered = useMemo(() => (filter === 'all' ? liveGallery : liveGallery.filter((item) => item.category === filter)), [filter, liveGallery])
  const categories = feed.items.length ? ['all', 'instagram', 'reels'] : ['all', 'fashion', 'beauty', 'travel', 'lifestyle']

  return (
    <section id="gallery" className="section-shell">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading align="left" kicker="Gallery" title="A Pinterest moodboard in motion." text="Fashion, beauty, lifestyle, and travel frames curated like a creator media kit." />
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={cn(
                'rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition',
                filter === category ? 'border-fuchsia-200 bg-fuchsia-200 text-black' : 'border-white/12 bg-white/7 text-white/55 hover:text-white',
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
        {filtered.map((item) => (
          <Motion.div
            key={item.image}
            className="mb-5 break-inside-avoid overflow-hidden rounded-[8px] border border-white/12 bg-white/[0.06]"
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <img
              src={item.image}
              alt={`${item.category} creator frame`}
              className={cn('w-full object-cover transition duration-700 hover:scale-105', item.height === 'tall' ? 'h-[560px]' : item.height === 'medium' ? 'h-[420px]' : 'h-[320px]')}
              loading="lazy"
            />
          </Motion.div>
        ))}
      </div>
    </section>
  )
}

function Services() {
  return (
    <section id="services" className="section-shell gsap-panel">
      <SectionHeading kicker="Services" title="Creator offers with a polished campaign system." text="Everything a fashion, beauty, or lifestyle brand needs for social-native storytelling." />
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {services.map(({ title, text, icon: LucideIcon }, index) => (
          <Motion.div
            key={title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-90px' }}
            transition={{ duration: 0.6, delay: index * 0.05 }}
          >
            <Card className="group h-full p-6 transition hover:-translate-y-2 hover:border-fuchsia-200/45 hover:bg-white/[0.09]">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-pink-300 to-fuchsia-600 text-black shadow-[0_0_35px_rgba(236,72,153,0.35)]">
                {createElement(LucideIcon, { className: 'h-5 w-5' })}
              </div>
              <h3 className="mt-8 text-2xl font-black text-white">{title}</h3>
              <p className="mt-4 leading-7 text-white/55">{text}</p>
            </Card>
          </Motion.div>
        ))}
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="section-shell pb-16">
      <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr]">
        <div>
          <SectionHeading align="left" kicker="Contact" title="Let’s make your brand the reel they replay." text="Send a campaign brief, product launch, social story, or creator partnership inquiry." />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button asChild variant="glass">
              <a href={creator.profileUrl} target="_blank">
                <Camera className="h-4 w-4" />
                Instagram DM
              </a>
            </Button>
            <Button asChild>
              <a href="https://wa.me/919876543210" target="_blank">
                <MessageCircle className="h-4 w-4" />
                WhatsApp CTA
              </a>
            </Button>
          </div>
          <p className="mt-6 flex items-center gap-3 text-white/55">
            <Mail className="h-5 w-5 text-fuchsia-200" />
            {creator.email}
          </p>
        </div>
        <Card className="p-5 sm:p-8">
          <form className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="Your name" aria-label="Your name" />
              <Input placeholder="Brand name" aria-label="Brand name" />
            </div>
            <Input type="email" placeholder="Email address" aria-label="Email address" />
            <Input placeholder="Campaign budget" aria-label="Campaign budget" />
            <Input as="textarea" rows={6} placeholder="Tell Prachi about the launch, timeline, deliverables, and mood." aria-label="Collaboration details" />
            <Button type="button" className="mt-2 w-full">
              <Send className="h-4 w-4" />
              Send Inquiry
            </Button>
          </form>
        </Card>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
        <div>
          <p className="text-xl font-black text-white">Prachi Rajput</p>
          <p className="mt-1 text-sm text-white/45">Digital creator, reel artist, and fashion storyteller.</p>
        </div>
        <div className="flex items-center gap-3">
          {creator.socials.map(({ label, href, icon: LucideIcon }) => (
            <a key={label} href={href} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/7 text-white/65 transition hover:border-fuchsia-200/55 hover:text-white" aria-label={label}>
              {createElement(LucideIcon, { className: 'h-4 w-4' })}
            </a>
          ))}
          <a href="#top" className="grid h-10 w-10 place-items-center rounded-full bg-white text-black transition hover:-translate-y-1" aria-label="Back to top">
            <ArrowUp className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  const [loading, setLoading] = useState(true)
  const instagramFeed = useInstagramFeed()
  useLenis()

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const panels = gsap.utils.toArray('.gsap-panel')
    panels.forEach((panel) => {
      gsap.fromTo(
        panel,
        { y: 70, opacity: 0.65 },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: panel,
            start: 'top 82%',
            end: 'top 35%',
            scrub: true,
          },
        },
      )
    })

    return () => ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
  }, [])

  return (
    <div className="min-h-screen overflow-hidden bg-[#06020b] text-white">
      <LoadingScreen loading={loading} />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_15%,rgba(147,51,234,0.28),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(236,72,153,0.25),transparent_34%),linear-gradient(145deg,#050108,#110018_45%,#06020b)]" />
      <div className="fixed inset-0 -z-10 aurora-noise opacity-70" />
      <Hero feed={instagramFeed} />
      <About feed={instagramFeed} />
      <ReelsShowcase feed={instagramFeed} />
      <Brands />
      <Analytics />
      <Gallery feed={instagramFeed} />
      <Services />
      <Contact />
      <Footer />
      <button
        className="fixed bottom-5 right-5 z-50 grid h-12 w-12 place-items-center rounded-full border border-white/12 bg-white/10 text-white shadow-[0_0_35px_rgba(236,72,153,0.25)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white hover:text-black"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  )
}

