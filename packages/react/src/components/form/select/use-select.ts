import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';

import { matchesQuery, orderByOptions, typeaheadIndex, type SelectOption } from './select-options';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { useFormReset } from '../../../hooks/use-form-reset';
import { revealPopupOption } from '../../../internal/field-popup';

export type SelectValue = string | null | string[];

export type SelectFocusOwner = 'trigger' | 'search' | 'list';

export type UseSelectOptions = {
  multiple: boolean;
  value: SelectValue | undefined;
  defaultValue: SelectValue | undefined;
  onValueChange?: (value: SelectValue) => void;
  open: boolean | undefined;
  defaultOpen: boolean | undefined;
  onOpenChange?: (open: boolean) => void;
  options: SelectOption[];
  disabled: boolean;
  readOnly: boolean;
  drawer: boolean;
  searchable: boolean;
};

const PAGE_SIZE = 10;
const TYPEAHEAD_TIMEOUT = 500;
const SAFARI_COMPOSING_KEY_CODE = 229;

export function useSelect({
  multiple,
  value,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen,
  onOpenChange,
  options,
  disabled,
  readOnly,
  drawer,
  searchable,
}: UseSelectOptions) {
  const empty = multiple ? [] : null;
  const [current, setValue] = useControllableState<SelectValue>({
    value,
    defaultValue: defaultValue ?? empty,
    onValueChange,
  });
  const selected = current == null ? [] : Array.isArray(current) ? current : [current];
  const blocked = disabled || readOnly;

  const [openState, setOpenState] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen ?? false,
    onValueChange: onOpenChange,
  });
  const open = openState && !blocked;

  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState<string>();
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) {
      setQuery('');
      setHighlighted(undefined);
    }
  }

  const visible = query ? options.filter((option) => matchesQuery(option, query)) : options;
  const enabled = visible.filter((option) => !option.disabled);
  const fallback =
    (!query && enabled.find((option) => selected.includes(option.value))) || enabled[0];
  const active = enabled.find((option) => option.value === highlighted) ?? fallback;
  const activeValue = open ? active?.value : undefined;

  const baseId = `ids-select-${useId()}`;
  const listboxId = `${baseId}-listbox`;
  const optionId = (optionValue: string) => `${baseId}-option-${encodeURIComponent(optionValue)}`;
  const focusOwner: SelectFocusOwner = searchable ? 'search' : drawer ? 'list' : 'trigger';

  const triggerRef = useRef<HTMLButtonElement>(null);
  const typeahead = useRef({ buffer: '', time: 0 });
  const revealed = useRef(false);

  const close = (restoreFocus: boolean) => {
    setOpenState(false);
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
  };

  const continueTabFromTrigger = () => triggerRef.current?.focus({ preventScroll: true });

  const openAt = (target: 'selected' | 'first' | 'last') => {
    if (blocked) return;
    const all = options.filter((option) => !option.disabled);
    setQuery('');
    setHighlighted(
      target === 'first' ? all[0]?.value : target === 'last' ? all.at(-1)?.value : undefined,
    );
    setOpenState(true);
  };

  const choose = (next: string) => {
    const option = options.find((item) => item.value === next);
    if (blocked || !option || option.disabled) return;
    if (!multiple) {
      setValue(next);
      close(true);
      return;
    }
    setValue(
      orderByOptions(
        selected.includes(next) ? selected.filter((item) => item !== next) : [...selected, next],
        options,
      ),
    );
    setHighlighted(next);
  };

  const clear = () => {
    if (blocked) return;
    setValue(multiple ? [] : null);
    triggerRef.current?.focus({ preventScroll: true });
  };

  const search = (text: string) => {
    setQuery(text);
    setHighlighted(undefined);
  };

  const move = (to: 'next' | 'previous' | 'first' | 'last' | 'pageDown' | 'pageUp') => {
    if (!enabled.length) return;
    const index = active ? enabled.indexOf(active) : -1;
    const last = enabled.length - 1;
    const next = {
      first: 0,
      last,
      next: Math.min(index + 1, last),
      previous: Math.max(index - 1, 0),
      pageDown: Math.min(index + PAGE_SIZE, last),
      pageUp: Math.max(index - PAGE_SIZE, 0),
    }[to];
    setHighlighted(enabled[next].value);
  };

  const typeaheadActive = () =>
    typeahead.current.buffer !== '' && Date.now() - typeahead.current.time <= TYPEAHEAD_TIMEOUT;

  const typeTo = (key: string) => {
    const now = Date.now();
    const buffer = typeaheadActive() ? typeahead.current.buffer + key : key;
    typeahead.current = { buffer, time: now };
    const pool = options.filter((option) => !option.disabled);
    const from = active ? pool.findIndex((option) => option.value === active.value) : -1;
    const index = typeaheadIndex(
      pool.map((option) => option.label),
      buffer,
      from,
    );
    if (index >= 0) setHighlighted(pool[index].value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>, source: SelectFocusOwner) => {
    if (event.defaultPrevented) return;
    if (event.nativeEvent.isComposing || event.keyCode === SAFARI_COMPOSING_KEY_CODE) return;
    if (blocked) return;
    const { key } = event;
    const printable = key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
    const searching = source === 'search';

    if (!open) {
      if (source !== 'trigger') return;
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
        event.preventDefault();
        openAt('selected');
      } else if (key === 'Home' || key === 'End') {
        event.preventDefault();
        openAt(key === 'Home' ? 'first' : 'last');
      } else if (printable) {
        event.preventDefault();
        openAt('selected');
        typeTo(key);
      }
      return;
    }

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!event.altKey) move('next');
        return;
      case 'ArrowUp':
        event.preventDefault();
        if (!event.altKey) move('previous');
        else if (!multiple && active) choose(active.value);
        else close(true);
        return;
      case 'Home':
      case 'End':
        if (searching) return;
        event.preventDefault();
        move(key === 'Home' ? 'first' : 'last');
        return;
      case 'PageDown':
      case 'PageUp':
        event.preventDefault();
        move(key === 'PageDown' ? 'pageDown' : 'pageUp');
        return;
      case 'Enter':
        event.preventDefault();
        if (active) choose(active.value);
        return;
      case 'Escape':
        event.preventDefault();
        close(true);
        return;
      case 'Tab':
        if (drawer) return;
        if (searching) continueTabFromTrigger();
        close(false);
        return;
      case ' ':
        if (searching) return;
        event.preventDefault();
        if (typeaheadActive()) typeTo(' ');
        else if (active) choose(active.value);
        return;
    }
    if (!searching && printable) {
      event.preventDefault();
      typeTo(key);
    }
  };

  useLayoutEffect(() => {
    if (!open) {
      revealed.current = false;
      return;
    }
    if (activeValue === undefined) return;
    const node = triggerRef.current?.ownerDocument.getElementById(optionId(activeValue));
    revealPopupOption(node, { center: !revealed.current });
    revealed.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeValue]);

  useFormReset(triggerRef, () => {
    setValue(defaultValue ?? empty, { silent: true });
    close(false);
  });

  return {
    state: {
      value: current,
      selected,
      open,
      query,
      visible,
      activeValue,
      blocked,
      focusOwner,
    },
    ids: { base: baseId, listbox: listboxId, option: optionId },
    triggerRef,
    actions: {
      choose,
      clear,
      close,
      search,
      highlight: setHighlighted,
      toggle: () => (open ? close(true) : openAt('selected')),
    },
    onKeyDown,
  };
}
