'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { carouselStyle } from './style';
import type { Slides } from '../../../internal/slides';
import type { IdsSize } from '../../../tokens/types';

export type CarouselMotion = 'autoplay' | 'autoScroll';

export type CarouselContextValue = {
  slides: Slides;
  styles: ReturnType<typeof carouselStyle>;
  size: IdsSize;
  motion: CarouselMotion | null;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  edgeControls: boolean;
  onContentHover: (hovered: boolean) => void;
};

export const CarouselContext = createContext<CarouselContextValue | null>(null);

export const SlideIndexContext = createContext<number | null>(null);

export function useCarouselContext(part: string) {
  const context = use(CarouselContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Carousel>\`.`);
  return context;
}
