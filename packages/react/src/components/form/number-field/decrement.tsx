import { StepButton, type NumberFieldStepProps } from './step-button';

export function NumberFieldDecrement(props: NumberFieldStepProps) {
  return <StepButton {...props} direction={-1} />;
}

NumberFieldDecrement.displayName = 'NumberField.Decrement';
