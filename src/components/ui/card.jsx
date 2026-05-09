import { cn } from '../../lib/utils'

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-[8px] border border-white/12 bg-white/[0.065] shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl',
        className,
      )}
      {...props}
    />
  )
}
