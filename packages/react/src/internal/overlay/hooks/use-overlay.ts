'use client';

import { use, useMemo } from 'react';

import { ThemeContext } from '../../../components/utility/ids-provider/hooks/use-ids-provider';
import { overlay, type OverlayOptions, type OverlayRender } from '../lib/store';

export function useOverlay() {
  const theme = use(ThemeContext);

  return useMemo(
    () => ({
      ...overlay,
      open: <T>(render: OverlayRender<T>, options: OverlayOptions = {}) =>
        overlay.open(render, { theme, ...options }),
    }),
    [theme],
  );
}
