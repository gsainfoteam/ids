'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

export function useInternalStepperTriggerBodyWarning(holdsBody: boolean) {
  useEffect(() => {
    if (isDevelopment && holdsBody)
      console.warn(
        '[IDS] Stepper: Stepper.Body belongs in Stepper.Item next to Stepper.Trigger. Inside the trigger it becomes part of the step button, which cannot hold links or buttons.',
      );
  }, [holdsBody]);
}
