'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react';

import { isEqual } from 'es-toolkit';

import { dismissToast, removeToast, type ToastId, type ToastRecord } from './toast-store';
import { usePresence } from '../../../internal/overlay';

import type { ToastPosition } from './use-toaster';

export type SwipeAxis = 'x' | 'y';

export type SwipeDirections = { x: -1 | 0 | 1; y: -1 | 1 };

export const SWIPE_DISTANCE_THAT_DISMISSES = 45;
export const SWIPE_SPEED_THAT_DISMISSES = 0.11;
const MOVEMENT_THAT_PICKS_AN_AXIS = 2;

const POSITION_BEFORE_MEASURING: ToastPosition = {
  index: 0,
  offset: 0,
  height: undefined,
  front: true,
  visible: true,
  stackOrder: 1,
};

type Drag = {
  pointerId: number;
  x: number;
  y: number;
  startedAt: number;
  axis: SwipeAxis | null;
  amount: number;
};

function tryCapturePointer(node: Element, pointerId: number) {
  try {
    node.setPointerCapture(pointerId);
  } catch {
    return;
  }
}

function startsOnAControl(event: PointerEvent<HTMLElement>) {
  return (event.target as Element).closest('button, a[href], input, select, textarea') !== null;
}

function towardTheEdge(axis: SwipeAxis, amount: number, directions: SwipeDirections) {
  if (amount === 0) return false;

  const allowed = directions[axis];
  return allowed === 0 || Math.sign(amount) === allowed;
}

function resisted(delta: number) {
  return delta / (1.5 + Math.abs(delta) / 20);
}

const swipeVariable = (axis: SwipeAxis) => (axis === 'x' ? '--swipe-x' : '--swipe-y');

export type UseToastOptions = {
  record: ToastRecord;
  position: ToastPosition | undefined;
  paused: boolean;
  directions: SwipeDirections;
  register: (id: ToastId, node: HTMLElement | null) => void;
  releaseFocus: (options: { stayInRegion: boolean }) => void;
};

export function useToast({
  record,
  position,
  paused,
  directions,
  register,
  releaseFocus,
}: UseToastOptions) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const { id } = record;

  const ref = useCallback(
    (element: HTMLDivElement | null) => {
      setNode(element);
      register(id, element);
    },
    [id, register],
  );

  const [lastPosition, setLastPosition] = useState(position ?? POSITION_BEFORE_MEASURING);
  if (position && !isEqual(position, lastPosition)) setLastPosition(position);

  const place = position ?? lastPosition;

  const { mounted, ending } = usePresence(!record.dismissed, {
    elements: () => [node],
    onExitComplete: () => removeToast(id),
  });

  useLayoutEffect(() => {
    if (ending && node?.contains(node.ownerDocument.activeElement))
      releaseFocus({ stayInRegion: true });
  }, [ending, node, releaseFocus]);

  const timed =
    !record.dismissed &&
    !record.loading &&
    Number.isFinite(record.duration) &&
    place.visible &&
    !paused;

  const remaining = useRef(record.duration);
  const timedVersion = useRef(record.version);

  useEffect(() => {
    if (timedVersion.current !== record.version) {
      timedVersion.current = record.version;
      remaining.current = record.duration;
    }

    if (!timed) return;

    const startedAt = performance.now();
    const timer = setTimeout(() => dismissToast(id, 'auto'), Math.max(0, remaining.current));

    return () => {
      clearTimeout(timer);
      remaining.current -= performance.now() - startedAt;
    };
  }, [timed, id, record.version, record.duration]);

  const drag = useRef<Drag | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [lastSwipeOut, setLastSwipeOut] = useState<SwipeAxis | null>(null);

  const swipedOut = record.dismissed ? lastSwipeOut : null;

  const settle = (axis: SwipeAxis, value: string) => {
    node?.style.setProperty(swipeVariable(axis), value);
  };

  useLayoutEffect(() => {
    if (record.dismissed || !node) return;

    node.style.removeProperty(swipeVariable('x'));
    node.style.removeProperty(swipeVariable('y'));
  }, [record.dismissed, node]);

  const swipeHandlers = {
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || record.dismissed || startsOnAControl(event)) return;

      tryCapturePointer(event.currentTarget, event.pointerId);
      drag.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        startedAt: event.timeStamp,
        axis: null,
        amount: 0,
      };
    },
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
      const current = drag.current;
      if (!current || current.pointerId !== event.pointerId) return;

      const dx = event.clientX - current.x;
      const dy = event.clientY - current.y;

      if (!current.axis) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < MOVEMENT_THAT_PICKS_AN_AXIS) return;
        current.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        setSwiping(true);
      }

      const delta = current.axis === 'x' ? dx : dy;
      current.amount = towardTheEdge(current.axis, delta, directions) ? delta : resisted(delta);
      settle(current.axis, `${current.amount}px`);
    },
    onPointerUp: (event: PointerEvent<HTMLDivElement>) => {
      const current = drag.current;
      drag.current = null;
      if (!current?.axis || current.pointerId !== event.pointerId) return;

      setSwiping(false);
      const speed = Math.abs(current.amount) / Math.max(1, event.timeStamp - current.startedAt);
      const farOrFast =
        Math.abs(current.amount) >= SWIPE_DISTANCE_THAT_DISMISSES ||
        speed > SWIPE_SPEED_THAT_DISMISSES;

      if (towardTheEdge(current.axis, current.amount, directions) && farOrFast) {
        settle(current.axis, `calc(${current.amount}px + ${Math.sign(current.amount) * 100}%)`);
        setLastSwipeOut(current.axis);
        dismissToast(id, 'user');
      } else settle(current.axis, '0px');
    },
    onPointerCancel: () => {
      const current = drag.current;
      drag.current = null;
      if (!current?.axis) return;

      setSwiping(false);
      settle(current.axis, '0px');
    },
  };

  return { ref, place, mounted, ending, swiping, swipedOut, swipeHandlers };
}
