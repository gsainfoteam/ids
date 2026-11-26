'use client';

import { use } from 'react';

import { invariant, mergeProps, part } from '../../../../utils';
import { GroupContext, useInternalSelectContext } from '../context';

import type { BoxProps } from '../lib/box-props';

export type SelectGroupLabelProps = BoxProps;

export function SelectGroupLabel({
  asChild,
  children,
  className,
  ...props
}: SelectGroupLabelProps) {
  const c = useInternalSelectContext('Select.GroupLabel');
  const group = use(GroupContext);
  invariant(group, 'Select.GroupLabel must be rendered inside Select.Group.');

  return part(
    'div',
    asChild,
    children,
    mergeProps(props, {
      id: group.labelId,
      'data-select-group-label': '',
      className: c.styles.groupLabel({ className }),
    }),
  );
}

SelectGroupLabel.displayName = 'Select.GroupLabel';
