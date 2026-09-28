import { createContext, use, useSyncExternalStore } from 'react';

import { detectPlatform } from '@tanstack/react-hotkeys';

import { useFieldSize } from '../../form/field/context';

import type { KbdLabels, KbdPlatform } from './keys';
import type { IdsSize } from '../../../tokens/types';

export type KbdGroupContextValue = {
  size: IdsSize | undefined;
  platform: KbdPlatform | undefined;
  labels: KbdLabels | undefined;
};

export const KbdGroupContext = createContext<KbdGroupContextValue | null>(null);

const subscribeToNothing = () => () => {};
const platformBeforeHydration = (): KbdPlatform => 'windows';

export function usePlatform(override: KbdPlatform | undefined) {
  const detected = useSyncExternalStore(
    subscribeToNothing,
    detectPlatform,
    platformBeforeHydration,
  );
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
