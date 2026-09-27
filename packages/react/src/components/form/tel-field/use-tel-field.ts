import {
  isValidElement,
  use,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type ComponentProps,
  type CompositionEvent,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import { isSupportedCountry } from 'libphonenumber-js/min';

import {
  countryOf,
  digitsOf,
  isCompletePhone,
  normalizePasted,
  presentPhone,
  readPhone,
  toE164,
  withCountry,
  type CountryCode,
  type ReadPhone,
  type TelFieldFormat,
} from './phone';
import { useFormReset } from '../../../hooks/use-form-reset';
import { messages } from '../../../internal/messages';
import {
  isInvalid,
  replaceInput,
  useMergedRef,
  useTextControl,
} from '../../../internal/text-control';
import { invariant, mergeProps } from '../../../utils';
import { FieldNotifyContext } from '../field/context';

export type TelFieldInputProps = Omit<
  ComponentProps<'input'>,
  'type' | 'size' | 'color' | 'children' | 'value' | 'defaultValue' | 'className' | 'style'
>;

export type UseTelFieldOptions = {
  rootProps: TelFieldInputProps;
  input: TelFieldInputProps & { asChild?: boolean; children?: ReactNode };
  value?: string;
  defaultValue: string;
  onValueChange?: (value: string) => void;
  defaultCountry: CountryCode;
  format: TelFieldFormat;
  separateCountry: boolean;
  disabled?: boolean;
  invalid?: boolean;
  clearable: boolean;
};

type Draft = { value: string; text: string };

function assertInput(node: HTMLInputElement) {
  invariant(node.tagName === 'INPUT', '`<TelField.Input>` must forward its ref to an input.');
}

export function useTelField({
  rootProps,
  input: { asChild, children, ...own },
  value,
  defaultValue,
  onValueChange,
  defaultCountry,
  format,
  separateCountry,
  disabled: disabledProp,
  invalid,
  clearable,
}: UseTelFieldOptions) {
  invariant(
    isSupportedCountry(defaultCountry),
    '`<TelField>` `defaultCountry` must be a supported ISO alpha-2 code.',
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const notify = use(FieldNotifyContext);

  // Values: Input over root over the asChild child. Handlers run child, root, Input.
  const childProps =
    asChild && isValidElement<ComponentProps<'input'>>(children) ? children.props : undefined;
  const native: ComponentProps<'input'> = mergeProps(mergeProps({ ...childProps }, rootProps), own);
  const disabled = Boolean(own.disabled ?? disabledProp ?? childProps?.disabled);
  const readOnly = Boolean(native.readOnly);
  const locked = disabled || readOnly;

  const [chosen, setChosen] = useState<CountryCode>(defaultCountry);
  const [stored, setStored] = useState(() => toE164(defaultValue, defaultCountry));
  const controlled = value !== undefined;
  const current = controlled ? toE164(value, chosen) : stored;
  // With a country select, the country follows the number; without one, national digits always
  // mean the default country, and a number from elsewhere reads internationally.
  const country = separateCountry ? countryOf(current, chosen) : chosen;
  // A value given in national form keeps reading that way, even while incomplete.
  const initialDraft = (): Draft | null =>
    defaultValue === '' || defaultValue.startsWith('+')
      ? null
      : readPhone(defaultValue, defaultCountry, format, separateCountry);
  const [draft, setDraft] = useState<Draft | null>(initialDraft);
  const [composition, setComposition] = useState<string | null>(null);
  const composing = useRef(false);
  const caret = useRef<number | null>(null);

  const given =
    controlled && value !== '' && !value.startsWith('+')
      ? readPhone(value, country, format, separateCountry)
      : null;
  const display =
    composition ??
    (draft && draft.value === current
      ? draft.text
      : given && given.value === current
        ? given.text
        : presentPhone(current, country, format, separateCountry));

  const commit = (next: string) => {
    if (!controlled) setStored(next);
    if (next !== current) onValueChange?.(next);
  };

  const emit = (next: ReadPhone) => {
    setDraft({ value: next.value, text: next.text });
    // Typing or pasting "+1 …" beside a country select switches the select to that country.
    if (separateCountry && next.country) setChosen(next.country);
    commit(next.value);
  };

  useLayoutEffect(() => {
    const node = inputRef.current;
    if (node && caret.current !== null) node.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  }, [display]);

  useFormReset(inputRef, () => {
    if (!controlled) setStored(toE164(defaultValue, defaultCountry));
    setChosen(defaultCountry);
    setDraft(initialDraft());
    setComposition(null);
    composing.current = false;
  });

  // An incomplete or impossible number fails native validation the way a malformed email does,
  // so the form refuses it and Field.Error can say why. An empty field is left to `required`.
  const validity = current !== '' && !isCompletePhone(current) ? messages.telField.invalid : '';
  useLayoutEffect(() => {
    inputRef.current?.setCustomValidity(validity);
    notify?.();
  }, [validity, current, notify]);

  const accept = (node: HTMLInputElement, deleting: boolean) => {
    let raw = node.value;
    let position = node.selectionStart ?? raw.length;
    // Deleting a formatting separator must also remove a digit rather than reinserting it forever.
    // Only a deletion counts: a paste of the same digits over a formatted entry is not one.
    if (
      deleting &&
      format !== 'none' &&
      raw.length < display.length &&
      digitsOf(raw) === digitsOf(display) &&
      position > 0
    ) {
      raw = raw.slice(0, position - 1) + raw.slice(position);
      position--;
    }
    const significant = digitsOf(raw.slice(0, position)).length;
    const next = readPhone(raw, country, format, separateCountry);
    if (format === 'none') caret.current = position;
    else {
      // The caret stays after the same number of digits it followed before formatting.
      let count = 0;
      caret.current = next.text.length;
      for (let i = 0; i < next.text.length; i++) {
        if (/[+\d]/.test(next.text[i]!)) count++;
        if (count >= significant) {
          caret.current = i + 1;
          break;
        }
      }
    }
    emit(next);
  };

  const changeCountry = (next: CountryCode) => {
    if (locked) return;
    const moved = withCountry(current, country, next);
    setChosen(next);
    setDraft(null);
    commit(moved);
  };

  const control = useTextControl({ inputRef, disabled, readOnly, clearable });
  const ref = useMergedRef(inputRef, childProps?.ref, rootProps.ref, own.ref, assertInput);
  const ariaInvalid = native['aria-invalid'] ?? invalid;

  const inputProps = {
    ...native,
    id: native.id ?? `ids-tel-${generatedId}`,
    ref,
    type: 'tel',
    // The hidden input carries the name, so the form gets E.164 rather than the text on screen.
    name: undefined,
    value: display,
    defaultValue: undefined,
    autoComplete: native.autoComplete ?? 'tel',
    inputMode: native.inputMode ?? 'tel',
    disabled,
    'aria-invalid': ariaInvalid,
    'data-field-input': '',
    'data-tel-field-input': '',
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      native.onChange?.(event);
      if (event.defaultPrevented || locked) return;
      if (composing.current) {
        setComposition(event.currentTarget.value);
        return;
      }
      const { inputType } = event.nativeEvent as InputEvent;
      accept(event.currentTarget, inputType === undefined || inputType.startsWith('delete'));
    },
    onBlur: (event: FocusEvent<HTMLInputElement>) => {
      // A complete number settles into its canonical grouping once the user leaves the field.
      if (draft && isCompletePhone(draft.value)) setDraft(null);
      native.onBlur?.(event);
    },
    // A whole international number pasted over part of an entry replaces it instead of being
    // spliced into the middle.
    onPaste: (event: ClipboardEvent<HTMLInputElement>) => {
      native.onPaste?.(event);
      if (event.defaultPrevented || locked) return;
      const pasted = normalizePasted(event.clipboardData.getData('text'));
      if (!pasted.startsWith('+') || pasted.length < 8) return;
      event.preventDefault();
      replaceInput(event.currentTarget, pasted);
    },
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      native.onKeyDown?.(event);
      control.onEscape(event);
    },
    onCompositionStart: (event: CompositionEvent<HTMLInputElement>) => {
      composing.current = true;
      setComposition(event.currentTarget.value);
      native.onCompositionStart?.(event);
    },
    onCompositionEnd: (event: CompositionEvent<HTMLInputElement>) => {
      composing.current = false;
      setComposition(null);
      native.onCompositionEnd?.(event);
      if (!event.defaultPrevented && !locked) accept(event.currentTarget, false);
    },
  };

  return {
    inputProps,
    rootProps: control.rootProps,
    clear: control.clear,
    changeCountry,
    country,
    value: current,
    name: native.name,
    form: native.form,
    state: {
      disabled,
      readOnly,
      invalid: isInvalid(ariaInvalid),
      focused: control.focused,
      filled: display !== '',
    },
  };
}
