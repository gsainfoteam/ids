import { StepButton, type NumberFieldStepProps } from './step-button';

export function NumberFieldIncrement(props: NumberFieldStepProps) {
  return <StepButton {...props} direction={1} />;
}

NumberFieldIncrement.displayName = 'NumberField.Increment';
