'use client';

import { useEffect, useLayoutEffect, useRef, useState, type FocusEvent } from 'react';

import { useControllableState } from '../../../hooks/use-controllable-state';
import { isNodeFromAnyWindow } from '../../../utils';

import type { CarouselMotion } from './context';
import type { CarouselAutoScrollDirection, CarouselPlaying } from './use-carousel';
import type { Slides } from '../../../internal/slides';
import type { EmblaCarouselType } from 'embla-carousel';

type MotionOptions = {
  slides: Slides;
  motion: CarouselMotion | null;
  scrollDirection: CarouselAutoScrollDirection;
  playing: CarouselPlaying;
};

const PAUSE_CONTROL = '[data-carousel-pause]';

function reachedTheEnd(api: EmblaCarouselType, direction: CarouselAutoScrollDirection) {
  return direction === 'backward' ? !api.canScrollPrev() : !api.canScrollNext();
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
  playing: { value, defaultValue, onValueChange },
}: MotionOptions) {
  const [chosen, setChosen] = useControllableState<boolean | undefined>({
    value,
    defaultValue,
    onValueChange: (next) => {
      if (next !== undefined) onValueChange?.(next);
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
