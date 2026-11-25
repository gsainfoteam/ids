'use client';

import { useControllableState } from '../../../../hooks/use-controllable-state';
import { useInternalReducedMotion } from '../../../../hooks/use-reduced-motion';

import type { Marquee } from '..';

type PlayingOptions = Pick<Marquee.Props, 'playing' | 'defaultPlaying' | 'onPlayingChange'>;

export function useInternalMarqueePlaying({
  playing,
  defaultPlaying,
  onPlayingChange,
}: PlayingOptions) {
  const reduced = useInternalReducedMotion();
  const [chosen, setChosen] = useControllableState<boolean | undefined>({
    value: playing,
    defaultValue: defaultPlaying,
    onValueChange: onPlayingChange as ((playing: boolean | undefined) => void) | undefined,
  });

  return { reduced, playing: !reduced && (chosen ?? true), setPlaying: setChosen };
}
