'use client';

import {
  cloneElement,
  isValidElement,
  useRef,
  type ComponentProps,
  type ReactElement,
} from 'react';

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import { usePasswordContext } from './context';
import { messages } from '../../../internal/messages';
import { invariant, mergeProps } from '../../../utils';
import { IconToggle } from '../../action/icon-toggle';

import type { PasswordFieldState } from '.';

export type PasswordFieldVisibilityToggleProps = Omit<
  ComponentProps<'button'>,
  'children' | 'value'
> & {
  asChild?: boolean;
  children?: ReactElement | ((state: PasswordFieldState) => ReactElement);
};

function isPointerClick(event: { detail: number }) {
  return event.detail > 0;
}

export function PasswordFieldVisibilityToggle({
  asChild,
  children,
  className,
  onClick,
  ...props
}: PasswordFieldVisibilityToggleProps) {
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

PasswordFieldVisibilityToggle.displayName = 'PasswordField.VisibilityToggle';
