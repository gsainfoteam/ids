'use client';

import { cloneElement, isValidElement, type KeyboardEvent } from 'react';

import { useSelectContext } from './context';
import { SelectEmpty } from './empty';
import { isType } from './is-type';
import { SelectSearchField } from './search-field';
import { slotChildren } from './select-options';
import { flattenFragments, mergeProps, part } from '../../../utils';
import { ScrollArea } from '../../layout/scroll-area';

import type { BoxProps } from './box-props';

export type SelectContentProps = BoxProps;

export function SelectContent({ asChild, children, className, ...props }: SelectContentProps) {
  const c = useSelectContext('Select.Content');
  const { state: s, ids } = c.select;

  const nodes = flattenFragments(slotChildren(children, asChild));
  const search = nodes.filter(isType(SelectSearchField));
  const empty = nodes.filter(isType(SelectEmpty));
  const items = nodes.filter((node) => !search.includes(node) && !empty.includes(node));
  const owner = s.focusOwner === 'list';

  return (
    <>
      {search}
      <ScrollArea fade="y" className={c.styles.listArea()}>
        <ScrollArea.Viewport asChild>
          {part(
            'div',
            asChild,
            asChild && isValidElement(children) ? cloneElement(children, {}, items) : items,
            mergeProps(props, {
              ...c.listLabel,
              id: ids.listbox,
              role: 'listbox',
              'aria-multiselectable': c.state.multiple || undefined,
              'aria-activedescendant':
                owner && s.activeValue !== undefined ? ids.option(s.activeValue) : undefined,
              tabIndex: owner ? 0 : undefined,
              'data-popup-autofocus': owner ? '' : undefined,
              onKeyDown: owner
                ? (event: KeyboardEvent<HTMLElement>) => c.select.onKeyDown(event, 'list')
                : undefined,
              className: c.styles.listbox({ className }),
            }),
          )}
        </ScrollArea.Viewport>
      </ScrollArea>
      {empty.length ? empty : <SelectEmpty />}
    </>
  );
}

SelectContent.displayName = 'Select.Content';
