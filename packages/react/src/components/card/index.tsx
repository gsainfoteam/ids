import type { ReactNode } from 'react';

import { cn } from '../../utils';

export function Card({ children, className }: Card.Props) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-outline bg-surface',
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
  return <h3 className={cn('text-title text-on-surface', className)}>{children}</h3>;
}

function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-caption text-on-muted', className)}>{children}</p>;
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
  export type Props = {
    children: ReactNode;
    className?: string;
  };
}
