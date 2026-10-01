'use client';

import { iconToggleStyle } from './style';
import { useIconLabel } from '../../../internal/icon-label';
import { invariant } from '../../../utils';
import { useGroupContext } from '../../utility/group';
import { useToggle } from '../toggle/use-toggle';

import type { IconToggle } from '.';

export function IconToggleRoot(props: IconToggle.Props) {
  const layout = useGroupContext();
  const {
    props: { icon, variant: ownVariant, colorScheme, size, className, style, ...rest },
    toggleProps,
    element,
    content,
    render,
  } = useToggle(props, 'IconToggle');

  invariant(
    props.asChild || content == null,
    'IconToggle: pass the icon through the `icon` prop, not as children.',
  );
  invariant(icon != null || props.asChild, 'IconToggle: the `icon` prop is required.');

  const glyph = icon ?? content;
  const label = useIconLabel('IconToggle', glyph, rest, element?.props as object | undefined);
  const variant = ownVariant ?? layout?.variant ?? 'ghost';
  const resolvedSize = size ?? layout?.size ?? 'standard';

  return render(
    {
      ...rest,
      'aria-label': label ?? rest['aria-label'],
      ...toggleProps,
      className: iconToggleStyle({ variant, colorScheme, size: resolvedSize, className }),
      style,
      'data-variant': variant,
      'data-size': resolvedSize,
    },
    glyph,
  );
}
