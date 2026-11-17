'use client';

import {
  useInsertionEffect,
  useLayoutEffect,
  useState,
  type TouchEvent,
  type WheelEvent,
} from 'react';

import {
  createMessageScroll,
  type MessageScrollOptions,
  type MessageScrollView,
} from './message-scroll';

const sameView = (a: MessageScrollView, b: MessageScrollView) =>
  a.atEnd === b.atEnd && a.unseen === b.unseen;

export function useMessageScroller(options: MessageScrollOptions) {
  const [view, setView] = useState<MessageScrollView>({ atEnd: true, unseen: 0 });
  const [scroll] = useState(() =>
    createMessageScroll(options, (next) =>
      setView((current) => (sameView(current, next) ? current : next)),
    ),
  );

  useInsertionEffect(() => {
    scroll.setOptions(options);
  });

  useLayoutEffect(() => scroll.connect(), [scroll]);

  const [viewportProps] = useState(() => ({
    ref: scroll.setViewport,
    onScroll: scroll.scrolled,
    onWheel: (event: WheelEvent<HTMLElement>) => scroll.wheeled(event.deltaY),
    onTouchStart: (event: TouchEvent<HTMLElement>) => scroll.touchStarted(event.touches[0].clientY),
    onTouchMove: (event: TouchEvent<HTMLElement>) => scroll.touchMoved(event.touches[0].clientY),
    onKeyDown: scroll.keyDown,
  }));

  return { scroll, viewportProps, ...view };
}
