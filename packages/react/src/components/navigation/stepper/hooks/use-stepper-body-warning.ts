'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

export function useInternalStepperBodyWarning(hasNoRoomBesideTheSteps: boolean) {
  useEffect(() => {
    if (isDevelopment && hasNoRoomBesideTheSteps)
      console.warn(
        '[IDS] Stepper: Stepper.Body is hidden in a horizontal Stepper, where the steps sit side by side. Use orientation="vertical", or show the content outside the Stepper.',
      );
  }, [hasNoRoomBesideTheSteps]);
}
