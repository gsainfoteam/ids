'use client';

import { mergeProps, part } from '../../../../utils';
import { useInternalChip } from '../context';

import type { BoxProps } from '../lib/box-props';

export type ChipEmptyProps = BoxProps;

export function ChipEmpty({ asChild, children, className, ...props }: ChipEmptyProps) {
  const c = useInternalChip('Empty');
  const none = c.field.state.visible.length === 0 && !c.field.state.canCreate;

  return part(
    'div',
    asChild,
    none ? children : null,
    mergeProps(props, {
      role: 'status',
      'data-chip-field-empty': '',
      'data-empty': none ? '' : undefined,
      className: c.styles.empty({ className }),
    }),
  );
}

ChipEmpty.displayName = 'ChipField.Empty';
