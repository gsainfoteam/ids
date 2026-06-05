import type { ReactNode } from 'react';

import { cn } from '../../utils';

export function Item({ children, onClick, className }: Item.Props) {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full text-left py-3',
        onClick && 'cursor-pointer hover:bg-muted transition-colors rounded-xl -mx-2 px-2',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

function ItemLeading({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('shrink-0 text-on-surface', className)}>{children}</span>;
}

function ItemContent({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('flex-1 min-w-0 flex flex-col', className)}>{children}</span>;
}

function ItemTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('text-label text-on-surface', className)}>{children}</span>;
}

function ItemDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('text-caption text-on-muted', className)}>{children}</span>;
}

function ItemTrailing({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('shrink-0 text-on-muted', className)}>{children}</span>;
}

Item.Leading = ItemLeading;
Item.Content = ItemContent;
Item.Title = ItemTitle;
Item.Description = ItemDescription;
Item.Trailing = ItemTrailing;

export namespace Item {
  export type Props = {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
  };
}
