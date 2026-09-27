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

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/16/solid';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

import {
  useNumberField,
  type NumberFieldFormatOptions,
  type NumberFieldInputProps,
} from './use-number-field';
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
import { cn, invariant, mergeProps, tv } from '../../../utils';
import { IconButton } from '../../action/icon-button';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

export type { NumberFieldFormatOptions, NumberFieldInputProps } from './use-number-field';
export type NumberFieldVariant = FieldSurfaceVariant;
export type NumberFieldState = TextControlState;

type StateValue<T> = T | ((state: NumberFieldState) => T);
type Field = ReturnType<typeof useNumberField>;

type NumberFieldContextValue = {
  field: Field;
  state: NumberFieldState;
  incrementLabel: string;
  decrementLabel: string;
  styles: ReturnType<typeof NumberField.Style>;
};

const NumberFieldContext = createContext<NumberFieldContextValue | null>(null);

function useNumberContext(part: string) {
  const context = use(NumberFieldContext);
  invariant(context != null, `\`<NumberField.${part}>\` must be used inside \`<NumberField>\`.`);
  return context;
}

function resolve<T>(value: StateValue<T>, state: NumberFieldState): T {
  return typeof value === 'function' ? (value as (state: NumberFieldState) => T)(state) : value;
}

type StepButtonProps = Omit<ComponentProps<'button'>, 'children'> & {
  direction: 1 | -1;
  stacked?: boolean;
};

function StepButton({ direction, stacked = false, className, ...props }: StepButtonProps) {
  const { field, state, incrementLabel, decrementLabel, styles } = useNumberContext(
    direction > 0 ? 'Increment' : 'Decrement',
  );
  const blocked =
    state.disabled || state.readOnly || !(direction > 0 ? field.canIncrease : field.canDecrease);
  const icon = stacked ? (
    direction > 0 ? (
      <ChevronUpIcon aria-hidden="true" />
    ) : (
      <ChevronDownIcon aria-hidden="true" />
    )
  ) : direction > 0 ? (
    <PlusIcon aria-hidden="true" />
  ) : (
    <MinusIcon aria-hidden="true" />
  );
  return (
    <IconButton
      {...mergeProps(props, field.stepperProps(direction))}
      type="button"
      tabIndex={-1}
      variant="ghost"
      size={state.size}
      aria-label={props['aria-label'] ?? (direction > 0 ? incrementLabel : decrementLabel)}
      aria-controls={field.inputProps.id}
      disabled={blocked || props.disabled}
      data-number-field-step={direction > 0 ? 'increment' : 'decrement'}
      icon={icon}
      className={stacked ? styles.stepButton({ className }) : styles.action({ className })}
    />
  );
}

export function NumberField({
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  step,
  smallStep,
  largeStep,
  locale = 'en-US',
  formatOptions,
  allowWheelScrub = false,
  hideStepper = false,
  invalid,
  disabled,
  size,
  variant = 'outline',
  incrementLabel = messages.numberField.increment,
  decrementLabel = messages.numberField.decrement,
  className,
  style,
  children,
  ...rootProps
}: NumberField.Props) {
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const { items, leading, input, trailing } = splitAroundInput<NumberField.InputProps>(
    children,
    NumberField.Input,
    () => <NumberField.Input />,
    'NumberField',
  );
  const steppers = countOf(items, NumberField.Stepper);
  invariant(steppers <= 1, 'NumberField: Stepper must be declared at most once.');
  const placesSteps =
    steppers + countOf(items, NumberField.Increment) + countOf(items, NumberField.Decrement) > 0;

  const field = useNumberField({
    rootProps,
    input: input.props,
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    step,
    smallStep,
    largeStep,
    locale,
    formatOptions,
    allowWheelScrub,
    disabled,
    invalid,
    clearable: countOf(items, NumberField.Clear) > 0,
  });
  const state: NumberFieldState = { size: resolvedSize, variant, ...field.state };
  const styles = NumberField.Style({ variant, size: resolvedSize });
  const own = [
    NumberField.Stepper,
    NumberField.Increment,
    NumberField.Decrement,
    NumberField.Clear,
  ];

  return (
    <NumberFieldContext value={{ field, state, incrementLabel, decrementLabel, styles }}>
      <TextControlContext
        value={{ state, inputId: field.inputProps.id, clear: field.clear, styles }}
      >
        <div
          data-number-field=""
          {...stateAttributes(state)}
          {...field.rootProps}
          className={styles.root({ className: resolve(className, state) })}
          style={resolve(style, state)}
        >
          <Adornments
            items={leading}
            own={own}
            marker="number-field"
            className={styles.adornment()}
          />
          {input}
          <Adornments
            items={trailing}
            own={own}
            marker="number-field"
            className={styles.adornment()}
          />
          {!hideStepper && !placesSteps && <NumberField.Stepper />}
        </div>
        {field.name && (
          <input
            type="hidden"
            name={field.name}
            form={field.form}
            disabled={state.disabled}
            value={field.value ?? ''}
          />
        )}
      </TextControlContext>
    </NumberFieldContext>
  );
}

export namespace NumberField {
  export type Props = NumberFieldInputProps & {
    value?: number | null;
    defaultValue?: number | null;
    onValueChange?: (value: number | null) => void;
    min?: number;
    max?: number;
    step?: number;
    smallStep?: number;
    largeStep?: number;
    locale?: string;
    formatOptions?: NumberFieldFormatOptions;
    allowWheelScrub?: boolean;
    hideStepper?: boolean;
    invalid?: boolean;
    disabled?: boolean;
    size?: IdsSize;
    variant?: NumberFieldVariant;
    incrementLabel?: string;
    decrementLabel?: string;
    children?: ReactNode;
    className?: StateValue<string | undefined>;
    style?: StateValue<CSSProperties | undefined>;
  };
  export type State = NumberFieldState;
  export type Variant = NumberFieldVariant;
  export type FormatOptions = NumberFieldFormatOptions;
  export type InputProps = NumberFieldInputProps & {
    asChild?: boolean;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
  };
  export type StepperProps = ComponentProps<'div'> & { asChild?: boolean };
  export type StepProps = Omit<ComponentProps<'button'>, 'children'>;
  export type ClearProps = TextControlClearProps;

  export function Input({ asChild, children, className, style }: InputProps) {
    const { field, styles } = useNumberContext('Input');
    const { inputProps } = field;
    const props = {
      ...inputProps,
      className: styles.input({ className: cn(inputProps.className, className) }),
      style: inputProps.style || style ? { ...inputProps.style, ...style } : undefined,
    };
    if (asChild === true) {
      invariant(
        isValidElement(children) &&
          children.type !== Fragment &&
          (typeof children.type !== 'string' || children.type === 'input'),
        '`<NumberField.Input asChild>` requires one input, or a component forwarding input props and ref.',
      );
      return cloneElement(children, props);
    }
    invariant(
      children == null,
      '`<NumberField.Input>` takes its value from `<NumberField>`, not children.',
    );
    return <input {...props} />;
  }

  export function Increment(props: StepProps) {
    return <StepButton {...props} direction={1} />;
  }

  export function Decrement(props: StepProps) {
    return <StepButton {...props} direction={-1} />;
  }

  export function Stepper({ asChild, children, className, ...props }: StepperProps) {
    const { styles } = useNumberContext('Stepper');
    const buttons = (
      <>
        <StepButton direction={1} stacked />
        <StepButton direction={-1} stacked />
      </>
    );
    const merged = mergeProps(
      { 'data-number-field-stepper': '', className: styles.stepper({ className }) },
      props,
    );
    if (asChild) {
      invariant(
        isValidElement<ComponentProps<'div'>>(children) &&
          children.type !== Fragment &&
          (typeof children.type !== 'string' || !['button', 'input', 'a'].includes(children.type)),
        'NumberField.Stepper asChild requires one non-interactive wrapper.',
      );
      return cloneElement(children, mergeProps({ ...children.props }, merged), buttons);
    }
    invariant(children == null, 'NumberField.Stepper supplies its own buttons.');
    return <div {...merged}>{buttons}</div>;
  }

  export const Clear = TextControlClear;

  export const Style = tv({
    extend: textControlStyle,
    slots: {
      stepper: 'flex shrink-0 flex-col self-center',
      stepButton: [
        'min-w-0 rounded-indicator px-0 text-(--ids-color-on-muted)',
        'data-hovered:text-(--ids-color-on-surface) data-pressed:text-(--ids-color-on-surface)',
        'touch-manipulation select-none',
      ],
    },
    variants: {
      size: {
        standard: {
          stepper: 'last:-me-2',
          stepButton: 'h-4 w-6 [&_svg]:size-3',
        },
        tiny: {
          stepper: 'last:-me-1.5',
          stepButton: 'h-3.5 w-5 [&_svg]:size-3',
        },
      } satisfies Record<IdsSize, object>,
    },
  });
}

export type NumberFieldProps = NumberField.Props;
