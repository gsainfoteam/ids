import type { StepperStatus } from './step-state';
import type { Translate } from '../../../../internal/translate';

export function statusText(status: StepperStatus, t: Translate) {
  if (status === 'completed') return t('stepper.completed');
  if (status === 'error') return t('stepper.error');
  return undefined;
}
