'use client';

import { cloneElement, Fragment, isValidElement, type ComponentProps } from 'react';

import { InsideStepperContext, useNumberContext } from './context';
import { NumberFieldDecrement } from './decrement';
import { NumberFieldIncrement } from './increment';
import { invariant, mergeProps } from '../../../utils';

export type NumberFieldStepperProps = ComponentProps<'div'> & { asChild?: boolean };

export function NumberFieldStepper({
  asChild,
  children,
  className,
  ...props
}: NumberFieldStepperProps) {
  const { styles } = useNumberContext('Stepper');
  const defaultButtons = (
    <>
      <NumberFieldIncrement />
      <NumberFieldDecrement />
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
    return (
      <InsideStepperContext value>
        {cloneElement(children, mergeProps({ ...children.props }, merged), defaultButtons)}
      </InsideStepperContext>
    );
  }
  return (
    <InsideStepperContext value>
      <div {...merged}>{children ?? defaultButtons}</div>
    </InsideStepperContext>
  );
}

NumberFieldStepper.displayName = 'NumberField.Stepper';
