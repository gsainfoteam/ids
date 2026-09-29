import { use, type ComponentProps } from 'react';

import { CheckIcon } from '@heroicons/react/16/solid';

import { ItemContext, useSelectContext } from './context';
import { invariant, mergeProps, part } from '../../../utils';

export type SelectItemIndicatorProps = ComponentProps<'span'> & { asChild?: boolean };

export function SelectItemIndicator({
  asChild,
  children,
  className,
  ...props
}: SelectItemIndicatorProps) {
  const c = useSelectContext('Select.ItemIndicator');
  const item = use(ItemContext);
  invariant(item, 'Select.ItemIndicator must be rendered inside Select.Item.');
  if (!item.selected) return null;

  return part(
    'span',
    asChild,
    children ?? <CheckIcon />,
    mergeProps(props, {
      'aria-hidden': true,
      'data-select-item-indicator': '',
      className: c.styles.indicator({ className }),
    }),
  );
}

SelectItemIndicator.displayName = 'Select.ItemIndicator';
