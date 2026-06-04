import type { ReactNode } from 'react';

import { cn } from '../../utils';

export function Item({
  leading,
  title,
  description,
  trailing,
  onClick,
  className,
}: Item.Props) {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full text-left',
        onClick && 'cursor-pointer hover:bg-[var(--ids-color-muted)] transition-colors rounded-xl -mx-2 px-2 py-2',
        className,
      )}
    >
      {leading && <span className="shrink-0">{leading}</span>}
      <span className="flex-1 min-w-0">
        <span className="block text-label text-[var(--ids-color-on-surface)] leading-none">{title}</span>
        {description && (
          <span className="block text-caption text-[var(--ids-color-on-muted)] mt-0.5">{description}</span>
        )}
      </span>
      {trailing && <span className="shrink-0">{trailing}</span>}
    </Tag>
  );
}

export namespace Item {
  export type Props = {
    leading?: ReactNode;
    title: string;
    description?: string;
    trailing?: ReactNode;
    onClick?: () => void;
    className?: string;
  };
}
