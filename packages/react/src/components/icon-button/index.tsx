import type { ReactNode } from 'react';

import { tv, type VariantProps } from '../../utils';

const iconButton = tv({
  // TODO: hover/active 인터랙션 스타일 추가 (opacity modifier 전략 확정 후)
  base: 'inline-flex items-center justify-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40',
  variants: {
    variant: {
      solid: 'bg-primary text-on-primary',
      soft: 'bg-secondary text-on-secondary',
      outline: 'border border-primary text-primary',
      ghost: 'text-primary',
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
      type="button"
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
