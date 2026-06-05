import type { ReactNode } from 'react';

import { tv, type VariantProps } from '../../utils';

const badge = tv({
  base: 'inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap',
  variants: {
    variant: {
      solid: 'bg-primary text-on-primary',
      soft: 'bg-secondary text-on-secondary',
      outline: 'border border-outline text-on-surface',
      ghost: 'text-on-surface',
    },
    size: {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
    },
  },
  defaultVariants: {
    variant: 'soft',
    size: 'sm',
  },
});

type BadgeVariantProps = VariantProps<typeof badge>;

export function Badge({ children, variant, size, className }: Badge.Props) {
  return (
    <span className={badge({ variant, size, class: className })}>
      {children}
    </span>
  );
}

export namespace Badge {
  export type Props = {
    children: ReactNode;
    className?: string;
  } & BadgeVariantProps;
}
