import { createContext, use, useSyncExternalStore } from 'react';

import { detectPlatform, type KbdLabels, type KbdPlatform } from './keys';
import { useFieldSize } from '../../form/field/context';

import type { IdsSize } from '../../../tokens/types';

export type KbdGroupContextValue = {
  size: IdsSize | undefined;
  platform: KbdPlatform | undefined;
  labels: KbdLabels | undefined;
};

export const KbdGroupContext = createContext<KbdGroupContextValue | null>(null);

const subscribeToNothing = () => () => {};

// The server cannot know the visitor's platform, so it renders the portable Ctrl form and
// hydration swaps in ⌘ on Apple devices without a mismatch.
export function usePlatform(override: KbdPlatform | undefined) {
  const detected = useSyncExternalStore(subscribeToNothing, detectPlatform, () => 'other' as const);
  return override ?? detected;
}

export function useKbd({
  size,
  platform,
  labels,
}: {
  size: IdsSize | undefined;
  platform: KbdPlatform | undefined;
  labels: KbdLabels | undefined;
}) {
  const group = use(KbdGroupContext);
  const fieldSize = useFieldSize(size ?? group?.size);
  return {
    size: fieldSize ?? 'standard',
    platform: usePlatform(platform ?? group?.platform),
    labels: { ...group?.labels, ...labels },
  };
}
