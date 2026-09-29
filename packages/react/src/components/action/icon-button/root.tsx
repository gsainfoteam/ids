'use client';

import { iconButtonStyle } from './style';
import { useIconLabel } from '../../../internal/icon-label';
import { invariant } from '../../../utils';
import { useGroupContext } from '../../utility/group';
import { useButton } from '../button/use-button';

import type { IconButton } from '.';

export function IconButtonRoot(props: IconButton.Props) {
  const group = useGroupContext();
  const {
    props: { icon, variant: ownVariant, colorScheme, size, className, style, ...rest },
    element,
    content,
    render,
  } = useButton(props, 'IconButton');

  invariant(
    props.asChild || content == null,
    'IconButton: pass the icon through the `icon` prop, not as children.',
  );
  invariant(icon != null || props.asChild, 'IconButton: the `icon` prop is required.');

  const glyph = icon ?? content;
  const label = useIconLabel('IconButton', glyph, rest, element?.props as object | undefined);
  const variant = ownVariant ?? group?.variant ?? 'ghost';
  const resolvedSize = size ?? group?.size ?? 'standard';

  return render(
    {
      ...rest,
      'aria-label': label ?? rest['aria-label'],
      className: iconButtonStyle({ variant, colorScheme, size: resolvedSize, className }),
      style,
      'data-variant': variant,
      'data-size': resolvedSize,
    },
    glyph,
  );
}
