import { cloneElement, Fragment, isValidElement, type ComponentProps } from 'react';

import { useNumberContext } from './context';
import { StepButton } from './step-button';
import { invariant, mergeProps } from '../../../utils';

export type NumberFieldStepperProps = ComponentProps<'div'> & { asChild?: boolean };

export function NumberFieldStepper({
  asChild,
  children,
  className,
  ...props
}: NumberFieldStepperProps) {
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

NumberFieldStepper.displayName = 'NumberField.Stepper';
