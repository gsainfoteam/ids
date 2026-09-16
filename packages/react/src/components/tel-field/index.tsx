import {
  Fragment,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  isSupportedCountry,
  parseIncompletePhoneNumber,
  type CountryCode,
} from 'libphonenumber-js/min';

import { invariant, mergeProps, mergeRefs } from '../../utils';
import { useFieldSize } from '../field/context';
import { fieldTriggerStyle, flattenParts } from '../field-popup';
import { Select } from '../select';

import type { IdsSize } from '../../tokens/types';

export type TelFieldFormat = 'auto' | 'none' | 'international';
export type TelFieldProps = Omit<
  ComponentProps<'input'>,
  'type' | 'size' | 'color' | 'value' | 'defaultValue' | 'onChange'
> & {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  defaultCountry?: CountryCode;
  format?: TelFieldFormat;
  variant?: 'outline' | 'filled' | 'unstyled';
  size?: IdsSize;
  invalid?: boolean;
};
type CountryContext = {
  country: CountryCode;
  change: (country: CountryCode) => void;
  disabled?: boolean;
  readOnly?: boolean;
  size: IdsSize;
};
const Context = createContext<CountryContext | null>(null);
function TelInput(_props: TelField.InputProps): ReactNode {
  invariant(false, 'TelField.Input must be a direct child or in a Fragment.');
}
function TelCountrySelect({ asChild, children, ...props }: TelField.CountrySelectProps) {
  const c = useContext(Context);
  invariant(c, 'TelField.CountrySelect must be inside TelField.');
  return (
    <Select
      value={c.country}
      onChange={(next) => {
        if (next) c.change(next as CountryCode);
      }}
      aria-label="국가 코드"
      disabled={c.disabled}
      readOnly={c.readOnly}
      size={c.size}
      variant="unstyled"
      className="w-auto shrink-0 px-1"
    >
      <Select.Trigger {...props} asChild={asChild}>
        {asChild ? (
          children
        ) : (
          <span className="inline-flex items-center gap-1">
            {c.country} +{getCountryCallingCode(c.country)}{' '}
            <ChevronDownIcon aria-hidden="true" className="size-4 shrink-0" />
          </span>
        )}
      </Select.Trigger>
      <Select.Content>
        <Select.SearchField placeholder="국가 또는 코드 검색" />
        {getCountries().map((country) => (
          <Select.Item
            key={country}
            value={country}
            searchValue={`${country} +${getCountryCallingCode(country)}`}
          >
            {country} +{getCountryCallingCode(country)}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
}
function formatPhone(
  raw: string,
  country: CountryCode,
  format: TelFieldFormat,
  countrySelect: boolean,
) {
  if (format === 'none' && !countrySelect) return { model: raw, display: raw };
  const clean = parseIncompletePhoneNumber(raw.normalize('NFKC'));
  const formatter = new AsYouType(country);
  const formatted = formatter.input(clean);
  const international = format === 'international' || countrySelect;
  const model = international
    ? clean.startsWith('+')
      ? clean
      : (formatter.getNumberValue() ?? clean)
    : formatted;
  const display =
    countrySelect && clean.startsWith('+')
      ? (formatter.getNumber()?.formatNational() ?? formatter.getNumber()?.nationalNumber ?? '')
      : formatted;
  return { model, display };
}
export function TelField({
  value,
  defaultValue = '',
  onChange,
  defaultCountry = 'KR',
  format = 'auto',
  variant = 'outline',
  size,
  invalid,
  children,
  className,
  style,
  ...root
}: TelFieldProps) {
  invariant(
    isSupportedCountry(defaultCountry),
    'TelField: defaultCountry must be a supported ISO alpha-2 code.',
  );
  const [country, setCountry] = useState(defaultCountry);
  const [stored, setStored] = useState(defaultValue);
  const current = value === undefined ? stored : value;
  const [draft, setDraft] = useState<{ model: string; display: string } | null>(null);
  const composing = useRef(false);
  const [composition, setComposition] = useState<string | null>(null);
  const parts = flattenParts(children);
  const inputs = parts.filter((p) => isValidElement(p) && p.type === TelInput);
  const countries = parts.filter((p) => isValidElement(p) && p.type === TelCountrySelect);
  invariant(
    inputs.length <= 1 && (parts.length === 0 || inputs.length === 1),
    'TelField: children require exactly one Input.',
  );
  invariant(countries.length <= 1, 'TelField: only one CountrySelect is allowed.');
  const sentinel = inputs[0];
  const {
    asChild,
    children: inputChild,
    ...inputProps
  } = isValidElement<TelField.InputProps>(sentinel) ? sentinel.props : {};
  const child =
    asChild && isValidElement<ComponentProps<'input'>>(inputChild) ? inputChild : undefined;
  invariant(
    !asChild ||
      (!!child &&
        child.type !== Fragment &&
        (typeof child.type !== 'string' || child.type === 'input')),
    'TelField.Input asChild must render an input.',
  );
  const native = mergeProps(mergeProps({ ...child?.props }, inputProps), root);
  const nodeRef = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);
  const uid = useId();
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const formatted = formatPhone(current, country, format, countries.length > 0);
  const display = composition ?? (draft?.model === current ? draft.display : formatted.display);
  const emit = (next: { model: string; display: string }) => {
    setDraft(next);
    if (value === undefined) setStored(next.model);
    if (next.model !== current) onChange?.(next.model);
  };
  useLayoutEffect(() => {
    const node = nodeRef.current;
    if (node && caret.current !== null) {
      node.setSelectionRange(caret.current, caret.current);
      caret.current = null;
    }
  }, [display]);
  useLayoutEffect(() => {
    const form = nodeRef.current?.form;
    if (!form) return;
    let alive = true;
    const reset = (e: Event) =>
      queueMicrotask(() => {
        if (alive && !e.defaultPrevented) {
          if (value === undefined) setStored(defaultValue);
          setCountry(defaultCountry);
          setDraft(null);
          setComposition(null);
          composing.current = false;
        }
      });
    form.addEventListener('reset', reset);
    return () => {
      alive = false;
      form.removeEventListener('reset', reset);
    };
  }, [value, defaultValue, defaultCountry, native.form]);
  const accept = (node: HTMLInputElement) => {
    let raw = node.value;
    let position = node.selectionStart ?? raw.length;
    // Deleting a formatting separator must also remove a digit rather than reinserting it forever.
    if (
      (format !== 'none' || countries.length > 0) &&
      raw.length < display.length &&
      parseIncompletePhoneNumber(raw) === parseIncompletePhoneNumber(display) &&
      position > 0
    ) {
      raw = raw.slice(0, position - 1) + raw.slice(position);
      position--;
    }
    const significant = parseIncompletePhoneNumber(raw.slice(0, position)).length;
    const next = formatPhone(raw, country, format, countries.length > 0);
    if (format === 'none' && !countries.length) caret.current = position;
    else {
      let count = 0;
      caret.current = next.display.length;
      for (let i = 0; i < next.display.length; i++) {
        if (/[+\d]/.test(next.display[i])) count++;
        if (count >= significant) {
          caret.current = i + 1;
          break;
        }
      }
    }
    emit(next);
  };
  const actual: ComponentProps<'input'> = {
    ...native,
    id: native.id ?? `ids-tel-${uid}`,
    type: 'tel',
    name: undefined,
    value: display,
    defaultValue: undefined,
    autoComplete: native.autoComplete ?? 'tel',
    inputMode: native.inputMode ?? 'tel',
    'aria-invalid': native['aria-invalid'] ?? invalid,
    className: `h-full w-full min-w-0 flex-1 bg-transparent outline-none ${native.className ?? ''}`,
    ref: (node) => {
      invariant(
        !node || node.tagName === 'INPUT',
        'TelField.Input must forward its ref to an input.',
      );
      nodeRef.current = node;
      const cleanup = mergeRefs(native.ref)(node);
      return () => {
        nodeRef.current = null;
        cleanup?.();
      };
    },
    onChange: (e) => {
      native.onChange?.(e);
      if (e.defaultPrevented || native.disabled || native.readOnly) return;
      if (composing.current) {
        setComposition(e.currentTarget.value);
        return;
      }
      accept(e.currentTarget);
    },
    onCompositionStart: (e) => {
      composing.current = true;
      setComposition(e.currentTarget.value);
      native.onCompositionStart?.(e);
    },
    onCompositionEnd: (e) => {
      composing.current = false;
      setComposition(null);
      native.onCompositionEnd?.(e);
      if (!e.defaultPrevented && !native.disabled && !native.readOnly) accept(e.currentTarget);
    },
  };
  // cloneElement forwards a callback ref; ref values are read in effects/handlers only.
  // eslint-disable-next-line react-hooks/refs
  const input = child ? cloneElement(child, actual) : <input {...actual} />;
  const changeCountry = (next: CountryCode) => {
    if (native.disabled || native.readOnly) return;
    const parser = new AsYouType(country);
    parser.input(current);
    const digits =
      parser.getNumber()?.nationalNumber ??
      parseIncompletePhoneNumber(current).replace(/^\+\d*/, '');
    setCountry(next);
    emit(
      formatPhone(
        digits ? `+${getCountryCallingCode(next)}${digits}` : '',
        next,
        'international',
        true,
      ),
    );
  };
  return (
    <Context.Provider
      value={{
        country,
        change: changeCountry,
        disabled: native.disabled,
        readOnly: native.readOnly,
        size: resolvedSize,
      }}
    >
      <div
        data-tel-field=""
        data-size={resolvedSize}
        aria-invalid={actual['aria-invalid']}
        className={fieldTriggerStyle({
          variant,
          size: resolvedSize,
          className: `has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--ids-color-primary) ${native.disabled ? 'opacity-40' : ''} ${className ?? ''}`,
        })}
        style={style}
      >
        {parts.length
          ? parts.map((p, i) =>
              p === sentinel ? (
                <span key={i} className="h-full min-w-0 flex-1">
                  {input}
                </span>
              ) : (
                p
              ),
            )
          : input}
      </div>
      {native.name && (
        <input
          type="hidden"
          name={native.name}
          form={native.form}
          value={formatted.model}
          disabled={native.disabled}
        />
      )}
    </Context.Provider>
  );
}
export namespace TelField {
  export type Props = TelFieldProps;
  export type InputProps = Omit<
    ComponentProps<'input'>,
    'type' | 'size' | 'value' | 'defaultValue'
  > & { asChild?: boolean };
  export type CountrySelectProps = ComponentProps<'button'> & { asChild?: boolean };
  export const Input = TelInput;
  export const CountrySelect = TelCountrySelect;
  export const Style = fieldTriggerStyle;
}
