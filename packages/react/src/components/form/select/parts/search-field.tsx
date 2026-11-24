'use client';

import { type ChangeEvent, type ComponentProps, type KeyboardEvent } from 'react';

import {
  FieldPopupSearch,
  type FieldPopupSearchProps,
} from '../../../../internal/field-popup/parts/search';
import { useInternalTranslate } from '../../../../internal/translate';
import { mergeProps } from '../../../../utils';
import { useInternalSelectContext } from '../context';

export type SelectSearchFieldProps = Omit<ComponentProps<'input'>, 'size' | 'color'> & {
  asChild?: boolean;
};

export function SelectSearchField({ placeholder, ...props }: SelectSearchFieldProps) {
  const t = useInternalTranslate();

  const c = useInternalSelectContext('Select.SearchField');
  const { state: s, ids } = c.select;

  const own = mergeProps(props as Record<string, unknown>, {
    'aria-label': props['aria-label'] ?? t('common.search'),
    'data-select-search': '',
    value: s.query,
    placeholder,
    onChange: (event: ChangeEvent<HTMLInputElement>) =>
      c.select.actions.search(event.currentTarget.value),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => c.select.onKeyDown(event, 'search'),
  }) as Omit<FieldPopupSearchProps, 'controls' | 'activeDescendant'>;

  return (
    <FieldPopupSearch
      {...own}
      controls={ids.listbox}
      activeDescendant={s.activeValue !== undefined ? ids.option(s.activeValue) : undefined}
    />
  );
}

SelectSearchField.displayName = 'Select.SearchField';
