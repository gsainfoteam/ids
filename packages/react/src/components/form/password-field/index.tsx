import {
  cloneElement,
  createContext,
  isValidElement,
  use,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type SVGProps,
} from 'react';

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import { usePasswordField, type PasswordFieldInputProps } from './use-password-field';
import { fieldAction, type FieldSurfaceVariant } from '../../../internal/field-surface';
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
import { IconToggle } from '../../action/icon-toggle';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

export type { PasswordFieldInputProps } from './use-password-field';
export type PasswordFieldVariant = FieldSurfaceVariant;
export type PasswordFieldState = TextControlState & { visible: boolean };

type StateValue<T> = T | ((state: PasswordFieldState) => T);

type PasswordFieldContextValue = {
  inputProps: ReturnType<typeof usePasswordField>['inputProps'];
  state: PasswordFieldState;
  capsLock: boolean;
  toggle: (byPointer: boolean) => void;
  styles: ReturnType<typeof PasswordField.Style>;
};

const PasswordFieldContext = createContext<PasswordFieldContextValue | null>(null);

function usePasswordContext(part: string) {
  const context = use(PasswordFieldContext);
  invariant(
    context != null,
    `\`<PasswordField.${part}>\` must be used inside \`<PasswordField>\`.`,
  );
  return context;
}

function resolve<T>(value: StateValue<T>, state: PasswordFieldState): T {
  return typeof value === 'function' ? (value as (state: PasswordFieldState) => T)(state) : value;
}

function CapsLockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path strokeLinejoin="round" d="M12 3.75 4.5 11.25h3.75v4.5h7.5v-4.5h3.75L12 3.75Z" />
      <path strokeLinecap="round" d="M8.25 19.5h7.5" />
    </svg>
  );
}

function AlwaysMountedStatus({ children }: { children: string }) {
  return (
    <span role="status" className="sr-only">
      {children}
    </span>
  );
}

function isPointerClick(event: { detail: number }) {
  return event.detail > 0;
}

export function PasswordField({
  variant = 'outline',
  size,
  disabled,
  invalid,
  onValueChange,
  visible,
  defaultVisible = false,
  onVisibleChange,
  hideVisibilityToggle = false,
  hideCapsLock = false,
  className,
  style,
  children,
  ...rootProps
}: PasswordField.Props) {
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const { items, leading, input, trailing } = splitAroundInput<PasswordField.InputProps>(
    children,
    PasswordField.Input,
    () => <PasswordField.Input />,
    'PasswordField',
  );
  const toggles = countOf(items, PasswordField.VisibilityToggle);
  const capsLocks = countOf(items, PasswordField.CapsLock);
  invariant(
    toggles <= 1,
    '`<PasswordField>` accepts at most one `<PasswordField.VisibilityToggle />`.',
  );
  invariant(capsLocks <= 1, '`<PasswordField>` accepts at most one `<PasswordField.CapsLock />`.');

  const field = usePasswordField({
    rootProps,
    input: input.props,
    disabled,
    invalid,
    onValueChange,
    visible,
    defaultVisible,
    onVisibleChange,
    clearable: countOf(items, PasswordField.Clear) > 0,
  });
  const state: PasswordFieldState = { size: resolvedSize, variant, ...field.state };
  const styles = PasswordField.Style({ variant, size: resolvedSize });
  const own = [PasswordField.VisibilityToggle, PasswordField.CapsLock, PasswordField.Clear];

  return (
    <PasswordFieldContext
      value={{
        inputProps: field.inputProps,
        state,
        capsLock: field.capsLock,
        toggle: field.toggle,
        styles,
      }}
    >
      <TextControlContext
        value={{ state, inputId: field.inputProps.id, clear: field.clear, styles }}
      >
        <div
          data-password-field=""
          {...stateAttributes(state)}
          data-visible={state.visible ? '' : undefined}
          {...field.rootProps}
          className={styles.root({ className: resolve(className, state) })}
          style={resolve(style, state)}
        >
          <Adornments
            items={leading}
            own={own}
            marker="password-field"
            className={styles.adornment()}
          />
          {input}
          <Adornments
            items={trailing}
            own={own}
            marker="password-field"
            className={styles.adornment()}
          />
          {!hideCapsLock && capsLocks === 0 && <PasswordField.CapsLock />}
          {!hideVisibilityToggle && toggles === 0 && <PasswordField.VisibilityToggle />}
        </div>
      </TextControlContext>
    </PasswordFieldContext>
  );
}

export namespace PasswordField {
  export type Props = PasswordFieldInputProps & {
    variant?: PasswordFieldVariant;
    size?: IdsSize;
    disabled?: boolean;
    invalid?: boolean;
    onValueChange?: (value: string) => void;
    visible?: boolean;
    defaultVisible?: boolean;
    onVisibleChange?: (visible: boolean) => void;
    hideVisibilityToggle?: boolean;
    hideCapsLock?: boolean;
    children?: ReactNode;
    className?: StateValue<string | undefined>;
    style?: StateValue<CSSProperties | undefined>;
  };
  export type State = PasswordFieldState;
  export type Variant = PasswordFieldVariant;
  export type InputProps = PasswordFieldInputProps & {
    asChild?: boolean;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
  };
  export type VisibilityToggleProps = Omit<ComponentProps<'button'>, 'children' | 'value'> & {
    asChild?: boolean;
    children?: ReactElement | ((state: PasswordFieldState) => ReactElement);
  };
  export type CapsLockProps = Omit<ComponentProps<'span'>, 'children'> & {
    label?: string;
    children?: ReactNode;
  };
  export type ClearProps = TextControlClearProps;

  export function Input({ asChild, children, className, style }: InputProps) {
    const { inputProps, styles } = usePasswordContext('Input');
    const props = {
      ...inputProps,
      className: styles.input({ className: cn(inputProps.className, className) }),
      style: inputProps.style || style ? { ...inputProps.style, ...style } : undefined,
    };
    if (asChild === true) {
      invariant(
        isValidElement(children) &&
          (typeof children.type !== 'string' || children.type === 'input'),
        '`<PasswordField.Input asChild>` requires one input, or a component forwarding input props and ref.',
      );
      return cloneElement(children, props);
    }
    invariant(
      children == null,
      '`<PasswordField.Input>` takes `value`/`defaultValue`, not children.',
    );
    return <input {...props} />;
  }

  export function VisibilityToggle({
    asChild,
    children,
    className,
    onClick,
    ...props
  }: VisibilityToggleProps) {
    const { state, toggle, inputProps, styles } = usePasswordContext('VisibilityToggle');
    const pressedByPointer = useRef(false);
    const shared = {
      disabled: state.disabled || props.disabled,
      'aria-controls': inputProps.id,
      'data-password-field-toggle': '',
      onPointerDown: (event: { button: number; preventDefault: () => void }) => {
        if (event.button === 0) event.preventDefault();
      },
    };
    if (asChild) {
      invariant(
        isValidElement<Record<string, unknown>>(children) &&
          (typeof children.type !== 'string' || children.type === 'button'),
        '`<PasswordField.VisibilityToggle asChild>` requires one button, or a component forwarding button props and ref.',
      );
      return cloneElement(
        children,
        mergeProps(mergeProps(children.props, props), {
          ...shared,
          type: 'button' as const,
          'aria-pressed': state.visible,
          onClick: (event: Parameters<NonNullable<typeof onClick>>[0]) => {
            onClick?.(event);
            if (!event.defaultPrevented && !state.disabled) toggle(isPointerClick(event));
          },
        }),
      );
    }
    const iconOnlyName = props['aria-label'] ?? messages.passwordField.show;
    const icon =
      typeof children === 'function'
        ? children(state)
        : (children ??
          (state.visible ? <EyeSlashIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />));
    return (
      <IconToggle
        {...props}
        {...shared}
        aria-label={iconOnlyName}
        variant="ghost"
        size={state.size}
        icon={icon}
        pressed={state.visible}
        onPressedChange={() => toggle(pressedByPointer.current)}
        onClick={(event) => {
          onClick?.(event);
          pressedByPointer.current = isPointerClick(event);
        }}
        className={styles.toggle({ className })}
      />
    );
  }

  export function CapsLock({ label, className, children, ...props }: CapsLockProps) {
    const { capsLock, styles } = usePasswordContext('CapsLock');
    const text = label ?? messages.passwordField.capsLock;
    return (
      <>
        {capsLock && (
          <span
            {...props}
            aria-hidden="true"
            title={text}
            data-password-field-caps-lock=""
            className={styles.capsLock({ className })}
          >
            {children ?? <CapsLockIcon />}
          </span>
        )}
        <AlwaysMountedStatus>{capsLock ? text : ''}</AlwaysMountedStatus>
      </>
    );
  }

  export const Clear = TextControlClear;

  export const Style = tv({
    extend: textControlStyle,
    slots: {
      toggle: [fieldAction.base, 'data-pressed:bg-transparent'],
      capsLock: 'inline-flex shrink-0 items-center text-(--ids-color-on-muted)',
    },
    variants: {
      size: {
        standard: {
          toggle: fieldAction.padded.standard,
          capsLock: '[&_svg]:size-(--ids-size-icon-standard)',
        },
        tiny: {
          toggle: fieldAction.padded.tiny,
          capsLock: '[&_svg]:size-(--ids-size-icon-tiny)',
        },
      } satisfies Record<IdsSize, object>,
    },
  });
}

export type PasswordFieldProps = PasswordField.Props;
