import type { ComponentProps, CSSProperties, ReactNode } from 'react';

import {
  interactiveDataProps,
  useInteractive,
  type InteractiveState,
} from '../../hooks/use-interactive';
import { tv, type VariantProps } from '../../utils';

function resolveProp<T>(value: T | ((state: InteractiveState) => T) | undefined, state: InteractiveState) {
  return typeof value === 'function' ? (value as (state: InteractiveState) => T)(state) : value;
}

export function Button({
  children,
  className,
  style,
  variant,
  size,
  type = 'button',
  disabled,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  ...props
}: Button.Props) {
  const { state, handlers } = useInteractive<HTMLButtonElement>({
    disabled,
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onFocus,
    onBlur,
    onKeyDown,
    onKeyUp,
  });

  return (
    <button
      type={type}
      disabled={disabled}
      className={Button.Style({ variant, size, className: resolveProp(className, state) })}
      style={resolveProp(style, state)}
      {...interactiveDataProps(state)}
      {...handlers}
      {...props}
    >
      {resolveProp(children, state)}
    </button>
  );
}

export namespace Button {
  export const Style = tv({
    base: [
      'inline-flex items-center justify-center gap-2 select-none transition-all',
      'cursor-pointer data-disabled:cursor-not-allowed',
      'data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-(--ids-color-primary)',
      'data-active:scale-[0.98] data-disabled:opacity-40',
      'motion-reduce:transition-none motion-reduce:data-active:scale-100',
    ],
    variants: {
      variant: {
        solid:
          'bg-(--ids-color-primary) text-(--ids-color-on-primary) data-hovered:opacity-90 data-active:opacity-95',
        soft: 'bg-(--ids-color-primary)/15 text-(--ids-color-primary) data-hovered:bg-(--ids-color-primary)/20 data-active:bg-(--ids-color-primary)/25',
        outline:
          'inset-ring-1 inset-ring-(--ids-color-outline) bg-transparent text-(--ids-color-primary) data-hovered:bg-(--ids-color-primary)/10 data-active:bg-(--ids-color-primary)/15',
        ghost:
          'bg-transparent text-(--ids-color-primary) data-hovered:bg-(--ids-color-primary)/10 data-active:bg-(--ids-color-primary)/15',
      },
      size: {
        standard: 'h-12 px-4.5 text-button-standard rounded-xl',
        tiny: 'h-8 px-2.5 text-button-tiny rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'standard',
    },
  });

  export type Props = Omit<ComponentProps<'button'>, 'children' | 'className' | 'style'> &
    VariantProps<typeof Style> & {
      children?: ReactNode | ((state: InteractiveState) => ReactNode);
      className?: string | ((state: InteractiveState) => string | undefined);
      style?: CSSProperties | ((state: InteractiveState) => CSSProperties | undefined);
    };
}
