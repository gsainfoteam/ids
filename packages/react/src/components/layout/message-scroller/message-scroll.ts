import { keyHandler, withModifiers } from '../../../internal/keys';

export type ScrollOnAppend = 'start' | 'end';

export type MessageScrollOptions = {
  stickToBottom: boolean;
  scrollOnAppend: ScrollOnAppend;
  loading: boolean;
  onReachStart?: () => void;
};

export type MessageScrollView = { atEnd: boolean; unseen: number };

type Anchor = { element: Element; offset: number };

export const END_TOLERANCE_PX = 8;
export const START_ZONE_PX = 48;
const SUBPIXEL = 0.5;
const SCROLL_EVENT_ROUNDING = 1;

const topWithin = (element: Element, viewport: HTMLElement) =>
  element.getBoundingClientRect().top - viewport.getBoundingClientRect().top;

const scrolledTopOf = (element: Element, viewport: HTMLElement) =>
  topWithin(element, viewport) + viewport.scrollTop;

const paddingOf = (element: Element, side: 'paddingTop' | 'paddingBottom') =>
  Number.parseFloat(getComputedStyle(element)[side]) || 0;

const endOf = (viewport: HTMLElement) => viewport.scrollHeight - viewport.clientHeight;

const isAtEnd = (viewport: HTMLElement) => endOf(viewport) - viewport.scrollTop <= END_TOLERANCE_PX;

function firstVisible(items: HTMLCollection, viewportTop: number) {
  let low = 0;
  let high = items.length - 1;
  let found: Element | null = null;

  while (low <= high) {
    const middle = (low + high) >> 1;
    const item = items[middle];
    if (item.getBoundingClientRect().bottom > viewportTop + SUBPIXEL) {
      found = item;
      high = middle - 1;
    } else low = middle + 1;
  }

  return found;
}

function lastStillIn(items: Element[], list: Element) {
  for (let index = items.length - 1; index >= 0; index--)
    if (items[index].parentElement === list) return items[index];
  return null;
}

const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function createMessageScroll(
  initial: MessageScrollOptions,
  show: (view: MessageScrollView) => void,
) {
  let current = initial;
  const options = () => current;
  let viewport: HTMLElement | null = null;
  let list: HTMLElement | null = null;
  let observer: ResizeObserver | null = null;

  let following = true;
  let ownScrollTop: number | null = null;
  let lastTop = 0;
  let anchor: Anchor | null = null;
  let reservedFor: Element | null = null;
  let items: Element[] = [];
  let unseen = 0;
  let touchY: number | null = null;
  let reachStartArmed = true;
  let reserveFrame = 0;

  function report() {
    if (!viewport) return;
    const atEnd = isAtEnd(viewport);
    if (atEnd) unseen = 0;
    show({ atEnd, unseen });
  }

  function writeTop(top: number) {
    if (!viewport || Math.abs(viewport.scrollTop - top) <= SUBPIXEL) return;
    viewport.scrollTop = top;
    ownScrollTop = viewport.scrollTop;
    lastTop = ownScrollTop;
  }

  function recordAnchor() {
    if (!viewport || !list) return;
    const viewportTop = viewport.getBoundingClientRect().top;
    const element = firstVisible(list.children, viewportTop);
    anchor = element
      ? { element, offset: element.getBoundingClientRect().top - viewportTop }
      : null;
  }

  function holdAnchor() {
    if (!viewport || !anchor || anchor.element.parentElement !== list) return;
    writeTop(viewport.scrollTop + topWithin(anchor.element, viewport) - anchor.offset);
  }

  function floorForReservation() {
    if (!viewport || !list || reservedFor?.parentElement !== list) return null;
    const listTop = scrolledTopOf(list, viewport);
    const itemTop = scrolledTopOf(reservedFor, viewport) - paddingOf(list, 'paddingTop');
    const below = paddingOf(viewport, 'paddingBottom');
    return Math.ceil(itemTop + viewport.clientHeight - listTop - below);
  }

  function reservationValue() {
    const floor = floorForReservation();
    return floor === null ? '' : `${floor}px`;
  }

  function reserve() {
    if (!list) return;
    const value = reservationValue();
    if (value === '') reservedFor = null;
    if (list.style.minHeight !== value) list.style.minHeight = value;
  }

  function settle() {
    if (!viewport) return;
    if (following) writeTop(endOf(viewport));
    else holdAnchor();
    recordAnchor();
    report();
  }

  function alignToStart(element: Element) {
    if (!viewport || !list) return;
    following = false;
    reservedFor = element;
    reserve();
    writeTop(scrolledTopOf(element, viewport) - paddingOf(list, 'paddingTop'));
    anchor = { element, offset: topWithin(element, viewport) };
  }

  function start() {
    if (!viewport || !list) return;
    following = options().stickToBottom;
    reserve();
    writeTop(endOf(viewport));
    lastTop = viewport.scrollTop;
    recordAnchor();
    report();
  }

  function contentChanged() {
    if (!viewport || !list) return;
    const previous = items;
    items = Array.from(list.children);

    const kept = lastStillIn(previous, list);
    if (!kept) {
      if (items.length > 0) start();
      return;
    }

    if (previous[0] !== items[0]) reachStartArmed = true;

    const appended = items.slice(items.indexOf(kept) + 1);
    if (appended.length > 0) {
      if (options().scrollOnAppend === 'start') alignToStart(appended[0]);
      else if (!following) unseen += appended.length;
    }

    reserve();
    settle();
  }

  function resized() {
    if (list && reservedFor && list.style.minHeight !== reservationValue()) {
      cancelAnimationFrame(reserveFrame);
      reserveFrame = requestAnimationFrame(() => {
        reserve();
        settle();
      });
    }
    settle();
  }

  function observe(element: Element | null) {
    if (element) observer?.observe(element);
  }

  function release() {
    following = false;
  }

  const releaseAndScroll = () => {
    release();
    return false;
  };

  const keyDown = keyHandler<HTMLElement>(
    withModifiers({ ArrowUp: releaseAndScroll, PageUp: releaseAndScroll, Home: releaseAndScroll }),
  );

  function selectionChanged() {
    const selection = document.getSelection();
    if (!viewport || !selection || selection.isCollapsed) return;
    if (viewport.contains(selection.anchorNode) || viewport.contains(selection.focusNode))
      release();
  }

  return {
    setOptions(next: MessageScrollOptions) {
      if (next.stickToBottom !== current.stickToBottom)
        following = next.stickToBottom && !!viewport && isAtEnd(viewport);
      current = next;
    },

    setViewport(element: HTMLElement | null) {
      if (viewport) observer?.unobserve(viewport);
      viewport = element;
      observe(element);
    },

    setList(element: HTMLElement | null) {
      if (list) observer?.unobserve(list);
      list = element;
      items = [];
      observe(element);
    },

    connect() {
      observer = new ResizeObserver(resized);
      observe(viewport);
      observe(list);
      document.addEventListener('selectionchange', selectionChanged);
      contentChanged();

      return () => {
        cancelAnimationFrame(reserveFrame);
        observer?.disconnect();
        observer = null;
        document.removeEventListener('selectionchange', selectionChanged);
      };
    },

    contentChanged,

    scrolled() {
      if (!viewport) return;
      const top = viewport.scrollTop;
      const ours = ownScrollTop !== null && Math.abs(top - ownScrollTop) <= SCROLL_EVENT_ROUNDING;
      ownScrollTop = null;
      const previousTop = lastTop;
      lastTop = top;

      if (!ours) {
        const { stickToBottom, loading, onReachStart } = options();
        const movedUp = top < previousTop - SUBPIXEL;
        const atEnd = isAtEnd(viewport);
        if (movedUp && !atEnd) following = false;
        else if (!movedUp && atEnd && stickToBottom) following = true;

        if (
          onReachStart &&
          !loading &&
          reachStartArmed &&
          top <= START_ZONE_PX &&
          top < previousTop
        ) {
          reachStartArmed = false;
          onReachStart();
        }
      }
      if (top > START_ZONE_PX) reachStartArmed = true;

      recordAnchor();
      report();
    },

    wheeled(deltaY: number) {
      if (deltaY < 0) release();
    },

    touchStarted(y: number) {
      touchY = y;
    },

    touchMoved(y: number) {
      if (touchY !== null && y > touchY) release();
      touchY = y;
    },

    keyDown,

    scrollToBottom() {
      if (!viewport) return;
      following = options().stickToBottom;
      unseen = 0;
      viewport.scrollTo({
        top: endOf(viewport),
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
      report();
    },
  };
}

export type MessageScroll = ReturnType<typeof createMessageScroll>;
