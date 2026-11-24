'use client';

import { useMemo } from 'react';

import {
  geometryThatFits,
  type QRCodeFinderShape,
  type QRCodeGeometry,
  type QRCodeErrorCorrection,
  type QRCodeModuleShape,
} from '../lib/qr-path';

type GeometryOptions = {
  value: string;
  level: QRCodeErrorCorrection;
  shape: QRCodeModuleShape;
  finder: QRCodeFinderShape;
  quietZone: number;
  hasLogo: boolean;
};

export function useInternalQRCodeGeometry({
  value,
  level,
  shape,
  finder,
  quietZone,
  hasLogo,
}: GeometryOptions): QRCodeGeometry | undefined {
  return useMemo(
    () =>
      geometryThatFits(value, {
        errorCorrection: level,
        shape,
        finderShape: finder,
        quietZone,
        logo: hasLogo,
      }),
    [value, level, shape, finder, quietZone, hasLogo],
  );
}
