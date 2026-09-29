import { cloneElement, isValidElement } from 'react';

import { useChip } from './context';
import { ChipCreate } from './create';
import { ChipEmpty } from './empty';
import { isType } from './is-type';
import { ChipLimit } from './limit';
import { FieldPopupSearch } from '../../../internal/field-popup/search';
import { messages } from '../../../internal/messages';
import { flattenFragments, mergeProps, part } from '../../../utils';
import { ScrollArea } from '../../layout/scroll-area';
import { slotChildren } from '../select/select-options';

import type { BoxProps } from './box-props';

export type ChipContentProps = BoxProps;

function DrawerSearch() {
  const c = useChip('Content');
  const { drawerInputRef } = c;
  const { state: s, ids, handlers } = c.field;

  return (
    <FieldPopupSearch
      ref={drawerInputRef}
      aria-label={messages.chipField.search}
      data-chip-field-search=""
      value={s.query}
      placeholder={c.inputDefaults.placeholder}
      onChange={handlers.onInputChange}
      onPaste={handlers.onPaste}
      onCompositionStart={handlers.onCompositionStart}
      onCompositionEnd={handlers.onCompositionEnd}
      onKeyDown={(event) => handlers.onInputKeyDown(event, 'drawer')}
      controls={ids.listbox}
      activeDescendant={s.activeCandidate !== undefined ? ids.option(s.activeCandidate) : undefined}
    />
  );
}

export function ChipContent({ asChild, children, className, ...props }: ChipContentProps) {
  const c = useChip('Content');

  const nodes = flattenFragments(slotChildren(children, asChild));
  const empties = nodes.filter(isType(ChipEmpty));
  const limits = nodes.filter(isType(ChipLimit));
  const items = nodes.filter((node) => !empties.includes(node) && !limits.includes(node));
  const list = (
    <>
      {items}
      {!items.some(isType(ChipCreate)) && <ChipCreate />}
    </>
  );

  return (
    <>
      {c.drawer && <DrawerSearch />}
      {limits.length ? limits : <ChipLimit />}
      <ScrollArea className={c.styles.listArea()}>
        <ScrollArea.Viewport asChild>
          {part(
            'div',
            asChild,
            asChild && isValidElement(children) ? cloneElement(children, {}, list) : list,
            mergeProps(props, {
              ...c.listLabel,
              id: c.field.ids.listbox,
              role: 'listbox',
              'aria-multiselectable': true,
              className: c.styles.listbox({ className }),
            }),
          )}
        </ScrollArea.Viewport>
      </ScrollArea>
      {empties.length ? empties : <ChipEmpty />}
    </>
  );
}

ChipContent.displayName = 'ChipField.Content';
