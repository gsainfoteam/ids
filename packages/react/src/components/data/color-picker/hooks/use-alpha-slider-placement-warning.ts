'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

export function useInternalAlphaSliderPlacementWarning(hiddenFromTheRoot: boolean) {
  useEffect(() => {
    if (!isDevelopment || !hiddenFromTheRoot) return;
    console.warn(
      '[IDS] ColorPicker.AlphaSlider: ColorPicker turns the alpha channel on when it finds an AlphaSlider among its children, and it cannot see one rendered inside your own component. Write <ColorPicker.AlphaSlider /> in the JSX under <ColorPicker>.',
    );
  }, [hiddenFromTheRoot]);
}
