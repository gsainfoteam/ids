import { use, type ComponentProps } from 'react';

import { CheckIcon } from '@heroicons/react/16/solid';

import { ItemContext, useChip } from './context';
import { invariant, mergeProps, part } from '../../../utils';

export type ChipItemIndicatorProps = ComponentProps<'span'> & { asChild?: boolean };

export function ChipItemIndicator({
  asChild,
  children,
  className,
  ...props
}: ChipItemIndicatorProps) {
  const c = useChip('ItemIndicator');
  const item = use(ItemContext);
  invariant(item, '`<ChipField.ItemIndicator>` must be used inside `<ChipField.Item>`.');
  if (!item.selected) return null;

  return part(
    'span',
    asChild,
    children ?? <CheckIcon />,
    mergeProps(props, {
      'aria-hidden': true,
      'data-chip-field-item-indicator': '',
      className: c.styles.indicator({ className }),
    }),
  );
}

ChipItemIndicator.displayName = 'ChipField.ItemIndicator';
