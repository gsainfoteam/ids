'use client';

import { createContext, useContext } from 'react';

import type { segmentedControlStyle } from './style';

export type SegmentedControlOrientation = 'horizontal' | 'vertical';

export type SegmentedControlContextValue = {
  name: string;
  value: string | null;
  select: (value: string) => void;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  form: string | undefined;
  styles: ReturnType<typeof segmentedControlStyle>;
};

export const SegmentedControlContext = createContext<SegmentedControlContextValue | null>(null);

export function useSegmentedControlContext() {
  return useContext(SegmentedControlContext);
}
