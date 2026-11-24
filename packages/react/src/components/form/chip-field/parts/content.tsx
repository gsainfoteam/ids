'use client';

import { cloneElement, isValidElement } from 'react';

import { useInternalChip } from '../context';
import { ChipCreate } from './create';
import { ChipEmpty } from './empty';
import { ChipLimit } from './limit';
import { type PopupPresentation } from '../../../../internal/field-popup';
import { FieldPopupSearch } from '../../../../internal/field-popup/parts/search';
import { useInternalTranslate } from '../../../../internal/translate';
import { flattenFragments, mergeProps, part } from '../../../../utils';
import { ScrollArea } from '../../../layout/scroll-area';
import { slotChildren } from '../../select/lib/select-options';
import { isType } from '../lib/is-type';

import type { BoxProps } from '../lib/box-props';

export type ChipContentProps = BoxProps & { mobileVariant?: PopupPresentation };

function DrawerSearch() {
  const t = useInternalTranslate();

  const c = useInternalChip('Content');
  const { drawerInputRef } = c;
  const { state: s, ids, handlers } = c.field;

  return (
    <FieldPopupSearch
      ref={drawerInputRef}
      aria-label={t('common.search')}
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

export function ChipContent({
  asChild,
  children,
  className,
  mobileVariant: _readByTheRoot,
  ...props
}: ChipContentProps) {
  const c = useInternalChip('Content');

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
      {limits}
      <ScrollArea fade="y" className={c.styles.listArea()}>
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
      {empties}
    </>
  );
}

ChipContent.displayName = 'ChipField.Content';
