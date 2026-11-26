'use client';

import { useId } from 'react';

import { SelectContent } from './content';
import { GroupContext, useInternalSelectContext } from '../context';
import { SelectGroupLabel } from './group-label';
import { SelectItem } from './item';
import { flattenFragments, mergeProps, part } from '../../../../utils';
import { isType } from '../lib/is-type';
import { collectOptions, slotChildren } from '../lib/select-options';

import type { BoxProps } from '../lib/box-props';

export type SelectGroupProps = BoxProps;

export function SelectGroup({ asChild, children, className, ...props }: SelectGroupProps) {
  const c = useInternalSelectContext('Select.Group');
  const labelId = useId();

  const inner = slotChildren(children, asChild);
  const labelled = flattenFragments(inner).some(isType(SelectGroupLabel));
  const visible = new Set(c.select.state.visible.map((option) => option.value));
  if (!collectOptions(inner, OPTION_KINDS).some((option) => visible.has(option.value))) return null;

  return (
    <GroupContext value={{ labelId }}>
      {part(
        'div',
        asChild,
        children,
        mergeProps(props, {
          role: 'group',
          'aria-labelledby': props['aria-labelledby'] ?? (labelled ? labelId : undefined),
          className: c.styles.group({ className }),
        }),
      )}
    </GroupContext>
  );
}

SelectGroup.displayName = 'Select.Group';

export const OPTION_KINDS = { item: SelectItem, group: SelectGroup, content: SelectContent };
