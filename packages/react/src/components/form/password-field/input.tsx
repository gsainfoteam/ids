import { cloneElement, isValidElement } from 'react';

import { usePasswordContext } from './context';
import { cn, invariant } from '../../../utils';

import type { PasswordField } from '.';

export function PasswordFieldInput({
  asChild,
  children,
  className,
  style,
}: PasswordField.InputProps) {
  const { inputProps, styles } = usePasswordContext('Input');
  const props = {
    ...inputProps,
    className: styles.input({ className: cn(inputProps.className, className) }),
    style: inputProps.style || style ? { ...inputProps.style, ...style } : undefined,
  };
  if (asChild === true) {
    invariant(
      isValidElement(children) && (typeof children.type !== 'string' || children.type === 'input'),
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

PasswordFieldInput.displayName = 'PasswordField.Input';
