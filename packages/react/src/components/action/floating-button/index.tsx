import type { ComponentProps, CSSProperties, ReactNode, Ref } from 'react';

import { useFloatingButton, type FloatingPlacement } from './use-floating-button';
import { controlSurface, type ControlColorScheme } from '../../../internal/control-surface';
import { cn, tv } from '../../../utils';

import type { InteractiveState, WithInteractiveValues } from '../../../hooks/use-interactive';
import type { IdsSize } from '../../../tokens/types';

export type { FloatingPlacement } from './use-floating-button';

export function FloatingButton(props: FloatingButton.Props) {
  const {
    props: { variant = 'solid', colorScheme, size = 'standard', className, style, ...rest },
    placement,
    iconOnly,
    label,
    render,
  } = useFloatingButton(props);

  return render({
    ...rest,
    'aria-label': label ?? rest['aria-label'],
    'data-floating-button': '',
    'data-placement': placement,
    'data-size': size,
    'data-variant': variant,
    'data-icon-only': iconOnly ? '' : undefined,
    className: FloatingButton.Style({ variant, colorScheme, size, iconOnly, placement, className }),
    style,
  });
}

export type FloatingButtonProps = FloatingButton.Props;

export namespace FloatingButton {
  export type State = InteractiveState;
  export type Variant = 'solid' | 'soft' | 'outline';
  export type ColorScheme = ControlColorScheme;
  export type Placement = FloatingPlacement;

  type BaseProps = Omit<ComponentProps<'button'>, 'children' | 'className' | 'style' | 'ref'> & {
    ref?: Ref<HTMLElement>;
    variant?: Variant;
    colorScheme?: ColorScheme;
    size?: IdsSize;
    placement?: Placement;
    iconOnly?: boolean;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
    onInteractionChange?: (state: State) => void;
  };

  export type Props = WithInteractiveValues<BaseProps> & {
    asChild?: boolean;
    focusableWhenDisabled?: boolean;
  };

  const opaqueFills = {
    solid: cn(
      'bg-(--control-fill) text-(--control-on-fill)',
      'data-hovered:bg-[color-mix(in_oklab,var(--control-fill)_90%,var(--ids-color-surface))]',
      'data-active:bg-[color-mix(in_oklab,var(--control-fill)_80%,var(--ids-color-surface))]',
    ),
    soft: cn(
      'bg-[color-mix(in_oklab,var(--control-fill)_12%,var(--ids-color-surface))] text-(--control-accent)',
      'data-hovered:bg-[color-mix(in_oklab,var(--control-fill)_18%,var(--ids-color-surface))]',
      'data-active:bg-[color-mix(in_oklab,var(--control-fill)_24%,var(--ids-color-surface))]',
    ),
    outline: cn(
      'bg-(--ids-color-surface) text-(--control-quiet) inset-ring-1 inset-ring-(--ids-color-border)',
      'data-hovered:bg-(--ids-color-muted) data-active:bg-(--ids-color-muted)',
    ),
  } satisfies Record<Variant, string>;

  export const Style = tv({
    base: [
      controlSurface.base,
      'fixed z-40 max-w-[calc(100vw-3rem)] shadow-lg data-hovered:shadow-xl print:hidden',
      'transition-[color,background-color,box-shadow,scale] motion-safe:data-active:scale-95',
    ],
    variants: {
      variant: opaqueFills,
      colorScheme: controlSurface.colorScheme,
      size: {
        standard: ['text-button-standard', "[&_svg:not([class*='size-'])]:size-6"],
        tiny: ['text-button-tiny', "[&_svg:not([class*='size-'])]:size-5"],
      } satisfies Record<IdsSize, string[]>,
      iconOnly: {
        true: 'aspect-square rounded-full p-0',
        false: 'rounded-standard',
      },
      placement: {
        'top-left': [
          'top-[calc(1.5rem+env(safe-area-inset-top))]',
          'ltr:left-[calc(1.5rem+env(safe-area-inset-left))] rtl:right-[calc(1.5rem+env(safe-area-inset-right))]',
        ],
        'top-right': [
          'top-[calc(1.5rem+env(safe-area-inset-top))]',
          'ltr:right-[calc(1.5rem+env(safe-area-inset-right))] rtl:left-[calc(1.5rem+env(safe-area-inset-left))]',
        ],
        'bottom-left': [
          'bottom-[calc(1.5rem+env(safe-area-inset-bottom))]',
          'ltr:left-[calc(1.5rem+env(safe-area-inset-left))] rtl:right-[calc(1.5rem+env(safe-area-inset-right))]',
        ],
        'bottom-right': [
          'bottom-[calc(1.5rem+env(safe-area-inset-bottom))]',
          'ltr:right-[calc(1.5rem+env(safe-area-inset-right))] rtl:left-[calc(1.5rem+env(safe-area-inset-left))]',
        ],
      } satisfies Record<Placement, string[]>,
    },
    compoundVariants: [
      { size: 'standard', iconOnly: true, class: 'size-14' },
      { size: 'tiny', iconOnly: true, class: 'size-11' },
      {
        size: 'standard',
        iconOnly: false,
        class: [
          'h-14 gap-2 px-5',
          'has-[>:is(svg,[aria-hidden=true],[role=status]):first-child]:ps-4',
          'has-[>:is(svg,[aria-hidden=true],[role=status]):last-child]:pe-4',
        ],
      },
      {
        size: 'tiny',
        iconOnly: false,
        class: [
          'h-11 gap-1.5 px-4',
          'has-[>:is(svg,[aria-hidden=true],[role=status]):first-child]:ps-3',
          'has-[>:is(svg,[aria-hidden=true],[role=status]):last-child]:pe-3',
        ],
      },
    ],
    defaultVariants: {
      variant: 'solid',
      colorScheme: 'primary',
      size: 'standard',
      iconOnly: false,
      placement: 'bottom-right',
    },
  });
}
