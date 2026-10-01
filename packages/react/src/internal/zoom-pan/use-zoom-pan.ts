'use client';

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

import { createZoomPan, type ZoomPan, type ZoomPanSettings } from './engine';
import { DEFAULT_MAX_SCALE, MIN_SCALE, type Point } from './math';
import { useControllableState } from '../../hooks/use-controllable-state';

export type UseZoomPanOptions = {
  element: HTMLElement | null;
  content: HTMLElement | null;
  scale?: number;
  defaultScale?: number;
  onScaleChange?: (scale: number) => void;
  maxScale?: number;
  disabled?: boolean;
  onSwipe?: (presence: number, dragging: boolean) => void;
  onSwipeClose?: () => void;
  onPinchStart?: () => void;
};

export type ZoomPanState = {
  scale: number;
  zoomed: boolean;
  canZoomIn: boolean;
  canZoomOut: boolean;
  isZoomed: () => boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  zoomTo: (scale: number, around?: Point) => void;
  onKeyDown: (event: ReactKeyboardEvent<Element>) => boolean;
};

export function useZoomPan(options: UseZoomPanOptions): ZoomPanState {
  const { element, content, disabled = false } = options;
  const maxScale = Math.max(MIN_SCALE, options.maxScale ?? DEFAULT_MAX_SCALE);

  const [scale, setScale] = useControllableState({
    value: options.scale,
    defaultValue: options.defaultScale ?? MIN_SCALE,
    onValueChange: options.onScaleChange,
  });
  const [commits, setCommits] = useState(0);
  const engine = useRef<ZoomPan | null>(null);

  const settings: ZoomPanSettings = {
    maxScale,
    onCommit: (next) => {
      setScale(next);
      setCommits((count) => count + 1);
    },
    onSwipe: options.onSwipe,
    onSwipeClose: options.onSwipeClose,
    onPinchStart: options.onPinchStart,
  };
  const latest = useRef({ settings, scale });
  useLayoutEffect(() => {
    latest.current = { settings, scale };
  });

  useLayoutEffect(() => {
    if (!element || !content || disabled) return;

    const created = createZoomPan(element, content, {
      scale: latest.current.scale,
      read: () => latest.current.settings,
    });
    engine.current = created;

    return () => {
      created.dispose();
      engine.current = null;
    };
  }, [element, content, disabled]);

  useLayoutEffect(() => {
    engine.current?.follow(scale);
  }, [scale, commits, maxScale, element, content, disabled]);

  const isZoomed = useCallback(() => engine.current?.isZoomed() ?? false, []);

  return {
    scale,
    zoomed: scale > MIN_SCALE,
    canZoomIn: scale < maxScale,
    canZoomOut: scale > MIN_SCALE,
    isZoomed,
    zoomIn: () => engine.current?.zoomIn(),
    zoomOut: () => engine.current?.zoomOut(),
    reset: () => engine.current?.reset(),
    zoomTo: (next, around) => engine.current?.zoomTo(next, around),
    onKeyDown: (event) => engine.current?.onKeyDown(event) ?? false,
  };
}
