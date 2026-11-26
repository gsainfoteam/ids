'use client';

import { useRef } from 'react';

import { chipGroupStyle } from './style';
import { mergeRefs } from '../../../utils';
import { Slot } from '../../utility/slot';
import { ChipGroupContext } from '../chip/context';

import type { ChipGroup } from '.';

export function ChipGroupRoot({
  size,
  asChild = false,
  ref,
  className,
  ...props
}: ChipGroup.Props) {
  const root = useRef<HTMLDivElement>(null);
  const Root = asChild ? Slot : 'div';

  return (
    <ChipGroupContext value={{ size, root }}>
      <Root
        {...(asChild ? {} : { role: 'group' })}
        {...props}
        ref={mergeRefs(root, ref)}
        data-chip-group=""
        data-size={size ?? 'standard'}
        className={chipGroupStyle({ size, className })}
      />
    </ChipGroupContext>
  );
}
