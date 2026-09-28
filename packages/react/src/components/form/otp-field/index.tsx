import {
  createContext,
  use,
  type ChangeEvent,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { MinusIcon } from '@heroicons/react/16/solid';

import { lengthOnlyPattern, type OTPFieldPattern } from './otp-code';
import { useOTPField, type OTPSlotState } from './use-otp-field';
import { messages } from '../../../internal/messages';
import { cn, invariant, mergeProps, tv } from '../../../utils';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

export type { OTPFieldPattern } from './otp-code';
export type OTPFieldVariant = 'outline' | 'soft';

type NativeInputProps = Omit<
  ComponentProps<'input'>,
  | 'type'
  | 'size'
  | 'children'
  | 'value'
  | 'defaultValue'
  | 'pattern'
  | 'maxLength'
  | 'minLength'
  | 'placeholder'
  | 'className'
  | 'style'
>;

export type OTPFieldProps = NativeInputProps & {
  length: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  pattern?: OTPFieldPattern;
  mask?: boolean | string;
  placeholder?: string;
  invalid?: boolean;
  size?: IdsSize;
  variant?: OTPFieldVariant;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

type Context = {
  slots: OTPSlotState[];
  mask: boolean | string | undefined;
  placeholder: string | undefined;
  styles: ReturnType<typeof OTPField.Style>;
};

const OTPContext = createContext<Context | null>(null);
const GroupContext = createContext(false);

function useOTPContext(part: string) {
  const context = use(OTPContext);
  invariant(context, `${part} must be rendered inside OTPField.`);
  return context;
}

const passwordManagerOptOut = {
  'data-1p-ignore': '',
  'data-lpignore': 'true',
  'data-bwignore': '',
  'data-form-type': 'other',
};

const noIosFocusZoom = cn('text-base');

export function OTPField({
  length,
  value,
  defaultValue,
  onValueChange,
  onComplete,
  pattern = 'numeric',
  mask,
  placeholder,
  invalid,
  size,
  variant = 'outline',
  className,
  style,
  children,
  ref,
  onChange,
  ...inputProps
}: OTPFieldProps) {
  invariant(
    Number.isInteger(length) && length >= 1 && length <= 12,
    'OTPField: length must be an integer from 1 to 12.',
  );
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const styles = OTPField.Style({ size: resolvedSize, variant });
  const { state, handlers, rootRef, inputRef } = useOTPField({
    length,
    value,
    defaultValue,
    onValueChange,
    onComplete,
    pattern,
    disabled: inputProps.disabled,
    readOnly: inputProps.readOnly,
    ref,
  });

  const ariaInvalid = inputProps['aria-invalid'] ?? invalid;
  const isInvalid = ariaInvalid === true || ariaInvalid === 'true';
  const labelled =
    inputProps['aria-label'] !== undefined ||
    inputProps['aria-labelledby'] !== undefined ||
    inputProps.id !== undefined;

  const cleanBeforeOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    handlers.onChange(event);
    onChange?.(event);
  };

  const input = mergeProps(
    {
      type: 'text',
      autoComplete: 'one-time-code',
      inputMode: pattern === 'numeric' ? ('numeric' as const) : ('text' as const),
      autoCapitalize: 'none',
      autoCorrect: 'off',
      spellCheck: false,
      'aria-label': labelled ? undefined : messages.otpField.label,
      ...passwordManagerOptOut,
      ...inputProps,
    },
    {
      ...handlers,
      onChange: cleanBeforeOnChange,
      value: state.display,
      maxLength: length,
      pattern: lengthOnlyPattern(length),
      'aria-invalid': ariaInvalid,
      className: styles.input(),
    },
  );

  return (
    <OTPContext.Provider value={{ slots: state.slots, mask, placeholder, styles }}>
      <div
        ref={rootRef}
        className={styles.root({ className })}
        style={style}
        data-otp-field=""
        data-size={resolvedSize}
        data-variant={variant}
        data-focused={state.focused ? '' : undefined}
        data-complete={state.code.length === length ? '' : undefined}
        data-invalid={isInvalid ? '' : undefined}
        data-disabled={inputProps.disabled ? '' : undefined}
        data-readonly={inputProps.readOnly ? '' : undefined}
      >
        {children ?? (
          <OTPField.Group>
            {state.slots.map((slot) => (
              <OTPField.Slot key={slot.index} index={slot.index} />
            ))}
          </OTPField.Group>
        )}
        <input {...input} ref={inputRef} />
      </div>
    </OTPContext.Provider>
  );
}

function Masked({
  char,
  mask,
  className,
}: {
  char: string;
  mask: boolean | string | undefined;
  className: string;
}) {
  if (mask === true) return <span className={className} />;
  if (typeof mask === 'string' && mask !== '') return mask;
  return char;
}

export namespace OTPField {
  export type Props = OTPFieldProps;
  export type Variant = OTPFieldVariant;
  export type SlotState = OTPSlotState;

  export type GroupProps = ComponentProps<'div'>;

  export type SlotProps = Omit<ComponentProps<'div'>, 'children' | 'className'> & {
    index: number;
    className?: string | ((state: SlotState) => string | undefined);
    children?: ReactNode | ((state: SlotState) => ReactNode);
  };

  export type SeparatorProps = ComponentProps<'div'>;

  export type CaretProps = ComponentProps<'span'>;

  export function Group({ className, ...props }: GroupProps) {
    const { styles } = useOTPContext('OTPField.Group');
    return (
      <GroupContext value={true}>
        <div {...props} data-otp-group="" className={styles.group({ className })} />
      </GroupContext>
    );
  }

  export function Slot({ index, className, children, ...props }: SlotProps) {
    const { slots, mask, placeholder, styles } = useOTPContext('OTPField.Slot');
    const grouped = use(GroupContext);
    const state = slots[index];
    invariant(state, `OTPField.Slot: index ${index} is outside the code length.`);

    const resolvedClassName = typeof className === 'function' ? className(state) : className;
    const fallback = state.char ?? placeholder?.charAt(index) ?? '';
    const content =
      typeof children === 'function'
        ? children(state)
        : (children ?? (
            <>
              {state.char === undefined ? (
                <span className={styles.placeholder()}>{fallback}</span>
              ) : (
                <Masked char={state.char} mask={mask} className={styles.maskDot()} />
              )}
              {state.hasFakeCaret && <Caret />}
            </>
          ));

    return (
      <div
        {...props}
        aria-hidden="true"
        data-otp-slot={index}
        data-active={state.isActive ? '' : undefined}
        data-filled={state.isFilled ? '' : undefined}
        data-grouped={grouped ? '' : undefined}
        className={styles.slot({ className: resolvedClassName })}
      >
        {content}
      </div>
    );
  }

  export function Separator({ className, children, ...props }: SeparatorProps) {
    const { styles } = useOTPContext('OTPField.Separator');
    return (
      <div {...props} aria-hidden="true" className={styles.separator({ className })}>
        {children ?? <MinusIcon />}
      </div>
    );
  }

  export function Caret({ className, ...props }: CaretProps) {
    const { styles } = useOTPContext('OTPField.Caret');
    return (
      <span {...props} className={styles.caret()}>
        <span className={cn(styles.caretLine(), className)} />
      </span>
    );
  }

  export const Style = tv({
    slots: {
      root: 'group/otp relative inline-flex items-center gap-2 data-disabled:opacity-50',
      input: [
        'absolute inset-0 z-10 size-full cursor-text appearance-none border-0 bg-transparent p-0',
        'font-mono',
        noIosFocusZoom,
        'tracking-[-0.5em] text-transparent caret-transparent outline-none',
        'selection:bg-transparent disabled:cursor-not-allowed',
      ],
      group: 'flex items-center',
      slot: [
        'relative flex items-center justify-center border shadow-xs',
        'text-(--ids-color-on-surface)',
        'transition-[color,background-color,border-color,box-shadow] duration-(--ids-motion-fast)',
        'motion-reduce:transition-none',
        'rounded-standard data-grouped:rounded-none',
        'data-grouped:-ms-px data-grouped:first:ms-0',
        'data-grouped:first:rounded-s-standard data-grouped:last:rounded-e-standard',
        'data-active:z-20 data-active:border-(--ids-color-primary)',
        'data-active:ring-[3px] data-active:ring-(--ids-color-primary)/40',
        'group-data-invalid/otp:border-(--ids-color-danger)',
        'group-data-invalid/otp:data-active:ring-(--ids-color-danger)/40',
      ],
      placeholder: 'text-(--ids-color-on-muted)',
      maskDot: 'size-2 rounded-full bg-current',
      separator: 'flex items-center text-(--ids-color-on-muted) [&_svg]:size-4',
      caret: 'pointer-events-none absolute inset-0 flex items-center justify-center',
      caretLine:
        'h-1/2 w-px animate-caret-blink bg-(--ids-color-on-surface) motion-reduce:animate-none',
    },
    variants: {
      variant: {
        outline: { slot: 'border-(--ids-color-border) bg-(--ids-color-surface)' },
        soft: { slot: 'border-transparent bg-(--ids-color-primary)/10 shadow-none' },
      } satisfies Record<OTPFieldVariant, object>,
      size: {
        standard: { slot: 'size-(--ids-size-control-standard) text-body-b2-medium' },
        tiny: { slot: 'size-(--ids-size-control-tiny) text-body-b3-medium' },
      } satisfies Record<IdsSize, object>,
    },
    defaultVariants: { variant: 'outline', size: 'standard' },
  });
}
