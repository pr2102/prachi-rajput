import { cn } from '../../lib/utils'

export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-fuchsia-300/25 bg-fuchsia-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-100',
        className,
      )}
      {...props}
    />
  )
}
