'use client';

import { useChip } from './context';
import { messages } from '../../../internal/messages';
import { mergeProps, part } from '../../../utils';

import type { BoxProps } from './box-props';

export type ChipEmptyProps = BoxProps;

export function ChipEmpty({ asChild, children, className, ...props }: ChipEmptyProps) {
  const c = useChip('Empty');
  const none = c.field.state.visible.length === 0 && !c.field.state.canCreate;

  return part(
    'div',
    asChild,
    none ? (children ?? messages.chipField.empty) : null,
    mergeProps(props, {
      role: 'status',
      'data-chip-field-empty': '',
      'data-empty': none ? '' : undefined,
      className: c.styles.empty({ className }),
    }),
  );
}

ChipEmpty.displayName = 'ChipField.Empty';
