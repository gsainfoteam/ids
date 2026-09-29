'use client';

import { floatingButtonStyle } from './style';
import { useFloatingButton } from './use-floating-button';

import type { FloatingButton } from '.';

export function FloatingButtonRoot(props: FloatingButton.Props) {
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
    className: floatingButtonStyle({ variant, colorScheme, size, iconOnly, placement, className }),
    style,
  });
}

export type FloatingButtonProps = FloatingButton.Props;
