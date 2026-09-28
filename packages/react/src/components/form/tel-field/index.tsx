import {
  cloneElement,
  createContext,
  Fragment,
  isValidElement,
  use,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { callingCodeOf, countryOptions, type CountryCode, type TelFieldFormat } from './phone';
import { useTelField, type TelFieldInputProps } from './use-tel-field';
import { type FieldSurfaceVariant } from '../../../internal/field-surface';
import { messages } from '../../../internal/messages';
import {
  Adornments,
  TextControlClear,
  TextControlContext,
  countOf,
  splitAroundInput,
  stateAttributes,
  textControlStyle,
  type TextControlClearProps,
  type TextControlState,
} from '../../../internal/text-control';
import { cn, invariant, tv } from '../../../utils';
import { useFieldSize } from '../field/context';
import { Select } from '../select';

import type { IdsSize } from '../../../tokens/types';

export type { CountryCode, TelFieldFormat } from './phone';
export type { TelFieldInputProps } from './use-tel-field';
export type TelFieldVariant = FieldSurfaceVariant;
export type TelFieldState = TextControlState;

type StateValue<T> = T | ((state: TelFieldState) => T);

type TelFieldContextValue = {
  field: ReturnType<typeof useTelField>;
  state: TelFieldState;
  locale: string;
  styles: ReturnType<typeof TelField.Style>;
};

const TelFieldContext = createContext<TelFieldContextValue | null>(null);

function useTelContext(part: string) {
  const context = use(TelFieldContext);
  invariant(context != null, `\`<TelField.${part}>\` must be used inside \`<TelField>\`.`);
  return context;
}

function resolve<T>(value: StateValue<T>, state: TelFieldState): T {
  return typeof value === 'function' ? (value as (state: TelFieldState) => T)(state) : value;
}

export function TelField({
  value,
  defaultValue = '',
  onValueChange,
  defaultCountry = 'KR',
  format = 'auto',
  locale = 'ko-KR',
  variant = 'outline',
  size,
  invalid,
  disabled,
  className,
  style,
  children,
  ...rootProps
}: TelField.Props) {
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const { items, leading, input, trailing } = splitAroundInput<TelField.InputProps>(
    children,
    TelField.Input,
    () => <TelField.Input key="tel-field-input" />,
    'TelField',
  );
  const selects = countOf(items, TelField.CountrySelect);
  invariant(selects <= 1, '`<TelField>` accepts at most one `<TelField.CountrySelect />`.');

  const field = useTelField({
    rootProps,
    input: input.props,
    value,
    defaultValue,
    onValueChange,
    defaultCountry,
    format,
    separateCountry: selects > 0,
    disabled,
    invalid,
    clearable: countOf(items, TelField.Clear) > 0,
  });
  const state: TelFieldState = { size: resolvedSize, variant, ...field.state };
  const styles = TelField.Style({ variant, size: resolvedSize });
  const own = [TelField.CountrySelect, TelField.Clear];

  return (
    <TelFieldContext value={{ field, state, locale, styles }}>
      <TextControlContext
        value={{ state, inputId: field.inputProps.id, clear: field.clear, styles }}
      >
        <div
          data-tel-field=""
          {...stateAttributes(state)}
          {...field.rootProps}
          className={styles.root({ className: resolve(className, state) })}
          style={resolve(style, state)}
        >
          <Adornments items={leading} own={own} marker="tel-field" className={styles.adornment()} />
          {input}
          <Adornments
            items={trailing}
            own={own}
            marker="tel-field"
            className={styles.adornment()}
          />
        </div>
        {field.hiddenInputName && (
          <input
            type="hidden"
            name={field.hiddenInputName}
            form={field.form}
            value={field.value}
            disabled={state.disabled}
          />
        )}
      </TextControlContext>
    </TelFieldContext>
  );
}

export namespace TelField {
  export type Props = TelFieldInputProps & {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    defaultCountry?: CountryCode;
    format?: TelFieldFormat;
    locale?: string;
    variant?: TelFieldVariant;
    size?: IdsSize;
    invalid?: boolean;
    disabled?: boolean;
    children?: ReactNode;
    className?: StateValue<string | undefined>;
    style?: StateValue<CSSProperties | undefined>;
  };
  export type State = TelFieldState;
  export type Variant = TelFieldVariant;
  export type Format = TelFieldFormat;
  export type InputProps = TelFieldInputProps & {
    asChild?: boolean;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
  };
  export type CountrySelectProps = Omit<ComponentProps<'button'>, 'children'> & {
    asChild?: boolean;
    children?: ReactNode;
    searchPlaceholder?: string;
  };
  export type ClearProps = TextControlClearProps;

  export function Input({ asChild, children, className, style }: InputProps) {
    const { field, styles } = useTelContext('Input');
    const { inputProps } = field;
    const finalProps = {
      ...inputProps,
      className: styles.input({ className: cn(inputProps.className, className) }),
      style: inputProps.style || style ? { ...inputProps.style, ...style } : undefined,
    };
    if (asChild === true) {
      invariant(
        isValidElement(children) &&
          children.type !== Fragment &&
          (typeof children.type !== 'string' || children.type === 'input'),
        '`<TelField.Input asChild>` requires one input, or a component forwarding input props and ref.',
      );
      return cloneElement(children, finalProps);
    }
    invariant(
      children == null,
      '`<TelField.Input>` takes no children; set `value`/`defaultValue` on `<TelField>`.',
    );
    return <input {...finalProps} />;
  }

  export function CountrySelect({
    asChild,
    children,
    className,
    searchPlaceholder,
    'aria-label': ariaLabel,
    ...props
  }: CountrySelectProps) {
    const { field, state, locale, styles } = useTelContext('CountrySelect');
    return (
      <Select
        value={field.country}
        onValueChange={(next) => {
          if (typeof next === 'string') field.changeCountry(next as CountryCode);
        }}
        aria-label={ariaLabel ?? messages.telField.country}
        disabled={state.disabled}
        readOnly={state.readOnly}
        size={state.size}
        variant="ghost"
        className={styles.country({ className })}
      >
        <Select.Trigger {...props} asChild={asChild} className={styles.countryTrigger()}>
          {asChild ? (
            children
          ) : (
            <>
              <Select.Value className={styles.countryValue()}>
                {field.country} +{callingCodeOf(field.country)}
              </Select.Value>
              <Select.Icon />
            </>
          )}
        </Select.Trigger>
        <Select.Content>
          <Select.SearchField placeholder={searchPlaceholder ?? messages.telField.countrySearch} />
          {countryOptions(locale).map((option) => (
            <Select.Item
              key={option.code}
              value={option.code}
              searchValue={`${option.name} ${option.code} +${option.callingCode}`}
            >
              <span className={styles.countryName()}>{option.name}</span>
              <span className={styles.countryCode()}>+{option.callingCode}</span>
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    );
  }

  export const Clear = TextControlClear;

  export const Style = tv({
    extend: textControlStyle,
    slots: {
      country: [
        'w-auto shrink-0 rounded-standard text-(--ids-color-on-surface)',
        'hover:bg-(--ids-color-muted) ring-0! inset-ring-transparent!',
      ],
      countryTrigger: 'gap-1',
      countryValue: 'tabular-nums',
      countryName: 'min-w-0 flex-1 truncate',
      countryCode: 'shrink-0 text-(--ids-color-on-muted) tabular-nums',
    },
    variants: {
      size: {
        standard: {
          country: 'h-7 first:-ms-2 last:-me-2',
          countryTrigger: 'px-2',
        },
        tiny: {
          country: 'h-6 first:-ms-1.5 last:-me-1.5',
          countryTrigger: 'px-1.5',
        },
      } satisfies Record<IdsSize, object>,
    },
  });
}

export type TelFieldProps = TelField.Props;
