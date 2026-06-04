import { type ElementType, type ReactNode } from 'react';

import { tv, type VariantProps } from 'tailwind-variants';

const text = tv({
  base: 'text-[var(--ids-color-on-surface)]',
  variants: {
    variant: {
      display: 'text-display',
      heading: 'text-heading',
      title: 'text-title',
      body: 'text-body',
      label: 'text-label',
      caption: 'text-caption',
    },
    color: {
      'on-surface': 'text-[var(--ids-color-on-surface)]',
      muted: 'text-[var(--ids-color-on-muted)]',
      primary: 'text-[var(--ids-color-primary)]',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});

const defaultTag: Record<NonNullable<TextVariantProps['variant']>, ElementType> = {
  display: 'p',
  heading: 'p',
  title: 'p',
  body: 'p',
  label: 'span',
  caption: 'span',
};

type TextVariantProps = VariantProps<typeof text>;
export type TextVariant = NonNullable<TextVariantProps['variant']>;

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
    <Tag className={text({ variant, color, align, class: className })}>
      {children}
    </Tag>
  );
}

export namespace Text {
  export type Props = {
    children: ReactNode;
    as?: ElementType;
    className?: string;
  } & TextVariantProps;
}
