'use client';

import { createContext, use, useSyncExternalStore } from 'react';

import { detectPlatform } from '@tanstack/react-hotkeys';

import { useFieldSize } from '../../../form/field/context';

import type { IdsSize } from '../../../../tokens/types';
import type { KbdLabels, KbdPlatform } from '../lib/keys';

export type KbdGroupContextValue = {
  size: IdsSize | undefined;
  platform: KbdPlatform | undefined;
  labels: KbdLabels | undefined;
};

export const KbdGroupContext = createContext<KbdGroupContextValue | null>(null);

const subscribeToNothing = () => () => {};
const platformBeforeHydration = (): KbdPlatform => 'windows';

export function useInternalPlatform(override: KbdPlatform | undefined) {
  const detected = useSyncExternalStore(
    subscribeToNothing,
    detectPlatform,
    platformBeforeHydration,
  );
  return override ?? detected;
}

export function useInternalKbd({
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
    platform: useInternalPlatform(platform ?? group?.platform),
    labels: { ...group?.labels, ...labels },
  };
}
