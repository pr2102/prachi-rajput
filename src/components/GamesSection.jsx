import { createElement, useEffect, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Bomb, Gamepad2, RotateCcw, Scissors, Sparkles, Trophy, Zap } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

const gameTabs = [
  { id: 'runner', title: 'Beauty Runner', icon: Sparkles },
  { id: 'snake', title: 'Trend Snake', icon: Zap },
  { id: 'ninja', title: 'Reel Ninja', icon: Scissors },
]

const lanes = [18, 50, 82]
const runnerItems = [
  { icon: '💄', type: 'good' },
  { icon: '💍', type: 'good' },
  { icon: '📸', type: 'good' },
  { icon: '🔋', type: 'bad' },
  { icon: '🌫️', type: 'bad' },
]
const ninjaItems = ['💖', '💬', '📈', '✨', '🎬', '🧨']
const gridSize = 12

function useTicker(active, delay, callback) {
  useEffect(() => {
    if (!active) return undefined
    const timer = setInterval(callback, delay)
    return () => clearInterval(timer)
  }, [active, callback, delay])
}

function GameShell({ title, score, best, running, onStart, children }) {
  return (
    <div className="relative overflow-hidden rounded-[8px] border border-white/12 bg-black/35 p-4 shadow-[0_0_80px_rgba(236,72,153,0.16)] backdrop-blur-xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-100">{title}</p>
          <p className="mt-1 text-sm text-white/45">{running ? 'Live round' : 'Ready'}</p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-[8px] border border-white/10 bg-white/[0.06] px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Score</p>
            <p className="text-lg font-black text-white">{score}</p>
          </div>
          <div className="rounded-[8px] border border-fuchsia-200/20 bg-fuchsia-200/10 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-100/70">Best</p>
            <p className="text-lg font-black text-fuchsia-100">{best}</p>
          </div>
          <Button size="icon" variant="glass" onClick={onStart} aria-label={`Restart ${title}`}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {children}
    </div>
  )
}

function BeautyRunner() {
  const [lane, setLane] = useState(1)
  const [items, setItems] = useState([])
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [running, setRunning] = useState(false)

  const start = () => {
    setLane(1)
    setItems([])
    setScore(0)
    setRunning(true)
  }

  useTicker(running, 420, () => {
    setItems((current) => {
      const moved = current
        .map((item) => ({ ...item, y: item.y + 12 }))
        .filter((item) => item.y < 104)
      if (Math.random() > 0.35) {
        const item = runnerItems[Math.floor(Math.random() * runnerItems.length)]
        moved.push({ ...item, id: `${Date.now()}-${Math.random()}`, lane: Math.floor(Math.random() * 3), y: -8 })
      }
      return moved
    })
  })

  useTicker(running, 80, () => {
    setItems((current) => {
      let alive = true
      let gained = 0
      const remaining = current.filter((item) => {
        const hit = item.lane === lane && item.y >= 72 && item.y <= 92
        if (!hit) return true
        if (item.type === 'bad') alive = false
        if (item.type === 'good') gained += 10
        return false
      })

      if (gained) setScore((value) => value + gained)
      if (!alive) {
        setRunning(false)
        setBest((value) => Math.max(value, score))
      }

      return remaining
    })
  })

  const move = (direction) => {
    setRunning(true)
    setLane((value) => Math.min(2, Math.max(0, value + direction)))
  }

  return (
    <GameShell title="Beauty Runner" score={score} best={best} running={running} onStart={start}>
      <div className="relative h-96 overflow-hidden rounded-[8px] border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(244,114,182,0.28),transparent_34%),linear-gradient(180deg,#16051d,#07020b)]">
        {lanes.map((left) => (
          <div key={left} className="absolute top-0 h-full w-px bg-white/10" style={{ left: `${left}%` }} />
        ))}
        {items.map((item) => (
          <span key={item.id} className="absolute -translate-x-1/2 text-3xl drop-shadow-[0_0_18px_rgba(244,114,182,0.8)]" style={{ left: `${lanes[item.lane]}%`, top: `${item.y}%` }}>
            {item.icon}
          </span>
        ))}
        <div className="absolute bottom-8 -translate-x-1/2 rounded-full border border-white/20 bg-white/15 px-4 py-3 text-4xl shadow-[0_0_38px_rgba(244,114,182,0.55)] backdrop-blur-xl" style={{ left: `${lanes[lane]}%` }}>
          💃
        </div>
        {!running ? (
          <button type="button" onClick={start} className="absolute inset-0 grid place-items-center bg-black/35">
            <span className="rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-black">Start Run</span>
          </button>
        ) : null}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="glass" onClick={() => move(-1)}><ArrowLeft className="h-4 w-4" />Left</Button>
        <Button variant="glass" onClick={() => move(1)}>Right<ArrowRight className="h-4 w-4" /></Button>
      </div>
    </GameShell>
  )
}

function TrendSnake() {
  const [snake, setSnake] = useState([{ x: 5, y: 5 }])
  const [direction, setDirection] = useState({ x: 1, y: 0 })
  const [food, setFood] = useState({ x: 8, y: 5 })
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [running, setRunning] = useState(false)

  const start = () => {
    setSnake([{ x: 5, y: 5 }])
    setDirection({ x: 1, y: 0 })
    setFood({ x: 8, y: 5 })
    setScore(0)
    setRunning(true)
  }

  useTicker(running, 170, () => {
    setSnake((current) => {
      const head = current[0]
      const next = { x: head.x + direction.x, y: head.y + direction.y }
      const hitWall = next.x < 0 || next.y < 0 || next.x >= gridSize || next.y >= gridSize
      const hitSelf = current.some((cell) => cell.x === next.x && cell.y === next.y)

      if (hitWall || hitSelf) {
        setRunning(false)
        setBest((value) => Math.max(value, score))
        return current
      }

      const ate = next.x === food.x && next.y === food.y
      if (ate) {
        setScore((value) => value + 5)
        setFood({ x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) })
        return [next, ...current]
      }

      return [next, ...current.slice(0, -1)]
    })
  })

  const turn = (nextDirection) => {
    setRunning(true)
    setDirection((current) => {
      if (current.x + nextDirection.x === 0 && current.y + nextDirection.y === 0) return current
      return nextDirection
    })
  }

  return (
    <GameShell title="Trend Snake" score={score} best={best} running={running} onStart={start}>
      <div className="grid aspect-square rounded-[8px] border border-white/10 bg-[linear-gradient(135deg,#07110f,#17041e)] p-2" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const x = index % gridSize
          const y = Math.floor(index / gridSize)
          const snakeCell = snake.some((cell) => cell.x === x && cell.y === y)
          const isHead = snake[0]?.x === x && snake[0]?.y === y
          const isFood = food.x === x && food.y === y

          return (
            <div key={`${x}-${y}`} className="aspect-square p-[2px]">
              <div className={cn('h-full rounded-[4px] border border-white/[0.03] bg-white/[0.035]', snakeCell && 'bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.65)]', isHead && 'bg-fuchsia-300', isFood && 'bg-pink-400 shadow-[0_0_22px_rgba(244,114,182,0.8)]')} />
            </div>
          )
        })}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <span />
        <Button size="icon" variant="glass" onClick={() => turn({ x: 0, y: -1 })} aria-label="Up"><ArrowUp className="h-4 w-4" /></Button>
        <span />
        <Button size="icon" variant="glass" onClick={() => turn({ x: -1, y: 0 })} aria-label="Left"><ArrowLeft className="h-4 w-4" /></Button>
        <Button size="icon" variant="glass" onClick={start} aria-label="Restart"><RotateCcw className="h-4 w-4" /></Button>
        <Button size="icon" variant="glass" onClick={() => turn({ x: 1, y: 0 })} aria-label="Right"><ArrowRight className="h-4 w-4" /></Button>
        <span />
        <Button size="icon" variant="glass" onClick={() => turn({ x: 0, y: 1 })} aria-label="Down"><ArrowDown className="h-4 w-4" /></Button>
        <span />
      </div>
    </GameShell>
  )
}

function ReelNinja() {
  const [items, setItems] = useState([])
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [running, setRunning] = useState(false)
  const [lives, setLives] = useState(3)

  const start = () => {
    setItems([])
    setScore(0)
    setLives(3)
    setRunning(true)
  }

  useTicker(running, 520, () => {
    setItems((current) => {
      const moved = current
        .map((item) => ({ ...item, y: item.y + item.speed, rotate: item.rotate + item.spin }))
        .filter((item) => item.y < 104)
      const isBad = Math.random() > 0.78
      moved.push({
        id: `${Date.now()}-${Math.random()}`,
        label: isBad ? '🧨' : ninjaItems[Math.floor(Math.random() * (ninjaItems.length - 1))],
        type: isBad ? 'bad' : 'good',
        x: 10 + Math.random() * 80,
        y: -8,
        speed: 7 + Math.random() * 5,
        rotate: 0,
        spin: Math.random() > 0.5 ? 16 : -16,
      })
      return moved
    })
  })

  useTicker(running, 620, () => {
    setItems((current) => {
      const missedGood = current.filter((item) => item.type === 'good' && item.y >= 96).length
      if (missedGood) {
        setLives((value) => {
          const next = value - missedGood
          if (next <= 0) {
            setRunning(false)
            setBest((bestValue) => Math.max(bestValue, score))
          }
          return Math.max(0, next)
        })
      }
      return current.filter((item) => item.y < 96)
    })
  })

  const slice = (target) => {
    setRunning(true)
    setItems((current) => current.filter((item) => item.id !== target.id))
    if (target.type === 'good') {
      setScore((value) => value + 8)
    } else {
      setLives((value) => {
        const next = value - 1
        if (next <= 0) {
          setRunning(false)
          setBest((bestValue) => Math.max(bestValue, score))
        }
        return Math.max(0, next)
      })
    }
  }

  return (
    <GameShell title="Reel Ninja" score={score} best={best} running={running} onStart={start}>
      <div className="relative h-96 overflow-hidden rounded-[8px] border border-white/10 bg-[radial-gradient(circle_at_40%_0%,rgba(251,113,133,0.22),transparent_36%),linear-gradient(180deg,#17031c,#07020b)]">
        <div className="absolute left-4 top-4 flex gap-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <HeartLife key={index} active={index < lives} />
          ))}
        </div>
        {items.map((item) => (
          <button key={item.id} type="button" className="absolute -translate-x-1/2 text-4xl drop-shadow-[0_0_18px_rgba(244,114,182,0.8)]" style={{ left: `${item.x}%`, top: `${item.y}%`, transform: `translateX(-50%) rotate(${item.rotate}deg)` }} onClick={() => slice(item)} aria-label={item.type === 'bad' ? 'Avoid bomb' : 'Slice reaction'}>
            {item.label}
          </button>
        ))}
        {!running ? (
          <button type="button" onClick={start} className="absolute inset-0 grid place-items-center bg-black/35">
            <span className="rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-black">Start Slice</span>
          </button>
        ) : null}
      </div>
    </GameShell>
  )
}

function HeartLife({ active }) {
  return <span className={cn('grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-white/10 text-sm', active ? 'text-pink-200' : 'text-white/20')}>♥</span>
}

export default function GamesSection() {
  const [active, setActive] = useState('runner')
  const ActiveIcon = gameTabs.find((tab) => tab.id === active)?.icon || Gamepad2

  return (
    <section id="games" className="section-shell gsap-panel">
      <div className="relative overflow-hidden rounded-[8px] border border-white/12 bg-[linear-gradient(135deg,rgba(236,72,153,0.18),rgba(34,197,94,0.08),rgba(8,2,13,0.88))] p-5 shadow-[0_0_120px_rgba(236,72,153,0.15)] sm:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-200 to-transparent" />
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <SectionHeading align="left" kicker="Creator arcade" title="Fast games with a glam score rush." text="Three tap-first mini games built for quick replays, streak chasing, and creator-energy chaos." />
            <div className="mt-8 grid gap-3">
              {gameTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActive(tab.id)}
                  className={cn(
                    'flex items-center justify-between rounded-[8px] border p-4 text-left transition',
                    active === tab.id ? 'border-fuchsia-200 bg-white text-black shadow-[0_0_40px_rgba(244,114,182,0.25)]' : 'border-white/10 bg-white/[0.06] text-white hover:border-fuchsia-200/45',
                  )}
                >
                  <span className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em]">
                    {createElement(tab.icon, { className: 'h-5 w-5' })}
                    {tab.title}
                  </span>
                  {active === tab.id ? <Trophy className="h-5 w-5" /> : <Gamepad2 className="h-5 w-5 opacity-55" />}
                </button>
              ))}
            </div>
            <div className="mt-6 rounded-[8px] border border-white/10 bg-black/24 p-4">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-fuchsia-100">
                <ActiveIcon className="h-4 w-4" />
                Active game
              </p>
              <p className="mt-2 text-3xl font-black text-white">{gameTabs.find((tab) => tab.id === active)?.title}</p>
            </div>
          </div>
          <div>
            {active === 'runner' ? <BeautyRunner /> : null}
            {active === 'snake' ? <TrendSnake /> : null}
            {active === 'ninja' ? <ReelNinja /> : null}
          </div>
        </div>
      </div>
    </section>
  )
}
