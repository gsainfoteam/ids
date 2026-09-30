'use client';

import { useLayoutEffect, useState, type FocusEvent, type PointerEvent } from 'react';

import { clamp } from 'es-toolkit';

import type { MarqueeOrientation } from '.';

const MARQUEE_KEYFRAMES = 'ids-marquee';
const SWAPPED = 'data-swapped';

type Options = {
  orientation: MarqueeOrientation;
  reverse: boolean;
  moving: boolean;
};

const isMarqueeAnimation = (animation: Animation): animation is CSSAnimation =>
  'animationName' in animation && animation.animationName === MARQUEE_KEYFRAMES;

function spanAlong(box: DOMRect, vertical: boolean) {
  return vertical ? { start: box.top, size: box.height } : { start: box.left, size: box.width };
}

function isOver(element: Element, pointer: number, vertical: boolean) {
  const { start, size } = spanAlong(element.getBoundingClientRect(), vertical);
  return pointer >= start && pointer < start + size;
}

function offsetSign(viewport: HTMLElement, vertical: boolean) {
  const pushedRight = !vertical && getComputedStyle(viewport).direction === 'rtl';
  return pushedRight ? 1 : -1;
}

function centerFocused(
  viewport: HTMLElement,
  track: HTMLElement,
  target: HTMLElement,
  { orientation, reverse }: Options,
) {
  const vertical = orientation === 'vertical';
  const animation = track.getAnimations().find(isMarqueeAnimation);
  const timing = animation?.effect?.getComputedTiming();
  const duration = Number(timing?.duration);
  const loop = spanAlong(track.getBoundingClientRect(), vertical).size / 2;
  if (!animation || !timing || !(duration > 0) || !(loop > 0)) return;

  const shown = spanAlong(viewport.getBoundingClientRect(), vertical);
  const focused = spanAlong(target.getBoundingClientRect(), vertical);
  const sign = offsetSign(viewport, vertical);
  const [low, high] = sign < 0 ? [-loop, 0] : [0, loop];

  const offset = sign * loop * (timing.progress ?? 0);
  const swapBack = track.hasAttribute(SWAPPED) ? sign * loop : 0;
  const startInOrder = focused.start - shown.start - offset + swapBack;
  const center = (shown.size - focused.size) / 2;
  const offsetInOrder = center - startInOrder;
  const offsetBehindCopy = offsetInOrder + sign * loop;
  const behindCopy = offsetInOrder < low || offsetInOrder > high;

  track.toggleAttribute(SWAPPED, behindCopy);
  const next = clamp(behindCopy ? offsetBehindCopy : offsetInOrder, low, high);
  const progress = next / (sign * loop);
  animation.currentTime = (reverse ? 1 - progress : progress) * duration;
}

export function useMarquee(options: Options) {
  const { orientation, moving } = options;
  const vertical = orientation === 'vertical';
  const [track, setTrack] = useState<HTMLElement | null>(null);
  const [length, setLength] = useState<number>();

  useLayoutEffect(() => {
    if (!track || !moving) return;

    const measure = () => {
      const size = vertical ? track.offsetHeight : track.offsetWidth;
      if (size > 0) setLength(Math.round(size / 2));
    };

    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [track, moving, vertical]);

  const viewportProps = {
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      const copy = track?.children[1];
      if (!track || !copy) return;

      const pointer = vertical ? event.clientY : event.clientX;
      if (isOver(copy, pointer, vertical)) track.toggleAttribute(SWAPPED);
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      if (!track || !event.target.matches(':focus-visible')) return;

      centerFocused(event.currentTarget, track, event.target, options);
    },
  };

  return { setTrack, length, viewportProps };
}
