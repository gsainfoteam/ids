import type { ReactNode } from 'react';

import { cn } from '../../utils';

export function Empty({ children, variant = 'default', className }: Empty.Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center text-(--ids-color-on-surface)',
        variant === 'default' ? 'gap-3 p-12' : 'gap-2 p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

function EmptyMedia({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('text-(--ids-color-on-muted)', className)}>{children}</div>;
}

function EmptyTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('text-title font-semibold', className)}>{children}</div>;
}

function EmptyDescription({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-label max-w-sm text-(--ids-color-on-muted)', className)}>{children}</p>
  );
}

function EmptyActions({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mt-2 flex items-center justify-center gap-2', className)}>{children}</div>
  );
}

Empty.Media = EmptyMedia;
Empty.Title = EmptyTitle;
Empty.Description = EmptyDescription;
Empty.Actions = EmptyActions;

export namespace Empty {
  export type Props = {
    children: ReactNode;
    variant?: 'default' | 'compact';
    className?: string;
  };
}
