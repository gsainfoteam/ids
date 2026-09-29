'use client';

import { toggleStyle } from './style';
import { useToggle } from './use-toggle';
import { useGroupContext } from '../../utility/group';

import type { Toggle } from '.';

export function ToggleRoot(props: Toggle.Props) {
  const layout = useGroupContext();
  const {
    props: { variant: ownVariant, colorScheme, size, className, style, ...rest },
    toggleProps,
    render,
  } = useToggle(props, 'Toggle');
  const variant = ownVariant ?? layout?.variant ?? 'ghost';
  const resolvedSize = size ?? layout?.size ?? 'standard';

  return render({
    ...rest,
    ...toggleProps,
    className: toggleStyle({ variant, colorScheme, size: resolvedSize, className }),
    style,
    'data-variant': variant,
    'data-size': resolvedSize,
  });
}
