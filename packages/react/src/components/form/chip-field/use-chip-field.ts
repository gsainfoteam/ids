'use client';

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react';

import { clamp } from 'es-toolkit';

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
import { isComposingKey, keyHandler, withModifiers } from '../../../internal/keys';
import { useTranslate } from '../../../internal/translate';
import { matchesQuery, type SelectOption } from '../select/select-options';

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
  const t = useTranslate();

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
    ? validationError(validate?.(trimmed), t('chipField.invalid'))
    : null;
  const createRow: Candidate[] = canCreate && !createError ? [CREATE] : [];
  const candidates: Candidate[] = [...enabled.map((option) => option.value), ...createRow];
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
  const sendTypingToInput = () => focusInput('end');
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

  const addQueryAsChip = () => {
    const { add, created, leftToFix } = resolveTokens({
      tokens: [trimmed],
      options,
      selected,
      creatable,
      validate,
      room: maxCount === undefined ? Infinity : maxCount - selected.length,
    });
    if (!add.length || leftToFix.length) return false;
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
    const next = clamp(index + step, 0, candidates.length - 1);
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
    const { add, created, leftToFix } = resolveTokens({
      tokens: splitTokens(before + text + after),
      options,
      selected,
      creatable,
      validate,
      room: maxCount === undefined ? Infinity : maxCount - selected.length,
    });
    created.forEach((item) => onCreate?.(item));
    if (add.length) setValue([...selected, ...add]);
    setQuery(leftToFix.join(', '));
    setHighlighted(undefined);
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>, source: 'field' | 'drawer') => {
    if (composing.current || blocked) return;

    const input = event.currentTarget;
    const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
    const dir = isRtl(rootRef.current) ? 'rtl' : 'ltr';

    const commaTyped = event.key === ',';
    if (commaTyped && !event.defaultPrevented && !isComposingKey(event.nativeEvent)) {
      if (!trimmed || addQueryAsChip()) event.preventDefault();
      return;
    }

    keyHandler(
      {
        ...withModifiers({
          ArrowDown: () => {
            if (!open) setOpen(true);
            else move(1);
          },
          ArrowUp: () => {
            if (!open) setOpen(true);
            else move(-1);
          },
          PageDown: () => {
            if (!open) return false;
            move(PAGE_SIZE);
          },
          PageUp: () => {
            if (!open) return false;
            move(-PAGE_SIZE);
          },
          Enter: () => {
            if (open && active !== undefined) choose(active);
            else if (!trimmed) return false;
            else if (!addQueryAsChip()) setOpen(true);
          },
          Space: () => {
            if (query || open) return false;
            setOpen(true);
          },
          Escape: () => {
            if (open) close(source === 'drawer');
            else if (query) setQuery('');
            else return false;
          },
          Tab: () => {
            if (open && !drawer) close(false);
            return false;
          },
          Backspace: () => {
            if (query || !atStart || !selected.length) return false;
            const item = removeButtons().at(-1)?.dataset.chipFieldRemove;
            if (item === undefined) return false;
            remove(item, 'input');
          },
        }),
        ...withModifiers(
          {
            ArrowLeft: () => {
              const last = removeButtons().at(-1);
              if (source !== 'field' || !atStart || !last) return false;
              close(false);
              last.focus();
            },
          },
          ['Control', 'Alt', 'Meta'],
        ),
      },
      { dir },
    )(event);
  };

  const onChipKeyDown = (event: KeyboardEvent<HTMLButtonElement>, item: string) => {
    const buttons = removeButtons();
    const index = buttons.indexOf(event.currentTarget);
    const dir = isRtl(rootRef.current) ? 'rtl' : 'ltr';

    const handled = keyHandler(
      withModifiers({
        ArrowLeft: () => {
          buttons[Math.max(index - 1, 0)]?.focus();
        },
        ArrowRight: () => {
          if (index + 1 < buttons.length) buttons[index + 1].focus();
          else focusInput('start');
        },
        Home: () => {
          buttons[0]?.focus();
        },
        End: () => {
          focusInput('end');
        },
        Escape: () => {
          focusInput('end');
        },
        Backspace: () => {
          remove(item, index > 0 ? index - 1 : buttons.length > 1 ? 0 : 'input');
        },
        Delete: () => {
          remove(item, index < buttons.length - 1 ? index : 'input');
        },
      }),
      { dir },
    )(event);

    const printable = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
    if (!handled && printable) sendTypingToInput();
  };

  const onChipRemove = (item: string) => {
    const buttons = removeButtons();
    const index = buttons.findIndex((button) => button.dataset.chipFieldRemove === item);
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

  const activeOptionId = activeCandidate === undefined ? undefined : optionId(activeCandidate);
  useLayoutEffect(() => {
    if (!open) {
      revealed.current = false;
      return;
    }
    if (activeOptionId === undefined) return;
    revealPopupOption(inputRef.current?.ownerDocument.getElementById(activeOptionId), {
      center: !revealed.current,
    });
    revealed.current = true;
  }, [open, activeOptionId]);

  useFormReset(inputRef, () => {
    setValue(defaultValue ?? [], { silent: true });
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
      onChipRemove,
      onCompositionStart: () => {
        composing.current = true;
      },
      onCompositionEnd: () => {
        composing.current = false;
      },
    },
  };
}
