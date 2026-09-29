import { cloneElement, isValidElement, useId, type ReactNode } from 'react';

import { ChipContent } from './content';
import { useChip } from './context';
import { ChipItem } from './item';
import { mergeProps, part } from '../../../utils';
import { collectOptions, slotChildren } from '../select/select-options';

import type { BoxProps } from './box-props';

export type ChipGroupProps = BoxProps & { heading: ReactNode };

export function ChipGroup({ heading, asChild, children, className, ...props }: ChipGroupProps) {
  const c = useChip('Group');
  const headingId = useId();

  const inner = slotChildren(children, asChild);
  const visible = new Set(c.field.state.visible.map((option) => option.value));
  if (!collectOptions(inner, OPTION_KINDS).some((option) => visible.has(option.value))) return null;

  const nodes = (
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
    asChild && isValidElement(children) ? cloneElement(children, {}, nodes) : nodes,
    mergeProps(props, {
      role: 'group',
      'aria-labelledby': headingId,
      className: c.styles.group({ className }),
    }),
  );
}

ChipGroup.displayName = 'ChipField.Group';

export const OPTION_KINDS = { item: ChipItem, group: ChipGroup, content: ChipContent };
