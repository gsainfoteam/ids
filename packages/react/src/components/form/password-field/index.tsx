import {
  cloneElement,
  createContext,
  isValidElement,
  use,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type SVGProps,
} from 'react';

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import { usePasswordField, type PasswordFieldInputProps } from './use-password-field';
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

export type { PasswordFieldInputProps } from './use-password-field';
export type PasswordFieldVariant = FieldSurfaceVariant;
export type PasswordFieldState = TextControlState & { visible: boolean };

type StateValue<T> = T | ((state: PasswordFieldState) => T);

type PasswordFieldContextValue = {
  inputProps: ReturnType<typeof usePasswordField>['inputProps'];
  state: PasswordFieldState;
  capsLock: boolean;
  toggle: (pointer: boolean) => void;
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

// Heroicons has no Caps Lock glyph; this is the ⇪ key cap drawn on the same 24px outline grid.
function CapsLockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path strokeLinejoin="round" d="M12 3.75 4.5 11.25h3.75v4.5h7.5v-4.5h3.75L12 3.75Z" />
      <path strokeLinecap="round" d="M8.25 19.5h7.5" />
    </svg>
  );
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
  export type VisibilityToggleProps = Omit<ComponentProps<'button'>, 'children'> & {
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

  // One fixed name with aria-pressed, as a toggle button should have; the icon shows the state.
  // Pressing it with a pointer keeps focus in the input; from the keyboard focus stays on it.
  export function VisibilityToggle({
    asChild,
    children,
    className,
    onClick,
    ...props
  }: VisibilityToggleProps) {
    const { state, toggle, inputProps, styles } = usePasswordContext('VisibilityToggle');
    const internal = {
      type: 'button' as const,
      disabled: state.disabled || props.disabled,
      'aria-pressed': state.visible,
      'aria-controls': inputProps.id,
      'data-password-field-toggle': '',
      onPointerDown: (event: { button: number; preventDefault: () => void }) => {
        if (event.button === 0) event.preventDefault();
      },
      onClick: (event: Parameters<NonNullable<typeof onClick>>[0]) => {
        onClick?.(event);
        if (!event.defaultPrevented && !state.disabled) toggle(event.detail > 0);
      },
    };
    if (asChild) {
      invariant(
        isValidElement<Record<string, unknown>>(children) &&
          (typeof children.type !== 'string' || children.type === 'button'),
        '`<PasswordField.VisibilityToggle asChild>` requires one button, or a component forwarding button props and ref.',
      );
      // A child drawn with asChild names itself through its own text.
      return cloneElement(children, mergeProps(mergeProps(children.props, props), internal));
    }
    const icon =
      typeof children === 'function'
        ? children(state)
        : (children ??
          (state.visible ? <EyeSlashIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />));
    return (
      <IconButton
        {...props}
        {...internal}
        aria-label={props['aria-label'] ?? messages.passwordField.show}
        variant="ghost"
        size={state.size}
        icon={icon}
        className={styles.action({ className })}
      />
    );
  }

  // The glyph appears only while Caps Lock is on and the input has focus. The live region stays
  // mounted so the change is announced; a region that appears with its text is often not read.
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
        <span role="status" className="sr-only">
          {capsLock ? text : ''}
        </span>
      </>
    );
  }

  export const Clear = TextControlClear;

  export const Style = tv({
    extend: textControlStyle,
    slots: {
      capsLock: 'inline-flex shrink-0 items-center text-(--ids-color-on-muted)',
    },
    variants: {
      size: {
        standard: { capsLock: '[&_svg]:size-(--ids-size-icon-standard)' },
        tiny: { capsLock: '[&_svg]:size-(--ids-size-icon-tiny)' },
      } satisfies Record<IdsSize, object>,
    },
  });
}

export type PasswordFieldProps = PasswordField.Props;
