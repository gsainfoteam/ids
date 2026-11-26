'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

import type { StepsName } from '../context';

export function useInternalStepperBodyWarning(name: StepsName, hasNoRoomBesideTheSteps: boolean) {
  useEffect(() => {
    if (isDevelopment && hasNoRoomBesideTheSteps)
      console.warn(
        `[IDS] ${name}: ${name}.Body is hidden in a horizontal ${name}, where the steps sit side by side. Use orientation="vertical", or show the content outside the ${name}.`,
      );
  }, [name, hasNoRoomBesideTheSteps]);
}
