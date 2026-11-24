'use client';

import { Divider } from '../../../layout/divider';
import { useInternalSelectContext } from '../context';

import type { BoxProps } from '../lib/box-props';

export type SelectSeparatorProps = BoxProps;

export function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  const c = useInternalSelectContext('Select.Separator');
  if (c.select.state.query) return null;

  return (
    <Divider
      {...props}
      aria-hidden
      data-select-separator=""
      className={c.styles.separator({ className })}
    />
  );
}

SelectSeparator.displayName = 'Select.Separator';
