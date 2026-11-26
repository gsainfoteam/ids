'use client';

import { invariant } from '../../../../utils';

export type UseSliderOptions = {
  largeStep?: number;
  minStepsBetweenThumbs?: number;
  formatLabel?: (value: number) => string;
};

export type SliderInstance = {
  largeStep: number | undefined;
  minStepsBetweenThumbs: number;
  formatLabel: ((value: number) => string) | undefined;
};

export function useSlider({
  largeStep,
  minStepsBetweenThumbs = 0,
  formatLabel,
}: UseSliderOptions = {}): SliderInstance {
  invariant(largeStep === undefined || largeStep > 0, '`useSlider` `largeStep` must be positive.');
  invariant(
    Number.isInteger(minStepsBetweenThumbs) && minStepsBetweenThumbs >= 0,
    '`useSlider` `minStepsBetweenThumbs` must be a non-negative integer.',
  );

  return { largeStep, minStepsBetweenThumbs, formatLabel };
}
