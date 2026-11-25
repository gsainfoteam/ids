'use client';

import { useInternalTemporalContext } from '../context';

import type { TemporalPickerApi } from '../lib/types';

export function useInternalTemporalPicker<V>(part: string) {
  return useInternalTemporalContext(part).picker as TemporalPickerApi<V>;
}
