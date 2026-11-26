'use client';

import { cloneElement, isValidElement, useId } from 'react';

import { ChipContent } from './content';
import { GroupLabelContext, useInternalChip } from '../context';
import { ChipGroupLabel } from './group-label';
import { ChipItem } from './item';
import { containsElementOfType, mergeProps, part } from '../../../../utils';
import { collectOptions, slotChildren } from '../../select/lib/select-options';

import type { BoxProps } from '../lib/box-props';

export type ChipGroupProps = BoxProps;

const GROUP_LABEL = new Set<unknown>([ChipGroupLabel]);

export function ChipGroup({ asChild, children, className, ...props }: ChipGroupProps) {
  const c = useInternalChip('Group');
  const labelId = useId();

  const inner = slotChildren(children, asChild);
  const visible = new Set(c.field.state.visible.map((option) => option.value));
  if (!collectOptions(inner, OPTION_KINDS).some((option) => visible.has(option.value))) return null;

  return (
    <GroupLabelContext value={labelId}>
      {part(
        'div',
        asChild,
        asChild && isValidElement(children) ? cloneElement(children, {}, inner) : inner,
        mergeProps(props, {
          role: 'group',
          'aria-labelledby': containsElementOfType(inner, GROUP_LABEL) ? labelId : undefined,
          className: c.styles.group({ className }),
        }),
      )}
    </GroupLabelContext>
  );
}

ChipGroup.displayName = 'ChipField.Group';

export const OPTION_KINDS = { item: ChipItem, group: ChipGroup, content: ChipContent };
