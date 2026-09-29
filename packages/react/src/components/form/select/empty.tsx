'use client';

import { useSelectContext } from './context';
import { messages } from '../../../internal/messages';
import { mergeProps, part } from '../../../utils';

import type { BoxProps } from './box-props';

export type SelectEmptyProps = BoxProps;

export function SelectEmpty({ asChild, children, className, ...props }: SelectEmptyProps) {
  const c = useSelectContext('Select.Empty');
  const none = c.select.state.visible.length === 0;

  return part(
    'div',
    asChild,
    none ? (children ?? messages.select.empty) : null,
    mergeProps(props, {
      role: 'status',
      'data-select-empty': '',
      'data-empty': none ? '' : undefined,
      className: c.styles.empty({ className }),
    }),
  );
}

SelectEmpty.displayName = 'Select.Empty';
