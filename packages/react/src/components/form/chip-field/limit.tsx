'use client';

import { useChip } from './context';
import { messages } from '../../../internal/messages';
import { mergeProps, part } from '../../../utils';

import type { BoxProps } from './box-props';

export type ChipLimitProps = BoxProps;

export function ChipLimit({ asChild, children, className, ...props }: ChipLimitProps) {
  const c = useChip('Limit');
  const full = c.field.state.full && c.maxCount !== undefined;

  return part(
    'div',
    asChild,
    full ? (children ?? messages.chipField.limit(c.maxCount ?? 0)) : null,
    mergeProps(props, {
      role: 'status',
      'data-chip-field-limit': '',
      'data-full': full ? '' : undefined,
      className: c.styles.limit({ className }),
    }),
  );
}

ChipLimit.displayName = 'ChipField.Limit';
