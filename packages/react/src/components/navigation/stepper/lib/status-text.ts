import type { StepStatus } from './step-state';
import type { Translate } from '../../../../internal/translate';

export function statusText(status: StepStatus, t: Translate) {
  if (status === 'completed') return t('stepper.completed');
  if (status === 'error') return t('stepper.error');
  return undefined;
}
