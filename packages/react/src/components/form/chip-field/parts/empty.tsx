'use client';

import { useInternalTranslate } from '../../../../internal/translate';
import { mergeProps, part } from '../../../../utils';
import { useInternalChip } from '../context';

import type { BoxProps } from '../lib/box-props';

export type ChipEmptyProps = BoxProps;

export function ChipEmpty({ asChild, children, className, ...props }: ChipEmptyProps) {
  const t = useInternalTranslate();

  const c = useInternalChip('Empty');
  const none = c.field.state.visible.length === 0 && !c.field.state.canCreate;

  return part(
    'div',
    asChild,
    none ? (children ?? t('chipField.empty')) : null,
    mergeProps(props, {
      role: 'status',
      'data-chip-field-empty': '',
      'data-empty': none ? '' : undefined,
      className: c.styles.empty({ className }),
    }),
  );
}

ChipEmpty.displayName = 'ChipField.Empty';
