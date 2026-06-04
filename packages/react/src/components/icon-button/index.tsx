import type { ReactNode } from 'react';

import { tv, type VariantProps } from 'tailwind-variants';

const iconButton = tv({
  base: 'inline-flex items-center justify-center rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40',
  variants: {
    variant: {
      solid: 'bg-[var(--ids-color-primary)] text-[var(--ids-color-on-primary)] hover:opacity-90',
      soft: 'bg-[var(--ids-color-secondary)] text-[var(--ids-color-on-secondary)] hover:opacity-80',
      outline: 'border border-[var(--ids-color-primary)] text-[var(--ids-color-primary)] hover:bg-[var(--ids-color-primary)]/10',
      ghost: 'text-[var(--ids-color-primary)] hover:bg-[var(--ids-color-primary)]/10',
    },
    size: {
      sm: 'size-8',
      md: 'size-10',
      lg: 'size-12',
    },
  },
  defaultVariants: {
    variant: 'ghost',
    size: 'md',
  },
});

type IconButtonVariantProps = VariantProps<typeof iconButton>;

export function IconButton({
  icon,
  variant,
  size,
  disabled,
  onClick,
  label,
  className,
}: IconButton.Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={iconButton({ variant, size, class: className })}
    >
      {icon}
    </button>
  );
}

export namespace IconButton {
  export type Props = {
    icon: ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    label: string;
    className?: string;
  } & IconButtonVariantProps;
}
