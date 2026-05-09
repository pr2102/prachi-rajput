import { cn } from '../../lib/utils'

export function Input({ className, as = 'input', ...props }) {
  const Comp = as
  return (
    <Comp
      className={cn(
        'min-h-13 w-full rounded-[8px] border border-white/12 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none backdrop-blur-xl transition placeholder:text-white/35 focus:border-fuchsia-300/70 focus:bg-white/[0.11] focus:shadow-[0_0_35px_rgba(217,70,239,0.18)]',
        className,
      )}
      {...props}
    />
  )
}
