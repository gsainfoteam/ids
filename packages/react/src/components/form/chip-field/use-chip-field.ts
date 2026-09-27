import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react';

import {
  findOption,
  hasSeparator,
  resolveTokens,
  sameText,
  splitTokens,
  validationError,
  type ChipValidateResult,
} from './chip-values';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { useFormReset } from '../../../hooks/use-form-reset';
import { revealPopupOption } from '../../../internal/field-popup';
import { messages } from '../../../internal/messages';
import { matchesQuery, type SelectOption } from '../select/select-options';

// The create row takes part in keyboard navigation like an option, under a value no option can
// have: option values are strings.
export const CREATE = null;
type Candidate = string | typeof CREATE;

export type UseChipFieldOptions = {
  value: string[] | undefined;
  defaultValue: string[] | undefined;
  onValueChange?: (value: string[]) => void;
  open: boolean | undefined;
  defaultOpen: boolean | undefined;
  onOpenChange?: (open: boolean) => void;
  options: SelectOption[];
  creatable: boolean;
  onCreate?: (value: string) => void;
  validate?: (value: string) => ChipValidateResult;
  maxCount: number | undefined;
  disabled: boolean;
  readOnly: boolean;
  drawer: boolean;
};

const PAGE_SIZE = 10;

const isRtl = (node: Element | null) =>
  !!node && node.ownerDocument.defaultView?.getComputedStyle(node).direction === 'rtl';

export function useChipField({
  value,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen,
  onOpenChange,
  options,
  creatable,
  onCreate,
  validate,
  maxCount,
  disabled,
  readOnly,
  drawer,
}: UseChipFieldOptions) {
  const [selected, setValue] = useControllableState<string[]>({
    value,
    defaultValue: defaultValue ?? [],
    onValueChange,
  });
  const blocked = disabled || readOnly;
  const [openState, setOpenState] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen ?? false,
    onValueChange: onOpenChange,
  });
  const open = openState && !blocked;
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState<Candidate>();
  // The highlight belongs to one opening; the next one starts from the top of the list.
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) setHighlighted(undefined);
  }
  const composing = useRef(false);

  const full = maxCount !== undefined && selected.length >= maxCount;
  const trimmed = query.trim();
  const visible = trimmed ? options.filter((option) => matchesQuery(option, trimmed)) : options;
  const selectable = (option: SelectOption) =>
    !option.disabled && (!full || selected.includes(option.value));
  const enabled = visible.filter(selectable);
  const exists = !!findOption(options, trimmed) || selected.some((item) => sameText(item, trimmed));
  const canCreate = creatable && !!trimmed && !full && !exists;
  const createError = canCreate
    ? validationError(validate?.(trimmed), messages.chipField.invalid)
    : null;
  const createRow: Candidate[] = canCreate && !createError ? [CREATE] : [];
  const candidates: Candidate[] = [...enabled.map((option) => option.value), ...createRow];
  // Typing an option's full label lands on it rather than on the first partial match.
  const exact = trimmed
    ? enabled.find((option) => sameText(option.label, trimmed) || sameText(option.value, trimmed))
    : undefined;
  const active: Candidate | undefined =
    highlighted !== undefined && candidates.includes(highlighted)
      ? highlighted
      : (exact?.value ?? candidates[0]);
  const activeCandidate: Candidate | undefined = open ? active : undefined;

  const baseId = `ids-chip-${useId()}`;
  const listboxId = `${baseId}-listbox`;
  const optionId = (candidate: Candidate) =>
    candidate === CREATE ? `${baseId}-create` : `${baseId}-option-${encodeURIComponent(candidate)}`;

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const drawerInputRef = useRef<HTMLInputElement>(null);
  const pendingFocus = useRef<number | 'input' | null>(null);
  const revealed = useRef(false);

  const queryInput = () => (drawer && open ? drawerInputRef.current : inputRef.current);
  const focusInput = (caret?: 'start' | 'end') => {
    const input = inputRef.current;
    if (!input) return;
    input.focus({ preventScroll: true });
    if (caret) {
      const at = caret === 'start' ? 0 : input.value.length;
      input.setSelectionRange(at, at);
    }
  };
  const removeButtons = () =>
    Array.from(
      rootRef.current?.querySelectorAll<HTMLButtonElement>('[data-chip-field-remove]') ?? [],
    );

  const setOpen = (next: boolean) => {
    if (next && blocked) return;
    setOpenState(next);
  };
  const close = (restoreFocus: boolean) => {
    setOpenState(false);
    if (restoreFocus) focusInput();
  };

  const toggle = (item: string) => {
    const option = options.find((candidate) => candidate.value === item);
    if (blocked || !option || option.disabled) return;
    if (selected.includes(item)) setValue(selected.filter((current) => current !== item));
    else if (!full) setValue([...selected, item]);
    setQuery('');
    setHighlighted(item);
  };

  const create = () => {
    if (blocked || !canCreate || createError) return;
    onCreate?.(trimmed);
    setValue([...selected, trimmed]);
    setQuery('');
    setHighlighted(undefined);
  };

  const choose = (candidate: Candidate | undefined) => {
    if (candidate === CREATE) create();
    else if (candidate !== undefined) toggle(candidate);
  };

  // A comma or Enter on a closed list commits what was typed: the option it names, or a new
  // value. It never removes a chip the way choosing a selected option does.
  const commitQuery = () => {
    const { add, created, rest } = resolveTokens({
      tokens: [trimmed],
      options,
      selected,
      creatable,
      validate,
      room: maxCount === undefined ? Infinity : maxCount - selected.length,
    });
    if (!add.length || rest.length) return false;
    created.forEach((item) => onCreate?.(item));
    setValue([...selected, ...add]);
    setQuery('');
    return true;
  };

  const remove = (item: string, focusAfter: number | 'input') => {
    const option = options.find((candidate) => candidate.value === item);
    if (blocked || option?.disabled) return;
    setValue(selected.filter((current) => current !== item));
    pendingFocus.current = focusAfter;
  };

  const move = (step: number) => {
    if (!candidates.length) return;
    const index = active === undefined ? -1 : candidates.indexOf(active);
    const next = Math.min(Math.max(index + step, 0), candidates.length - 1);
    setHighlighted(candidates[next]);
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (blocked) return;
    setQuery(event.currentTarget.value);
    setHighlighted(undefined);
    setOpen(true);
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData('text');
    if (blocked || !hasSeparator(text)) return;
    event.preventDefault();
    const input = event.currentTarget;
    const before = input.value.slice(0, input.selectionStart ?? input.value.length);
    const after = input.value.slice(input.selectionEnd ?? input.value.length);
    const { add, created, rest } = resolveTokens({
      tokens: splitTokens(before + text + after),
      options,
      selected,
      creatable,
      validate,
      room: maxCount === undefined ? Infinity : maxCount - selected.length,
    });
    created.forEach((item) => onCreate?.(item));
    if (add.length) setValue([...selected, ...add]);
    // What could not become a chip stays in the field to be fixed.
    setQuery(rest.join(', '));
    setHighlighted(undefined);
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>, source: 'field' | 'drawer') => {
    // keyCode 229 is a key the IME is still composing, which Safari reports without isComposing.
    if (event.defaultPrevented || composing.current) return;
    if (event.nativeEvent.isComposing || event.keyCode === 229 || blocked) return;
    const input = event.currentTarget;
    const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
    const back = isRtl(rootRef.current) ? 'ArrowRight' : 'ArrowLeft';
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        if (!open) setOpen(true);
        else move(event.key === 'ArrowDown' ? 1 : -1);
        return;
      case 'PageDown':
      case 'PageUp':
        if (!open) return;
        event.preventDefault();
        move(event.key === 'PageDown' ? PAGE_SIZE : -PAGE_SIZE);
        return;
      case 'Enter':
        if (open && active !== undefined) {
          event.preventDefault();
          choose(active);
        } else if (trimmed) {
          event.preventDefault();
          if (!commitQuery()) setOpen(true);
        }
        return;
      case ',':
        // A separator with nothing before it would only leave a stray comma in the query.
        if (!trimmed || commitQuery()) event.preventDefault();
        return;
      case ' ':
        if (!query && !open) {
          event.preventDefault();
          setOpen(true);
        }
        return;
      case 'Escape':
        if (open) {
          event.preventDefault();
          close(source === 'drawer');
        } else if (query) {
          event.preventDefault();
          setQuery('');
        }
        return;
      case 'Tab':
        if (open && !drawer) close(false);
        return;
      case 'Backspace':
        if (!query && atStart && selected.length) {
          const last = removeButtons().at(-1);
          const item = last?.dataset.chipFieldRemove;
          if (item === undefined) return;
          event.preventDefault();
          remove(item, 'input');
        }
        return;
      case back:
        if (source === 'field' && atStart && !event.shiftKey) {
          const last = removeButtons().at(-1);
          if (!last) return;
          event.preventDefault();
          close(false);
          last.focus();
        }
        return;
    }
  };

  // A focused chip is its remove button. Arrows walk the chips and step back into the input;
  // Backspace and Delete remove the chip and keep focus on a neighbour, like text.
  const onChipKeyDown = (event: KeyboardEvent<HTMLButtonElement>, item: string) => {
    const buttons = removeButtons();
    const index = buttons.indexOf(event.currentTarget);
    const rtl = isRtl(rootRef.current);
    const backKey = rtl ? 'ArrowRight' : 'ArrowLeft';
    const forwardKey = rtl ? 'ArrowLeft' : 'ArrowRight';
    const printable = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
    switch (event.key) {
      case backKey:
        event.preventDefault();
        buttons[Math.max(index - 1, 0)]?.focus();
        return;
      case forwardKey:
        event.preventDefault();
        if (index + 1 < buttons.length) buttons[index + 1].focus();
        else focusInput('start');
        return;
      case 'Home':
        event.preventDefault();
        buttons[0]?.focus();
        return;
      case 'End':
      case 'Escape':
        event.preventDefault();
        focusInput('end');
        return;
      case 'Backspace':
        event.preventDefault();
        remove(item, index > 0 ? index - 1 : buttons.length > 1 ? 0 : 'input');
        return;
      case 'Delete':
        event.preventDefault();
        remove(item, index < buttons.length - 1 ? index : 'input');
        return;
    }
    // Typing on a chip goes to the input; moving focus before the key's default action lets the
    // browser insert the character there.
    if (printable) focusInput('end');
  };

  const onChipClick = (item: string, button: HTMLButtonElement) => {
    const buttons = removeButtons();
    const index = buttons.indexOf(button);
    remove(item, index >= 0 && index < buttons.length - 1 ? index : 'input');
  };

  useLayoutEffect(() => {
    const target = pendingFocus.current;
    if (target === null) return;
    pendingFocus.current = null;
    const buttons = removeButtons();
    if (target === 'input' || !buttons.length) focusInput('end');
    else buttons[Math.min(target, buttons.length - 1)].focus({ preventScroll: true });
  });

  useLayoutEffect(() => {
    if (!open) {
      revealed.current = false;
      return;
    }
    if (activeCandidate === undefined) return;
    revealPopupOption(inputRef.current?.ownerDocument.getElementById(optionId(activeCandidate)), {
      center: !revealed.current,
    });
    revealed.current = true;
    // optionId is derived from baseId, which never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeCandidate]);

  useFormReset(inputRef, () => {
    setValue(defaultValue ?? []);
    setQuery('');
    setOpenState(false);
  });

  return {
    state: {
      selected,
      open,
      query,
      visible,
      activeCandidate,
      canCreate,
      createError,
      full,
      blocked,
      trimmed,
    },
    ids: { listbox: listboxId, option: optionId },
    rootRef,
    inputRef,
    drawerInputRef,
    actions: {
      toggle,
      create,
      close,
      setOpen,
      highlight: setHighlighted,
      focusQuery: () => queryInput()?.focus({ preventScroll: true }),
    },
    handlers: {
      onInputChange,
      onPaste,
      onInputKeyDown,
      onChipKeyDown,
      onChipClick,
      onCompositionStart: () => {
        composing.current = true;
      },
      onCompositionEnd: () => {
        composing.current = false;
      },
    },
  };
}
