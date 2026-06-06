import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '../../utils';

export function FloatingButton({
  children,
  variant = 'solid',
  size = 'lg',
  placement = 'bottom-right',
  disabled,
  className,
  ...props
}: FloatingButton.Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'fixed z-40 inline-flex items-center justify-center gap-2 font-semibold transition-all',
        'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40',
        'hover:-translate-y-0.5',
        {
          'bg-(--ids-color-primary) text-(--ids-color-on-primary)': variant === 'solid',
          'border border-(--ids-color-outline) bg-(--ids-color-surface) text-(--ids-color-on-surface)':
            variant === 'surface',
        },
        {
          'h-12 min-w-12 rounded-full px-4 text-sm': size === 'md',
          'h-14 min-w-14 rounded-full px-5 text-base': size === 'lg',
          'h-16 min-w-16 rounded-full px-6 text-lg': size === 'xl',
        },
        {
          'top-6 left-6': placement === 'top-left',
          'top-6 right-6': placement === 'top-right',
          'bottom-6 left-6': placement === 'bottom-left',
          'right-6 bottom-6': placement === 'bottom-right',
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export namespace FloatingButton {
  export type Variant = 'solid' | 'surface';
  export type Size = 'md' | 'lg' | 'xl';
  export type Placement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  export type Props = {
    children: ReactNode;
    variant?: Variant;
    size?: Size;
    placement?: Placement;
    className?: string;
  } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'type'>;
}
