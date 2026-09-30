'use client';

import { useEffect, useState, type ComponentProps } from 'react';

import type { NaturalSize } from './use-image-group';

export type Probed = NaturalSize | 'failed';

type Known = { src: string; result: Probed };

const SIZE_OF_AN_IMAGE_WITHOUT_ONE: NaturalSize = { width: 1, height: 1 };

export function useNaturalSize(
  src: string | undefined,
  wanted: boolean,
  crossOrigin?: ComponentProps<'img'>['crossOrigin'],
): Probed | undefined {
  const [known, setKnown] = useState<Known | null>(null);

  useEffect(() => {
    if (!src || !wanted) return;

    const probe = document.createElement('img');
    let current = true;
    const settle = (result: Probed) => {
      if (current) setKnown({ src, result });
    };

    if (crossOrigin !== undefined) probe.crossOrigin = crossOrigin;
    probe.decoding = 'async';
    probe.onload = () =>
      settle(
        probe.naturalWidth > 0
          ? { width: probe.naturalWidth, height: probe.naturalHeight }
          : SIZE_OF_AN_IMAGE_WITHOUT_ONE,
      );
    probe.onerror = () => settle('failed');
    probe.src = src;

    return () => {
      current = false;
      probe.onload = null;
      probe.onerror = null;
    };
  }, [src, wanted, crossOrigin]);

  return known !== null && known.src === src ? known.result : undefined;
}
