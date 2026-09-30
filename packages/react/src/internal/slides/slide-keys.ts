import type { KeyboardEvent } from 'react';

import { flushSync } from 'react-dom';

import { keyHandler, type KeyAction, type KeyMap } from '../keys';

import type { Slides } from './use-slides';

const ownsArrowKeys = (element: Element) =>
  element.matches('input, textarea, select') || (element as HTMLElement).isContentEditable;

function focusTheSelectedSlide({ api }: Slides) {
  const first = api?.internalEngine().slideRegistry[api.selectedScrollSnap()]?.[0];
  if (first !== undefined) api?.slideNodes()[first]?.focus({ preventScroll: true });
}

export function moveWithKeys(slides: Slides, event: KeyboardEvent<HTMLElement>) {
  const origin = event.target as Element;
  if (ownsArrowKeys(origin)) return false;

  const { api, selected, snapCount, orientation } = slides;
  const lastSnap = Math.max(0, snapCount - 1);
  const stepFrom = (by: 1 | -1) => (selected + by + snapCount) % snapCount;
  const slideHasFocus = api?.slideNodes().some((slide) => slide.contains(origin)) ?? false;

  const moveTo =
    (snap: number, allowed: boolean): KeyAction<HTMLElement> =>
    () => {
      if (!allowed || snap === selected) return false;
      if (!slideHasFocus) return slides.scrollTo(snap);

      flushSync(() => slides.scrollTo(snap));
      focusTheSelectedSlide(slides);
    };

  const back = moveTo(stepFrom(-1), slides.canScrollPrev);
  const forward = moveTo(stepFrom(1), slides.canScrollNext);
  const ends = { Home: moveTo(0, true), End: moveTo(lastSnap, true) };
  const keys: KeyMap<HTMLElement> =
    orientation === 'vertical'
      ? { ArrowUp: back, ArrowDown: forward, ...ends }
      : { ArrowLeft: back, ArrowRight: forward, ...ends };

  const mirrored = orientation === 'horizontal' && slides.direction === 'rtl';
  return keyHandler(keys, { dir: mirrored ? 'rtl' : 'ltr' })(event);
}
