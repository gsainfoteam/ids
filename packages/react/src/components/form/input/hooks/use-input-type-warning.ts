'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

export function useInternalInputTypeWarning(type: string, supported: boolean) {
  useEffect(() => {
    if (isDevelopment && !supported)
      console.warn(
        `[IDS] Input: unsupported type "${type}"; using text. Use the dedicated field for dates, times, colors, files and OTP.`,
      );
  }, [supported, type]);
}
