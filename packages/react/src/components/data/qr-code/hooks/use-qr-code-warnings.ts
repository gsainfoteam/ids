'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

import type { QRCodeErrorCorrection } from '../lib/qr-path';

const LEVELS_TOO_LOW_FOR_A_LOGO = new Set(['L', 'M']);

export function useInternalQRCodeWarnings({
  value,
  overflow,
  hasLogo,
  level,
}: {
  value: string;
  overflow: boolean;
  hasLogo: boolean;
  level: QRCodeErrorCorrection;
}) {
  useEffect(() => {
    if (!isDevelopment) return;
    if (value === '') console.warn('[IDS] QRCode: value is empty.');
    if (overflow)
      console.warn(
        `[IDS] QRCode: value is too long to encode at error correction level ${level}. Lower errorCorrection or shorten the value.`,
      );
    if (hasLogo && LEVELS_TOO_LOW_FOR_A_LOGO.has(level))
      console.warn(
        `[IDS] QRCode: a logo covers modules, so use errorCorrection 'Q' or 'H' instead of '${level}'.`,
      );
  }, [value, overflow, hasLogo, level]);
}
