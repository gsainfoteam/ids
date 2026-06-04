import type { ReactNode } from 'react';

import { cn } from '../../utils';

export function Card({ children, className }: Card.Props) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--ids-color-outline)] bg-[var(--ids-color-surface)] p-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

export namespace Card {
  export type Props = {
    children: ReactNode;
    className?: string;
  };
}
