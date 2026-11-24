'use client';

import { cloneElement, isValidElement, useId, type ReactNode } from 'react';

import { SelectContent } from './content';
import { useInternalSelectContext } from '../context';
import { SelectItem } from './item';
import { mergeProps, part } from '../../../../utils';
import { collectOptions, slotChildren } from '../lib/select-options';

import type { BoxProps } from '../lib/box-props';

export type SelectGroupProps = BoxProps & { heading: ReactNode };

export function SelectGroup({ heading, asChild, children, className, ...props }: SelectGroupProps) {
  const c = useInternalSelectContext('Select.Group');
  const headingId = useId();

  const inner = slotChildren(children, asChild);
  const visible = new Set(c.select.state.visible.map((option) => option.value));
  if (!collectOptions(inner, OPTION_KINDS).some((option) => visible.has(option.value))) return null;

  const content = (
    <>
      <div id={headingId} className={c.styles.groupHeading()}>
        {heading}
      </div>
      {inner}
    </>
  );

  return part(
    'div',
    asChild,
    asChild && isValidElement(children) ? cloneElement(children, {}, content) : content,
    mergeProps(props, {
      role: 'group',
      'aria-labelledby': headingId,
      className: c.styles.group({ className }),
    }),
  );
}

SelectGroup.displayName = 'Select.Group';

export const OPTION_KINDS = { item: SelectItem, group: SelectGroup, content: SelectContent };
