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
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { isNotNil } from 'es-toolkit';
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  isSupportedCountry,
  parseIncompletePhoneNumber,
  type CountryCode,
} from 'libphonenumber-js/min';

import { fieldSurface, type FieldSurfaceVariant } from '../../../internal/field-surface';
import { flattenFragments, invariant, mergeProps, mergeRefs, tv } from '../../../utils';
import { useFieldSize } from '../field/context';
import { Select } from '../select';

import type { IdsSize } from '../../../tokens/types';

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
  variant?: FieldSurfaceVariant;
  size?: IdsSize;
  invalid?: boolean;
};
type NativeProps = Omit<ComponentProps<'input'>, 'type' | 'size' | 'value' | 'defaultValue'>;
type TelFieldContextValue = {
  size: IdsSize;
  country: CountryCode;
  changeCountry: (country: CountryCode) => void;
  disabled?: boolean;
  readOnly?: boolean;
  invalid: ComponentProps<'input'>['aria-invalid'];
  id: string;
  display: string;
  rootProps: NativeProps;
  nodeRef: RefObject<HTMLInputElement | null>;
  handleInput: (node: HTMLInputElement) => void;
  startComposition: (node: HTMLInputElement) => void;
  endComposition: () => void;
};
const Context = createContext<TelFieldContextValue | null>(null);

function TelInput({ asChild, children, ref, ...rest }: TelField.InputProps) {
  const field = useContext(Context);
  invariant(field != null, '`<TelField.Input>` must be used inside `<TelField>`.');

  let child: ReactElement<ComponentProps<'input'>> | undefined;
  if (asChild === true) {
    invariant(
      isValidElement(children) &&
        children.type !== Fragment &&
        (typeof children.type !== 'string' || children.type === 'input'),
      '`<TelField.Input asChild>` requires one input, or a component forwarding input props and ref.',
    );
    child = children as ReactElement<ComponentProps<'input'>>;
  } else {
    invariant(
      children == null,
      '`<TelField.Input>` takes no children; set `value`/`defaultValue` on `<TelField>`.',
    );
  }

  // Values: Input over root over the asChild child. Handlers compose so Field and
  // react-hook-form wiring on the root still runs when the Input sets its own.
  const native: NativeProps = mergeProps(mergeProps({ ...child?.props }, field.rootProps), rest);
  const { input } = TelField.Style({ size: field.size });

  // The formatter owns value, type and the change pipeline, so these are applied last and
  // wrap the user handlers instead of being overridable by them.
  const actual: ComponentProps<'input'> = {
    ...native,
    'data-tel-field-input': '',
    'data-field-input': '',
    id: native.id ?? field.id,
    type: 'tel',
    name: undefined,
    value: field.display,
    defaultValue: undefined,
    disabled: field.disabled,
    readOnly: field.readOnly,
    autoComplete: native.autoComplete ?? 'tel',
    inputMode: native.inputMode ?? 'tel',
    'aria-invalid': field.invalid,
    className: input({ className: native.className }),
    ref: (node: HTMLInputElement | null) => {
      invariant(
        !node || node.tagName === 'INPUT',
        '`<TelField.Input>` must forward its ref to an input.',
      );
      return mergeRefs(field.nodeRef, native.ref, ref)(node);
    },
    onChange: (e) => {
      native.onChange?.(e);
      if (!e.defaultPrevented) field.handleInput(e.currentTarget);
    },
    onCompositionStart: (e) => {
      field.startComposition(e.currentTarget);
      native.onCompositionStart?.(e);
    },
    onCompositionEnd: (e) => {
      field.endComposition();
      native.onCompositionEnd?.(e);
      if (!e.defaultPrevented) field.handleInput(e.currentTarget);
    },
  } as ComponentProps<'input'>;

  // cloneElement forwards a callback ref; ref values are read in effects/handlers only.
  // eslint-disable-next-line react-hooks/refs
  return child ? cloneElement(child, actual) : <input {...actual} />;
}

function TelCountrySelect({ asChild, children, ...props }: TelField.CountrySelectProps) {
  const c = useContext(Context);
  invariant(c, '`<TelField.CountrySelect>` must be used inside `<TelField>`.');
  const { country, countryLabel, countryIcon } = TelField.Style({ size: c.size });
  return (
    <Select
      value={c.country}
      onChange={(next) => {
        if (next) c.changeCountry(next as CountryCode);
      }}
      aria-label="국가 코드"
      disabled={c.disabled}
      readOnly={c.readOnly}
      size={c.size}
      variant="ghost"
      className={country()}
    >
      <Select.Trigger {...props} asChild={asChild}>
        {asChild ? (
          children
        ) : (
          <span className={countryLabel()}>
            {c.country} +{getCountryCallingCode(c.country)}{' '}
            <ChevronDownIcon aria-hidden="true" className={countryIcon()} />
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

function splitByInput(children: ReactNode) {
  const items = flattenFragments(children);
  const indexesOf = (type: unknown) =>
    items
      .map((child, index) => (isValidElement(child) && child.type === type ? index : null))
      .filter(isNotNil);
  const inputIndexes = indexesOf(TelField.Input);

  invariant(inputIndexes.length <= 1, '`<TelField>` accepts at most one `<TelField.Input />`.');
  invariant(
    indexesOf(TelField.CountrySelect).length <= 1,
    '`<TelField>` accepts at most one `<TelField.CountrySelect />`.',
  );

  const hasCountrySelect = indexesOf(TelField.CountrySelect).length > 0;
  const inputIndex = inputIndexes[0];
  if (inputIndex == null) {
    return {
      leading: items,
      input: <TelField.Input key="tel-field-input" />,
      trailing: [] as ReactNode[],
      hasCountrySelect,
    };
  }

  return {
    leading: items.slice(0, inputIndex),
    input: items[inputIndex] as ReactElement<TelField.InputProps>,
    trailing: items.slice(inputIndex + 1),
    hasCountrySelect,
  };
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
  ...rootProps
}: TelFieldProps) {
  invariant(
    isSupportedCountry(defaultCountry),
    '`<TelField>` `defaultCountry` must be a supported ISO alpha-2 code.',
  );
  const [country, setCountry] = useState(defaultCountry);
  const [stored, setStored] = useState(defaultValue);
  const current = value === undefined ? stored : value;
  const [draft, setDraft] = useState<{ model: string; display: string } | null>(null);
  const composing = useRef(false);
  const [composition, setComposition] = useState<string | null>(null);
  const { leading, input, trailing, hasCountrySelect } = splitByInput(children);

  // The sentinel's own props win over the container's, so derive container state from
  // the merged result, not from the container props alone.
  const { asChild, children: inputChild } = input.props;
  const childProps =
    asChild === true && isValidElement<ComponentProps<'input'>>(inputChild) ? inputChild.props : {};
  const merged: NativeProps = { ...childProps, ...rootProps };
  for (const [key, next] of Object.entries(input.props)) {
    if (next !== undefined) (merged as Record<string, unknown>)[key] = next;
  }
  const locked = !!merged.disabled || !!merged.readOnly;
  const ariaInvalid = merged['aria-invalid'] ?? invalid;

  const nodeRef = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);
  const uid = useId();
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const styles = TelField.Style({ variant, size: resolvedSize, disabled: !!merged.disabled });
  const formatted = formatPhone(current, country, format, hasCountrySelect);
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
  }, [value, defaultValue, defaultCountry, merged.form]);
  const accept = (node: HTMLInputElement) => {
    let raw = node.value;
    let position = node.selectionStart ?? raw.length;
    // Deleting a formatting separator must also remove a digit rather than reinserting it forever.
    if (
      (format !== 'none' || hasCountrySelect) &&
      raw.length < display.length &&
      parseIncompletePhoneNumber(raw) === parseIncompletePhoneNumber(display) &&
      position > 0
    ) {
      raw = raw.slice(0, position - 1) + raw.slice(position);
      position--;
    }
    const significant = parseIncompletePhoneNumber(raw.slice(0, position)).length;
    const next = formatPhone(raw, country, format, hasCountrySelect);
    if (format === 'none' && !hasCountrySelect) caret.current = position;
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
  const changeCountry = (next: CountryCode) => {
    if (locked) return;
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
  const adornments = (items: ReactNode[]) =>
    items.map((item, index) =>
      // CountrySelect is TelField's own part with its own trigger styling; the adornment
      // wrapper's button reset would flatten it, so it renders bare.
      isValidElement(item) && item.type === TelField.CountrySelect ? (
        item
      ) : (
        <span
          key={(isValidElement(item) && item.key) || index}
          data-tel-field-adornment=""
          className={styles.adornment()}
        >
          {item}
        </span>
      ),
    );

  return (
    <Context.Provider
      value={{
        size: resolvedSize,
        country,
        changeCountry,
        disabled: merged.disabled,
        readOnly: merged.readOnly,
        invalid: ariaInvalid,
        id: `ids-tel-${uid}`,
        display,
        rootProps,
        nodeRef,
        handleInput: (node) => {
          if (locked) return;
          if (composing.current) {
            setComposition(node.value);
            return;
          }
          accept(node);
        },
        startComposition: (node) => {
          composing.current = true;
          setComposition(node.value);
        },
        endComposition: () => {
          composing.current = false;
          setComposition(null);
        },
      }}
    >
      <div
        data-tel-field=""
        data-size={resolvedSize}
        data-invalid={
          ariaInvalid != null && ariaInvalid !== false && ariaInvalid !== 'false' ? '' : undefined
        }
        className={styles.root({ className })}
        style={style}
      >
        {adornments(leading)}
        {input}
        {adornments(trailing)}
      </div>
      {merged.name && (
        <input
          type="hidden"
          name={merged.name}
          form={merged.form}
          value={formatted.model}
          disabled={merged.disabled}
        />
      )}
    </Context.Provider>
  );
}

export namespace TelField {
  export type Props = TelFieldProps;
  export type InputProps = NativeProps & { asChild?: boolean; children?: ReactNode };
  export type CountrySelectProps = ComponentProps<'button'> & { asChild?: boolean };
  export const Input = TelInput;
  export const CountrySelect = TelCountrySelect;
  export const Style = tv({
    slots: {
      root: ['flex w-full min-w-0 touch-manipulation items-center text-start', fieldSurface.base],
      input: [
        'h-full w-full min-w-0 flex-1 bg-transparent outline-none',
        'text-inherit placeholder:text-(--ids-color-on-muted)',
        'selection:bg-(--ids-color-primary)/30 selection:text-(--ids-color-on-surface)',
        'disabled:cursor-not-allowed',
      ],
      adornment: [
        'inline-flex shrink-0 items-center empty:hidden',
        'not-has-[button]:text-(--ids-color-on-muted)',
        'not-has-[button]:[&_svg]:shrink-0 not-has-[button]:[&_svg]:text-current',
        '[&_button]:size-auto [&_button]:h-auto [&_button]:min-h-0 [&_button]:w-auto [&_button]:min-w-0',
        '[&_button]:p-0',
      ],
      country: 'w-auto shrink-0 px-1',
      countryLabel: 'inline-flex items-center gap-1',
      countryIcon: 'shrink-0',
    },
    variants: {
      variant: {
        outline: { root: fieldSurface.variant.outline },
        soft: { root: fieldSurface.variant.soft },
        ghost: { root: fieldSurface.variant.ghost },
      } satisfies Record<NonNullable<TelFieldProps['variant']>, object>,
      size: {
        standard: {
          root: fieldSurface.size.standard,
          adornment: [
            'gap-1',
            'not-has-[button]:text-body-b3-regular not-has-[button]:[&_svg]:size-(--ids-size-icon-standard)',
          ],
          countryIcon: 'size-(--ids-size-icon-standard)',
        },
        tiny: {
          root: fieldSurface.size.tiny,
          adornment: [
            'gap-0.5',
            'not-has-[button]:text-caption-c1-regular not-has-[button]:[&_svg]:size-(--ids-size-icon-tiny)',
          ],
          countryIcon: 'size-(--ids-size-icon-tiny)',
        },
      } satisfies Record<IdsSize, object>,
      disabled: {
        true: { root: 'cursor-not-allowed opacity-50' },
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'standard',
    },
  });
}
