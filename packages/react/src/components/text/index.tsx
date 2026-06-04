import { type ElementType, type ReactNode } from 'react';

import { cn } from '../../utils';

export type TextVariant = 'display' | 'heading' | 'title' | 'body' | 'label' | 'caption';

const defaultTag: Record<TextVariant, ElementType> = {
  display: 'p',
  heading: 'p',
  title: 'p',
  body: 'p',
  label: 'span',
  caption: 'span',
};

export function Text({
  children,
  variant = 'body',
  color,
  align,
  as,
  className,
}: Text.Props) {
  const Tag = as ?? defaultTag[variant];

  return (
    <Tag
      className={cn(
        `text-${variant}`,
        color === 'muted' && 'text-[var(--ids-color-on-muted)]',
        color === 'primary' && 'text-[var(--ids-color-primary)]',
        color === 'on-surface' && 'text-[var(--ids-color-on-surface)]',
        !color && 'text-[var(--ids-color-on-surface)]',
        align && `text-${align}`,
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export namespace Text {
  export type Props = {
    children: ReactNode;
    variant?: TextVariant;
    color?: 'on-surface' | 'muted' | 'primary';
    align?: 'left' | 'center' | 'right';
    as?: ElementType;
    className?: string;
  };
}
