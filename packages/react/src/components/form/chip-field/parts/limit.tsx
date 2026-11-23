'use client';

import { useInternalTranslate } from '../../../../internal/translate';
import { mergeProps, part } from '../../../../utils';
import { useInternalChip } from '../context';

import type { BoxProps } from '../lib/box-props';

export type ChipLimitProps = BoxProps;

export function ChipLimit({ asChild, children, className, ...props }: ChipLimitProps) {
  const t = useInternalTranslate();

  const c = useInternalChip('Limit');
  const full = c.field.state.full && c.maxCount !== undefined;

  return part(
    'div',
    asChild,
    full ? (children ?? t('chipField.limit', { count: c.maxCount ?? 0 })) : null,
    mergeProps(props, {
      role: 'status',
      'data-chip-field-limit': '',
      'data-full': full ? '' : undefined,
      className: c.styles.limit({ className }),
    }),
  );
}

ChipLimit.displayName = 'ChipField.Limit';
