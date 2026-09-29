import { type ChangeEvent, type ComponentProps, type KeyboardEvent } from 'react';

import { useSelectContext } from './context';
import { FieldPopupSearch, type FieldPopupSearchProps } from '../../../internal/field-popup/search';
import { messages } from '../../../internal/messages';
import { mergeProps } from '../../../utils';

export type SelectSearchFieldProps = Omit<ComponentProps<'input'>, 'size' | 'color'> & {
  asChild?: boolean;
};

export function SelectSearchField({ placeholder, ...props }: SelectSearchFieldProps) {
  const c = useSelectContext('Select.SearchField');
  const { state: s, ids } = c.select;

  const own = mergeProps(props as Record<string, unknown>, {
    'aria-label': props['aria-label'] ?? messages.select.search,
    'data-select-search': '',
    value: s.query,
    placeholder: placeholder ?? messages.select.searchPlaceholder,
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
