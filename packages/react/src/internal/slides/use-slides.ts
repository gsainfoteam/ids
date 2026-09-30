'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type RefCallback,
} from 'react';

import useEmblaCarousel from 'embla-carousel-react';
import { clamp, isEqual, noop } from 'es-toolkit';

import {
  estimateSlides,
  viewableCount,
  type SlidesAlign,
  type SlidesOrientation,
  type SlidesPerScroll,
} from './layout';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useReducedMotion } from '../../hooks/use-reduced-motion';
import { useTranslate } from '../translate';

import type { EmblaCarouselType, EmblaEventType, EmblaPluginType } from 'embla-carousel';

export type SlidesDirection = 'ltr' | 'rtl';

export type SlidesDragEvent = MouseEvent | TouchEvent;

export type SlidesWatchDrag =
  | boolean
  | ((api: EmblaCarouselType, event: SlidesDragEvent) => boolean);

export type SlidesOptions = {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  slideCount: number;
  orientation?: SlidesOrientation;
  direction?: SlidesDirection;
  align?: SlidesAlign;
  loop?: boolean;
  dragFree?: boolean;
  slidesPerView?: number;
  slidesToScroll?: SlidesPerScroll;
  watchDrag?: SlidesWatchDrag;
  plugins?: EmblaPluginType[];
};

export type SlideState = { index: number; selected: boolean; inView: boolean };

export type SlideProps = {
  role: 'group';
  'aria-roledescription': string;
  'aria-label': string;
  inert: boolean;
  tabIndex: -1;
  'data-slide': '';
  'data-selected': '' | undefined;
  'data-in-view': '' | undefined;
};

export type Slides = {
  api: EmblaCarouselType | undefined;
  selected: number;
  snapCount: number;
  slideCount: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  dragging: boolean;
  orientation: SlidesOrientation;
  direction: SlidesDirection;
  reducedMotion: boolean;
  scrollTo: (snap: number, jump?: boolean) => void;
  scrollPrev: (jump?: boolean) => void;
  scrollNext: (jump?: boolean) => void;
  cancelDrag: () => void;
  firstSlideOf: (snap: number) => number;
  viewportRef: RefCallback<HTMLElement>;
  trackProps: { 'data-slides-track': ''; style: CSSProperties };
  slideState: (index: number) => SlideState;
  slideProps: (index: number) => SlideProps;
};

type EngineState = {
  snapCount: number;
  slideCount: number;
  groups: number[][];
  visible: number[];
  canScrollPrev: boolean;
  canScrollNext: boolean;
};

type Measured = { direction: SlidesDirection; gap: number };

const TRACK = '[data-slides-track]';
const SETTLES_IN_ABOUT_MOTION_NORMAL = 14;
const IN_VIEW_THRESHOLDS = [0, 0.5, 1];
const VISIBLE_SLIVER_PX = 1;
const UNMEASURED: Measured = { direction: 'ltr', gap: 0 };
const ENGINE_EVENTS: EmblaEventType[] = [
  'select',
  'settle',
  'slidesInView',
  'reInit',
  'resize',
  'slidesChanged',
];

const isMultiTouch = (event: SlidesDragEvent) => 'touches' in event && event.touches.length > 1;

const nothingBeforeHydration = () => null;

const lastSnapOf = (api: EmblaCarouselType) => Math.max(0, api.scrollSnapList().length - 1);

const wholeSlides = (perScroll: SlidesPerScroll) =>
  perScroll === 'auto' ? perScroll : Math.max(1, Math.floor(perScroll) || 1);

function isRtl(element: Element) {
  return element.ownerDocument.defaultView?.getComputedStyle(element).direction === 'rtl';
}

function overlapAlong(axis: 'x' | 'y', slide: DOMRect, view: DOMRect) {
  return axis === 'x'
    ? Math.min(slide.right, view.right) - Math.max(slide.left, view.left)
    : Math.min(slide.bottom, view.bottom) - Math.max(slide.top, view.top);
}

function visibleSlides(api: EmblaCarouselType) {
  const { axis } = api.internalEngine().options;
  const view = api.rootNode().getBoundingClientRect();
  return api
    .slideNodes()
    .flatMap((slide, index) =>
      overlapAlong(axis, slide.getBoundingClientRect(), view) > VISIBLE_SLIVER_PX ? [index] : [],
    );
}

function cutOffByTheViewport(api: EmblaCarouselType, event: FocusEvent) {
  const slide = event.currentTarget;
  if (!(slide instanceof Element)) return false;

  const { axis } = api.internalEngine().options;
  const rect = slide.getBoundingClientRect();
  const size = axis === 'x' ? rect.width : rect.height;
  return (
    overlapAlong(axis, rect, api.rootNode().getBoundingClientRect()) < size - VISIBLE_SLIVER_PX
  );
}

function readEngine(api: EmblaCarouselType): EngineState {
  return {
    snapCount: api.scrollSnapList().length,
    slideCount: api.slideNodes().length,
    groups: api.internalEngine().slideRegistry,
    visible: visibleSlides(api),
    canScrollPrev: api.canScrollPrev(),
    canScrollNext: api.canScrollNext(),
  };
}

function createEngineStore(api: EmblaCarouselType | undefined) {
  let snapshot: EngineState | null = null;

  const refresh = () => {
    if (!api) return false;
    const next = readEngine(api);
    if (isEqual(snapshot, next)) return false;
    snapshot = next;
    return true;
  };

  return {
    subscribe: (notify: () => void) => {
      if (!api) return noop;
      const update = () => {
        if (refresh()) notify();
      };
      for (const event of ENGINE_EVENTS) api.on(event, update);
      return () => {
        for (const event of ENGINE_EVENTS) api.off(event, update);
      };
    },
    getSnapshot: () => {
      if (snapshot === null) refresh();
      return snapshot;
    },
  };
}

function measure(viewport: HTMLElement, orientation: SlidesOrientation): Measured {
  const view = viewport.ownerDocument.defaultView;
  const track = viewport.querySelector(TRACK);
  const direction = isRtl(viewport) ? 'rtl' : 'ltr';
  if (!view || !track) return { direction, gap: 0 };

  const style = view.getComputedStyle(track);
  const gap = parseFloat(orientation === 'vertical' ? style.rowGap : style.columnGap) || 0;
  return { direction, gap };
}

export function useSlides({
  value,
  defaultValue,
  onValueChange,
  slideCount: renderedSlideCount,
  orientation = 'horizontal',
  direction: directionOption,
  align = 'start',
  loop = false,
  dragFree = false,
  slidesPerView = 1,
  slidesToScroll = 1,
  watchDrag = true,
  plugins,
}: SlidesOptions): Slides {
  const t = useTranslate();
  const reducedMotion = useReducedMotion();
  const perView = viewableCount(slidesPerView);
  const perScroll = wholeSlides(slidesToScroll);

  const [selected, setSelected] = useControllableState({
    value,
    defaultValue: defaultValue ?? 0,
    onValueChange,
  });
  const [startIndex] = useState(selected);
  const [engineSnap, setEngineSnap] = useState(startIndex);
  const [measured, setMeasured] = useState(UNMEASURED);
  const [dragging, setDragging] = useState(false);
  const direction = directionOption ?? measured.direction;

  const latest = useRef({ selected, setSelected, watchDrag });
  const jumpOnNextMove = useRef<boolean | undefined>(undefined);

  useLayoutEffect(() => {
    latest.current = { selected, setSelected, watchDrag };
  });

  const allowsDrag = useCallback((api: EmblaCarouselType, event: SlidesDragEvent) => {
    if (isMultiTouch(event)) return false;
    const policy = latest.current.watchDrag;
    return typeof policy === 'function' ? policy(api, event) : policy;
  }, []);

  const [emblaRef, api] = useEmblaCarousel(
    {
      axis: orientation === 'vertical' ? 'y' : 'x',
      direction,
      container: TRACK,
      align,
      loop,
      dragFree,
      slidesToScroll: perScroll,
      startIndex,
      containScroll: 'trimSnaps',
      duration: SETTLES_IN_ABOUT_MOTION_NORMAL,
      inViewThreshold: IN_VIEW_THRESHOLDS,
      watchDrag: allowsDrag,
      watchFocus: cutOffByTheViewport,
    },
    plugins,
  );

  const remeasure = useCallback(
    (viewport: HTMLElement) => {
      const next = measure(viewport, orientation);
      setMeasured((previous) => (isEqual(previous, next) ? previous : next));
    },
    [orientation],
  );

  const viewportRef = useCallback(
    (node: HTMLElement | null) => {
      if (node) remeasure(node);
      emblaRef(node);
    },
    [emblaRef, remeasure],
  );

  const cancelDrag = useCallback(() => {
    if (api?.internalEngine().dragHandler.pointerDown()) api.reInit();
  }, [api]);

  const store = useMemo(() => createEngineStore(api), [api]);
  const engine = useSyncExternalStore(store.subscribe, store.getSnapshot, nothingBeforeHydration);

  useEffect(() => {
    if (!api) return;

    const select = () => {
      const snap = api.selectedScrollSnap();
      latest.current.setSelected(snap);
      setEngineSnap(snap);
    };
    const realign = () => {
      setDragging(api.internalEngine().dragHandler.pointerDown());
      const target = clamp(latest.current.selected, 0, lastSnapOf(api));
      if (api.selectedScrollSnap() !== target) api.scrollTo(target, true);
    };
    const press = () => setDragging(true);
    const release = () => setDragging(false);
    const resize = () => remeasure(api.rootNode());

    api
      .on('select', select)
      .on('reInit', realign)
      .on('pointerDown', press)
      .on('pointerUp', release)
      .on('resize', resize);
    return () => {
      api
        .off('select', select)
        .off('reInit', realign)
        .off('pointerDown', press)
        .off('pointerUp', release)
        .off('resize', resize);
    };
  }, [api, remeasure]);

  useEffect(() => {
    const viewport = api?.rootNode();
    if (!viewport) return;

    const releaseForASecondFinger = (event: TouchEvent) => {
      if (isMultiTouch(event)) cancelDrag();
    };
    viewport.addEventListener('touchstart', releaseForASecondFinger, { passive: true });
    return () => viewport.removeEventListener('touchstart', releaseForASecondFinger);
  }, [api, cancelDrag]);

  useLayoutEffect(() => {
    if (!api) return;
    const jump = jumpOnNextMove.current ?? reducedMotion;
    jumpOnNextMove.current = undefined;

    const target = clamp(selected, 0, lastSnapOf(api));
    if (api.selectedScrollSnap() !== target) api.scrollTo(target, jump);
  }, [api, selected, engineSnap, reducedMotion]);

  const estimate = estimateSlides({
    slideCount: renderedSlideCount,
    perView,
    perScroll,
    loop,
    align,
  });
  const snapCount = engine?.snapCount ?? estimate.snapCount;
  const slideCount = engine?.slideCount ?? renderedSlideCount;
  const lastSnap = Math.max(0, snapCount - 1);
  const current = clamp(selected, 0, lastSnap);
  const canScrollPrev = engine?.canScrollPrev ?? (snapCount > 1 && (loop || current > 0));
  const canScrollNext = engine?.canScrollNext ?? (snapCount > 1 && (loop || current < lastSnap));

  const groupOf = (snap: number) => engine?.groups[snap] ?? estimate.slidesOf(snap);
  const selectedSlides = new Set(groupOf(current));
  const shownSlides = new Set(engine ? engine.visible : estimate.inViewOf(current));
  const stepFrom = (by: 1 | -1) => (current + by + snapCount) % snapCount;

  const scrollTo = (snap: number, jump?: boolean) => {
    jumpOnNextMove.current = jump;
    setSelected(clamp(snap, 0, lastSnap));
  };
  const scrollPrev = (jump?: boolean) => {
    if (canScrollPrev) scrollTo(stepFrom(-1), jump);
  };
  const scrollNext = (jump?: boolean) => {
    if (canScrollNext) scrollTo(stepFrom(1), jump);
  };
  const firstSlideOf = (snap: number) => groupOf(snap)[0] ?? 0;

  const slideState = (index: number): SlideState => {
    const inSelection = selectedSlides.has(index);
    return { index, selected: inSelection, inView: inSelection || shownSlides.has(index) };
  };

  const slideProps = (index: number): SlideProps => {
    const state = slideState(index);
    return {
      role: 'group',
      'aria-roledescription': t('slides.roleDescription'),
      'aria-label': t('slides.slide', { index: index + 1, count: slideCount }),
      inert: !state.inView,
      tabIndex: -1,
      'data-slide': '',
      'data-selected': state.selected ? '' : undefined,
      'data-in-view': state.inView ? '' : undefined,
    };
  };

  const startOffset = estimate.offsetOf(clamp(startIndex, 0, Math.max(0, estimate.snapCount - 1)));
  const trackStyle = {
    '--slides-per-view': perView,
    ...(startOffset !== 0 && { '--slides-offset': startOffset }),
    ...(measured.gap !== 0 && { '--slides-gap': `${measured.gap}px` }),
  } as CSSProperties;

  return {
    api,
    selected: current,
    snapCount,
    slideCount,
    canScrollPrev,
    canScrollNext,
    dragging,
    orientation,
    direction,
    reducedMotion,
    scrollTo,
    scrollPrev,
    scrollNext,
    cancelDrag,
    firstSlideOf,
    viewportRef,
    trackProps: { 'data-slides-track': '', style: trackStyle },
    slideState,
    slideProps,
  };
}
