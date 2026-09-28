import { cn } from '../lib/utils.js'

/** Minimalist wordmark used in the header, drawer and footer (PRD §4.2). */
export default function Wordmark({ className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-baseline text-[15px] font-semibold uppercase leading-none tracking-[0.24em] sm:text-base',
        className,
      )}
      {...props}
    >
      C-STYLE
    </span>
  )
}
