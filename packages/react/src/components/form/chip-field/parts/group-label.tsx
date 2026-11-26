'use client';

import { use } from 'react';

import { invariant, mergeProps, part } from '../../../../utils';
import { GroupLabelContext, useInternalChip } from '../context';

import type { BoxProps } from '../lib/box-props';

export type ChipGroupLabelProps = BoxProps;

export function ChipGroupLabel({ asChild, children, className, ...props }: ChipGroupLabelProps) {
  const c = useInternalChip('GroupLabel');
  const labelId = use(GroupLabelContext);
  invariant(labelId, '`<ChipField.GroupLabel>` must be used inside `<ChipField.Group>`.');

  return part(
    'div',
    asChild,
    children,
    mergeProps(props, { id: labelId, className: c.styles.groupLabel({ className }) }),
  );
}

ChipGroupLabel.displayName = 'ChipField.GroupLabel';
