'use client';

import { createContext, use, type RefCallback } from 'react';

import { invariant } from '../../../utils';

import type { SliderState, SliderThumbState } from '.';
import type { sliderStyle } from './style';

type SliderContextValue = {
  state: SliderState;
  styles: ReturnType<typeof sliderStyle>;
  min: number;
  max: number;
  step: number;
  range: boolean;
  dragging: number | null;
  formatLabel: ((value: number) => string) | undefined;
  setTrack: RefCallback<HTMLElement>;
  thumbProps: (index: number) => Record<string, unknown>;
};

export const SliderContext = createContext<SliderContextValue | null>(null);

export function useSliderContext(part: string) {
  const context = use(SliderContext);
  invariant(context, `${part} must be rendered inside Slider.`);
  return context;
}

export const SliderThumbContext = createContext<SliderThumbState | null>(null);

export function useSliderThumbContext(part: string) {
  const context = use(SliderThumbContext);
  invariant(context, `${part} must be rendered inside Slider.Thumb.`);
  return context;
}
