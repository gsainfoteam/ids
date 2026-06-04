import { type ElementType, type ReactNode } from 'react';

import { cn } from '../../utils';

export type TextVariant = 'display' | 'heading' | 'title' | 'body' | 'label' | 'caption';

const variantStyles: Record<TextVariant, string> = {
  display: 'text-[length:var(--ids-text-display)] font-[number:var(--ids-text-display--font-weight)] leading-[var(--ids-text-display--line-height)] tracking-[var(--ids-text-display--letter-spacing)]',
  heading: 'text-[length:var(--ids-text-heading)] font-[number:var(--ids-text-heading--font-weight)] leading-[var(--ids-text-heading--line-height)] tracking-[var(--ids-text-heading--letter-spacing)]',
  title: 'text-[length:var(--ids-text-title)] font-[number:var(--ids-text-title--font-weight)] leading-[var(--ids-text-title--line-height)] tracking-[var(--ids-text-title--letter-spacing)]',
  body: 'text-[length:var(--ids-text-body)] font-[number:var(--ids-text-body--font-weight)] leading-[var(--ids-text-body--line-height)] tracking-[var(--ids-text-body--letter-spacing)]',
  label: 'text-[length:var(--ids-text-label)] font-[number:var(--ids-text-label--font-weight)] leading-[var(--ids-text-label--line-height)] tracking-[var(--ids-text-label--letter-spacing)]',
  caption: 'text-[length:var(--ids-text-caption)] font-[number:var(--ids-text-caption--font-weight)] leading-[var(--ids-text-caption--line-height)] tracking-[var(--ids-text-caption--letter-spacing)]',
};

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
        variantStyles[variant],
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
