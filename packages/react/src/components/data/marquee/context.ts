'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { marqueeStyle } from './style';
import type { IdsSize } from '../../../tokens/types';

type Context = {
  styles: ReturnType<typeof marqueeStyle>;
  size: IdsSize;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
};

export const MarqueeContext = createContext<Context | null>(null);

export function useMarqueeContext(part: string) {
  const context = use(MarqueeContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Marquee>\`.`);
  return context;
}
