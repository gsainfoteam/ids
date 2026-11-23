'use client';

import { useInternalTranslate } from '../../../../internal/translate';
import { mergeProps, part } from '../../../../utils';
import { useInternalSelectContext } from '../context';

import type { BoxProps } from '../lib/box-props';

export type SelectEmptyProps = BoxProps;

export function SelectEmpty({ asChild, children, className, ...props }: SelectEmptyProps) {
  const t = useInternalTranslate();

  const c = useInternalSelectContext('Select.Empty');
  const none = c.select.state.visible.length === 0;

  return part(
    'div',
    asChild,
    none ? (children ?? t('select.empty')) : null,
    mergeProps(props, {
      role: 'status',
      'data-select-empty': '',
      'data-empty': none ? '' : undefined,
      className: c.styles.empty({ className }),
    }),
  );
}

SelectEmpty.displayName = 'Select.Empty';
