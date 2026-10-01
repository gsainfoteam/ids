'use client';

import { cloneElement, Fragment, isValidElement } from 'react';

import { useNumberContext } from './context';
import { cn, invariant } from '../../../utils';

import type { NumberField } from '.';

export function NumberFieldInput({ asChild, children, className, style }: NumberField.InputProps) {
  const { field, styles } = useNumberContext('Input');
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
      '`<NumberField.Input asChild>` requires one input, or a component forwarding input props and ref.',
    );
    return cloneElement(children, finalProps);
  }
  invariant(
    children == null,
    '`<NumberField.Input>` takes its value from `<NumberField>`, not children.',
  );
  return <input {...finalProps} />;
}

NumberFieldInput.displayName = 'NumberField.Input';
