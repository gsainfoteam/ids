'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FocusEvent } from 'react';

import AutoScroll from 'embla-carousel-auto-scroll';
import Autoplay from 'embla-carousel-autoplay';

import { useControllableState } from '../../../hooks/use-controllable-state';
import { isNodeFromAnyWindow } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

import type { CarouselMotion } from './context';
import type { Slides } from '../../../internal/slides';
import type { EmblaCarouselType, EmblaPluginType } from 'embla-carousel';

export type CarouselAutoplay = boolean | { delay?: number };

export type CarouselAutoScrollDirection = 'forward' | 'backward';

export type CarouselAutoScroll =
  | boolean
  | { speed?: number; direction?: CarouselAutoScrollDirection };

type PluginOptions = {
  autoplay: CarouselAutoplay | undefined;
  autoScroll: CarouselAutoScroll | undefined;
};

type MotionOptions = {
  slides: Slides;
  motion: CarouselMotion | null;
  scrollDirection: CarouselAutoScrollDirection;
  playing: boolean | undefined;
  defaultPlaying: boolean | undefined;
  onPlayingChange: ((playing: boolean) => void) | undefined;
};

const AUTOPLAY_DELAY = 4000;
const AUTO_SCROLL_SPEED = 2;
const PAUSE_CONTROL = '[data-carousel-pause]';
const NO_PLUGINS: EmblaPluginType[] = [];
const IDS_DECIDES_WHEN_TO_PLAY = {
  playOnInit: false,
  stopOnInteraction: true,
  stopOnFocusIn: false,
  stopOnMouseEnter: false,
};

const settingsOf = <T extends object>(value: boolean | T | undefined): Partial<T> | null => {
  if (value === undefined || value === false) return null;
  return value === true ? {} : value;
};

type CarouselPlugins = {
  motion: CarouselMotion | null;
  plugins: EmblaPluginType[];
  scrollDirection: CarouselAutoScrollDirection;
};

function reachedTheEnd(api: EmblaCarouselType, direction: CarouselAutoScrollDirection) {
  return direction === 'backward' ? !api.canScrollPrev() : !api.canScrollNext();
}

export function useCarouselPlugins({ autoplay, autoScroll }: PluginOptions): CarouselPlugins {
  const autoplaySettings = settingsOf(autoplay);
  const autoScrollSettings = autoplaySettings ? null : settingsOf(autoScroll);
  const bothRequested = autoplaySettings !== null && settingsOf(autoScroll) !== null;

  const motion: CarouselMotion | null = autoplaySettings
    ? 'autoplay'
    : autoScrollSettings
      ? 'autoScroll'
      : null;
  const delay = autoplaySettings?.delay ?? AUTOPLAY_DELAY;
  const speed = autoScrollSettings?.speed ?? AUTO_SCROLL_SPEED;
  const scrollDirection = autoScrollSettings?.direction ?? 'forward';

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

  return { motion, plugins, scrollDirection };
}

function startOrStop(
  api: EmblaCarouselType,
  motion: CarouselMotion,
  { rotating, jump }: { rotating: boolean; jump: boolean },
) {
  const plugins = api.plugins();
  const plugin = motion === 'autoplay' ? plugins.autoplay : plugins.autoScroll;
  if (!plugin) return;

  const pluginSkippedInitWithOneSnap = api.scrollSnapList().length <= 1;
  if (!rotating || pluginSkippedInitWithOneSnap) plugin.stop();
  else if (motion === 'autoplay') plugins.autoplay.play(jump);
  else plugin.play();
}

export function useCarouselMotion({
  slides,
  motion,
  scrollDirection,
  playing: playingProp,
  defaultPlaying,
  onPlayingChange,
}: MotionOptions) {
  const [chosen, setChosen] = useControllableState<boolean | undefined>({
    value: playingProp,
    defaultValue: defaultPlaying,
    onValueChange: (next) => {
      if (next !== undefined) onPlayingChange?.(next);
    },
  });
  const [hovered, setHovered] = useState(false);
  const [keyboardInside, setKeyboardInside] = useState(false);

  const playing = motion !== null && (chosen ?? !slides.reducedMotion);
  const held = hovered || keyboardInside || slides.dragging;
  const rotating = playing && !held && slides.snapCount > 1;
  const { api, reducedMotion: jump } = slides;

  const latest = useRef({ rotating, setChosen });

  useLayoutEffect(() => {
    latest.current = { rotating, setChosen };
  });

  useEffect(() => {
    if (!api || !motion) return;
    const apply = () => startOrStop(api, motion, { rotating, jump });
    apply();
    api.on('reInit', apply);
    return () => {
      api.off('reInit', apply);
    };
  }, [api, motion, rotating, jump]);

  useEffect(() => {
    if (!api || motion !== 'autoScroll') return;
    const stoppedByItself = () => {
      const engine = api.internalEngine();
      const released = !engine.dragHandler.pointerDown();
      const ranOffTheTrack = !engine.options.loop && reachedTheEnd(api, scrollDirection);
      if (latest.current.rotating && released && ranOffTheTrack) latest.current.setChosen(false);
    };
    api.on('autoScroll:stop', stoppedByItself);
    return () => {
      api.off('autoScroll:stop', stoppedByItself);
    };
  }, [api, motion, scrollDirection]);

  const rewindWhenTheTrackRanOut = () => {
    if (!api || motion !== 'autoScroll' || api.internalEngine().options.loop) return;
    if (!reachedTheEnd(api, scrollDirection)) return;
    slides.scrollTo(scrollDirection === 'backward' ? slides.snapCount - 1 : 0);
  };

  const setPlaying = (next: boolean) => {
    if (next) rewindWhenTheTrackRanOut();
    setChosen(next);
  };

  const onFocus = (event: FocusEvent<HTMLElement>) => {
    const target = event.target;
    setKeyboardInside(target.matches(':focus-visible') && !target.closest(PAUSE_CONTROL));
  };

  const onBlur = (event: FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget;
    if (!isNodeFromAnyWindow(next) || !event.currentTarget.contains(next)) setKeyboardInside(false);
  };

  return { playing, rotating, setPlaying, setHovered, onFocus, onBlur };
}
