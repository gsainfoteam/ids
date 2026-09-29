'use client';

import { useSelectContext } from './context';
import { Divider } from '../../layout/divider';

import type { BoxProps } from './box-props';

export type SelectSeparatorProps = BoxProps;

export function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  const c = useSelectContext('Select.Separator');
  if (c.select.state.query) return null;

  return (
    <Divider
      {...props}
      decorative
      data-select-separator=""
      className={c.styles.separator({ className })}
    />
  );
}

SelectSeparator.displayName = 'Select.Separator';
