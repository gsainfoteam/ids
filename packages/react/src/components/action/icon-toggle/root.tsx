'use client';

import { iconToggleStyle } from './style';
import { useInternalIconLabel } from '../../../internal/lib/icon-label';
import { invariant } from '../../../utils';
import { useInternalGroupContext } from '../../utility/group';
import { useInternalToggle } from '../toggle/hooks/use-toggle';

import type { IconToggle } from '.';

export function IconToggleRoot(props: IconToggle.Props) {
  const layout = useInternalGroupContext();
  const {
    props: { icon, variant: ownVariant, colorScheme, size, className, style, ...rest },
    toggleProps,
    element,
    content,
    render,
  } = useInternalToggle(props, 'IconToggle');

  invariant(
    props.asChild || content == null,
    'IconToggle: pass the icon through the `icon` prop, not as children.',
  );
  invariant(icon != null || props.asChild, 'IconToggle: the `icon` prop is required.');

  const glyph = icon ?? content;
  const label = useInternalIconLabel('IconToggle', glyph, rest, element?.props as object | undefined);
  const variant = ownVariant ?? layout?.variant ?? 'outline';
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
