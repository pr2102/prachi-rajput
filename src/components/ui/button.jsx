import { cloneElement, isValidElement } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-full px-6 text-sm font-semibold uppercase tracking-[0.18em] transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fuchsia-300 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-white text-black shadow-[0_0_35px_rgba(236,72,153,0.35)] hover:-translate-y-1 hover:shadow-[0_0_55px_rgba(236,72,153,0.55)]',
        glass:
          'border border-white/15 bg-white/8 text-white backdrop-blur-xl hover:border-fuchsia-300/60 hover:bg-white/14',
        ghost: 'text-white/80 hover:bg-white/10 hover:text-white',
      },
      size: {
        default: 'h-12',
        icon: 'h-12 w-12 px-0',
        sm: 'h-10 px-4 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({ className, variant, size, asChild = false, ...props }) {
  const classes = cn(buttonVariants({ variant, size }), className)

  if (asChild && isValidElement(props.children)) {
    return cloneElement(props.children, {
      ...props,
      className: cn(classes, props.children.props.className),
    })
  }

  return <button className={classes} {...props} />
}

export { Button }
