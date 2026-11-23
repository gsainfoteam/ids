'use client';

import { PasswordFieldCapsLock } from './caps-lock';
import { PasswordFieldContext } from './context';
import { PasswordFieldInput } from './input';
import { passwordFieldStyle } from './style';
import { usePasswordField } from './use-password-field';
import { PasswordFieldVisibilityToggle } from './visibility-toggle';
import { type FieldSurfaceVariant } from '../../../internal/surfaces/field-surface';
import {
  Adornments,
  TextControlClear,
  TextControlContext,
  countOf,
  splitAroundInput,
  stateAttributes,
  writesNoneOf,
  type TextControlState,
} from '../../../internal/text-control';
import { invariant } from '../../../utils';
import { useFieldSize } from '../field/context';

import type { PasswordField } from '.';

export type PasswordFieldVariant = FieldSurfaceVariant;
export type PasswordFieldState = TextControlState & { visible: boolean };

export type StateValue<T> = T | ((state: PasswordFieldState) => T);

function resolve<T>(value: StateValue<T>, state: PasswordFieldState): T {
  return typeof value === 'function' ? (value as (state: PasswordFieldState) => T)(state) : value;
}

export function PasswordFieldRoot({
  variant = 'outline',
  size,
  disabled,
  invalid,
  onValueChange,
  visible,
  defaultVisible = false,
  onVisibleChange,
  className,
  style,
  children,
  ...rootProps
}: PasswordField.Props) {
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const { items, leading, input, trailing } = splitAroundInput<PasswordField.InputProps>(
    children,
    PasswordFieldInput,
    () => <PasswordFieldInput />,
    'PasswordField',
  );
  invariant(
    countOf(items, PasswordFieldVisibilityToggle) <= 1,
    '`<PasswordField>` accepts at most one `<PasswordFieldVisibilityToggle />`.',
  );
  invariant(
    countOf(items, PasswordFieldCapsLock) <= 1,
    '`<PasswordField>` accepts at most one `<PasswordFieldCapsLock />`.',
  );
  const own = [PasswordFieldVisibilityToggle, PasswordFieldCapsLock, TextControlClear];
  const drawsDefaultParts = writesNoneOf(items, [PasswordFieldInput, ...own]);

  const field = usePasswordField({
    rootProps,
    input: input.props,
    disabled,
    invalid,
    onValueChange,
    visible,
    defaultVisible,
    onVisibleChange,
    clearable: countOf(items, TextControlClear) > 0,
  });
  const state: PasswordFieldState = { size: resolvedSize, variant, ...field.state };
  const styles = passwordFieldStyle({ variant, size: resolvedSize });

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
          {drawsDefaultParts && (
            <>
              <PasswordFieldCapsLock />
              <PasswordFieldVisibilityToggle />
            </>
          )}
        </div>
      </TextControlContext>
    </PasswordFieldContext>
  );
}
