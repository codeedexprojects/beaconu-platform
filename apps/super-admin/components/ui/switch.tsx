import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked,
      defaultChecked = false,
      onCheckedChange,
      disabled,
      onClick,
      ...props
    },
    ref,
  ) => {
    const isControlled = typeof checked === 'boolean'
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked)
    const isChecked = isControlled ? checked : internalChecked

    const toggle = () => {
      if (disabled) return
      const next = !isChecked
      if (!isControlled) {
        setInternalChecked(next)
      }
      onCheckedChange?.(next)
    }

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={isChecked}
        data-state={isChecked ? 'checked' : 'unchecked'}
        disabled={disabled}
        className={cn(
          'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isChecked ? 'bg-primary' : 'bg-input',
          className,
        )}
        onClick={(event) => {
          onClick?.(event)
          if (!event.defaultPrevented) {
            toggle()
          }
        }}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform',
            isChecked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
    )
  },
)
Switch.displayName = 'Switch'

export { Switch }
