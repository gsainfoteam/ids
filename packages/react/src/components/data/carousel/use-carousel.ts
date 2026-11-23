'use client';

import { useEffect, useMemo } from 'react';

import AutoScroll from 'embla-carousel-auto-scroll';
import Autoplay from 'embla-carousel-autoplay';

import { isDevelopment } from '../../../utils/dev';

import type { CarouselMotion } from './context';
import type { SlidesAlign, SlidesPerScroll } from '../../../internal/slides';
import type { EmblaPluginType } from 'embla-carousel';

export type CarouselAutoScrollDirection = 'forward' | 'backward';

export type CarouselPlaying = {
  value?: boolean;
  defaultValue?: boolean;
  onValueChange?: (playing: boolean) => void;
};

export type CarouselSlides = {
  perView?: number;
  toScroll?: SlidesPerScroll;
  align?: SlidesAlign;
  loop?: boolean;
  dragFree?: boolean;
};

export type CarouselAutoplay = CarouselPlaying & { delay?: number };

export type CarouselAutoScroll = CarouselPlaying & {
  speed?: number;
  direction?: CarouselAutoScrollDirection;
};

export type CarouselOptions = {
  slides?: CarouselSlides;
  autoplay?: CarouselAutoplay;
  autoScroll?: CarouselAutoScroll;
};

export type CarouselInstance = {
  slides: CarouselSlides;
  motion: CarouselMotion | null;
  plugins: EmblaPluginType[];
  scrollDirection: CarouselAutoScrollDirection;
  playing: CarouselPlaying;
};

const AUTOPLAY_DELAY = 4000;
const AUTO_SCROLL_SPEED = 2;
const NO_PLUGINS: EmblaPluginType[] = [];
const IDS_DECIDES_WHEN_TO_PLAY = {
  playOnInit: false,
  stopOnInteraction: true,
  stopOnFocusIn: false,
  stopOnMouseEnter: false,
};

export function useCarousel({
  slides = {},
  autoplay,
  autoScroll,
}: CarouselOptions = {}): CarouselInstance {
  const autoScrollRuns = autoplay ? undefined : autoScroll;
  const running = autoplay ?? autoScrollRuns;
  const motion: CarouselMotion | null = autoplay
    ? 'autoplay'
    : autoScrollRuns
      ? 'autoScroll'
      : null;
  const delay = autoplay?.delay ?? AUTOPLAY_DELAY;
  const speed = autoScrollRuns?.speed ?? AUTO_SCROLL_SPEED;
  const scrollDirection = autoScrollRuns?.direction ?? 'forward';
  const bothRequested = autoplay !== undefined && autoScroll !== undefined;

  const plugins = useMemo(() => {
    if (motion === 'autoplay') return [Autoplay({ ...IDS_DECIDES_WHEN_TO_PLAY, delay })];
    if (motion === 'autoScroll')
      return [AutoScroll({ ...IDS_DECIDES_WHEN_TO_PLAY, speed, direction: scrollDirection })];
    return NO_PLUGINS;
  }, [motion, delay, speed, scrollDirection]);

  useEffect(() => {
    if (isDevelopment && bothRequested)
      console.warn(
        '[IDS] Carousel: autoplay and autoScroll cannot run together, so autoplay runs. Keep only one of them.',
      );
  }, [bothRequested]);

  return {
    slides,
    motion,
    plugins,
    scrollDirection,
    playing: {
      value: running?.value,
      defaultValue: running?.defaultValue,
      onValueChange: running?.onValueChange,
    },
  };
}
