import type { ReactNode } from 'react';

import { cn } from '../../utils';

export function Card({
  children,
  variant = 'outline',
  size = 'md',
  interactive,
  onClick,
  className,
}: Card.Props) {
  const isInteractive = interactive ?? Boolean(onClick);

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'bg-(--ids-color-surface) transition-colors',
        {
          'border border-(--ids-color-outline)': variant === 'outline',
          'border border-transparent shadow-lg': variant === 'elevated',
          'border border-transparent bg-(--ids-color-muted)': variant === 'filled',
          'border border-transparent bg-transparent': variant === 'ghost',
        },
        {
          'rounded-md': size === 'sm',
          'rounded-lg': size === 'md',
          'rounded-xl': size === 'lg',
        },
        isInteractive &&
          'cursor-pointer hover:bg-(--ids-color-muted) focus-visible:outline-2 focus-visible:outline-offset-2',
        className,
      )}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-col gap-1 p-4 pb-0', className)}>{children}</div>;
}

function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('text-title text-(--ids-color-on-surface)', className)}>{children}</h3>;
}

function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-caption text-(--ids-color-on-muted)', className)}>{children}</p>;
}

function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-4', className)}>{children}</div>;
}

function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex items-center p-4 pt-0', className)}>{children}</div>;
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export namespace Card {
  export type Variant = 'outline' | 'elevated' | 'filled' | 'ghost';
  export type Size = 'sm' | 'md' | 'lg';

  export type Props = {
    children: ReactNode;
    variant?: Variant;
    size?: Size;
    interactive?: boolean;
    onClick?: () => void;
    className?: string;
  };
}
