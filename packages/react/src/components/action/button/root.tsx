'use client';

import { buttonStyle } from './style';
import { useButton } from './use-button';
import { useGroupContext } from '../../utility/group';

import type { Button } from '.';

export function ButtonRoot(props: Button.Props) {
  const group = useGroupContext();
  const {
    props: { variant: ownVariant, colorScheme, size, className, style, ...rest },
    render,
  } = useButton(props, 'Button', { warnWithoutText: true });
  const variant = ownVariant ?? group?.variant ?? 'solid';
  const resolvedSize = size ?? group?.size ?? 'standard';

  return render({
    ...rest,
    className: buttonStyle({ variant, colorScheme, size: resolvedSize, className }),
    style,
    'data-variant': variant,
    'data-size': resolvedSize,
  });
}
