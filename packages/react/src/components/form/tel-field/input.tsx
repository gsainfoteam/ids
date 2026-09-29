import { cloneElement, Fragment, isValidElement } from 'react';

import { useTelContext } from './context';
import { cn, invariant } from '../../../utils';

import type { TelField } from '.';

export function TelFieldInput({ asChild, children, className, style }: TelField.InputProps) {
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

TelFieldInput.displayName = 'TelField.Input';
