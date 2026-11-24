'use client';

import {
  isValidElement,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { ImageViewerCaption } from './caption';
import { ImageViewerContext, type ImageViewerContextValue } from '../context';
import { enterFrom, exitTo } from '../lib/flip';
import { imageStyle } from '../style';
import { ImageViewerToolbar } from './toolbar';
import { ImageViewerFallback } from './viewer-fallback';
import { ImageViewerSlide } from './viewer-slide';
import { keyHandler } from '../../../../internal/lib/keys';
import {
  focusReturnTarget,
  ModalLayer,
  OverlayItemContext,
  returnFocusTo,
  useInternalLayer,
  useInternalPresence,
} from '../../../../internal/overlay';
import { SlidesAnnouncer, useInternalSlides } from '../../../../internal/slides';
import { useInternalTranslate } from '../../../../internal/translate';
import { useInternalZoomPan } from '../../../../internal/zoom-pan';
import { elementTypeOf, flattenFragments } from '../../../../utils';

import type { ImageViewerLook, ImageViewerSource } from './viewer';

type Surface = 'content' | 'backdrop' | 'box';

type Surfaces = Record<Surface, HTMLElement | null>;

type Report = (surface: Surface, node: HTMLElement | null) => void;

export type ImageViewerLayerProps = { source: ImageViewerSource; look: ImageViewerLook };

const FITTED = 1;
const A_TAP_NOT_A_DRAG = 10;
const PRESENCE = '--image-viewer-presence';
const SWIPING = 'data-swiping';
const WHAT_IS_NOT_EMPTY = '[data-image-viewer-box], [data-image-viewer-notice]';
const THE_STAGE = '[data-image-viewer-stage]';

const DEFAULT_PARTS = (
  <>
    <ImageViewerCaption />
    <ImageViewerToolbar />
  </>
);

const isFallback = (node: ReactNode): node is ReactElement =>
  isValidElement(node) && elementTypeOf(node) === ImageViewerFallback;

function isEmptyGround(target: Element, viewer: Element) {
  if (target === viewer) return true;
  return target.closest(THE_STAGE) !== null && target.closest(WHAT_IS_NOT_EMPTY) === null;
}

function isNear(index: number, current: number, count: number, loop: boolean) {
  const apart = Math.abs(index - current);
  return apart <= 1 || (loop && count - apart <= 1);
}

function ViewerSession({
  source,
  look,
  ending,
  report,
}: ImageViewerLayerProps & { ending: boolean; report: Report }) {
  const t = useInternalTranslate();
  const { open, items } = source;
  const count = items.length;
  const styles = imageStyle();
  const parts = flattenFragments(look.children ?? DEFAULT_PARTS);
  const fallback = parts.find(isFallback);
  const chrome = parts.filter((node) => !isFallback(node));

  const [content, setContent] = useState<HTMLElement | null>(null);
  const [backdrop, setBackdrop] = useState<HTMLElement | null>(null);
  const [area, setArea] = useState<HTMLElement | null>(null);
  const [box, setBox] = useState<HTMLElement | null>(null);
  const [stacked, setStacked] = useState(false);
  const boxRef = useRef<HTMLElement | null>(null);
  const pressedAt = useRef<{ x: number; y: number } | null>(null);

  const attachContent = useCallback(
    (node: HTMLElement | null) => {
      report('content', node);
      setContent(node);
    },
    [report],
  );
  const attachBackdrop = useCallback(
    (node: HTMLElement | null) => {
      report('backdrop', node);
      setBackdrop(node);
    },
    [report],
  );
  const attachBox = useCallback(
    (node: HTMLElement | null) => {
      boxRef.current = node;
      report('box', node);
      setBox(node);
    },
    [report],
  );

  const close = () => source.setOpen(false);

  const slides = useInternalSlides({
    slideCount: count,
    value: source.value,
    onValueChange: (index) => {
      source.setValue(index);
      source.setZoom(FITTED);
    },
    loop: source.loop,
    watchDrag: () => !zoomPan.isZoomed(),
  });

  const surfaces = [content, backdrop];
  const { viewportRef } = slides;
  const attachViewport = useCallback(
    (node: HTMLElement | null) => viewportRef(node),
    [viewportRef],
  );

  const paintSwipe = (presence: number, dragging: boolean) => {
    for (const surface of surfaces) {
      surface?.style.setProperty(PRESENCE, String(presence));
      surface?.toggleAttribute(SWIPING, dragging);
    }
    if (dragging) slides.cancelDrag();
  };

  const zoomPan = useInternalZoomPan({
    element: area,
    content: box,
    scale: source.zoom,
    onScaleChange: source.setZoom,
    onSwipe: paintSwipe,
    onSwipeClose: () => {
      for (const surface of surfaces) surface?.removeAttribute(SWIPING);
      close();
    },
    onPinchStart: () => slides.cancelDrag(),
  });

  const layer = useInternalLayer(open, {
    kind: 'modal',
    element: () => content,
    anchor: () => source.opener,
    onDismiss: (reason) => {
      if (reason === 'escape-key') close();
    },
    onPositionChange: ({ modalsBelow }) => setStacked(modalsBelow > 0),
  });

  useLayoutEffect(() => {
    if (open && content) content.focus({ preventScroll: true });
  }, [open, content]);

  const entered = useRef(false);
  useLayoutEffect(() => {
    if (entered.current || !open) return;
    entered.current = true;
    if (boxRef.current) enterFrom(boxRef.current, source.thumbnailOf(slides.selected));
  });

  const wasOpen = useRef(open);
  useLayoutEffect(() => {
    const closing = wasOpen.current && !open;
    wasOpen.current = open;
    if (!closing) return;

    if (boxRef.current) exitTo(boxRef.current, source.thumbnailOf(slides.selected));

    const focused = content?.ownerDocument.activeElement;
    const focusWasInside =
      !focused || focused === content?.ownerDocument.body || !!content?.contains(focused);
    if (focusWasInside) returnFocusTo(focusReturnTarget(layer));
  });

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (zoomPan.onKeyDown(event)) return;

    keyHandler<HTMLDivElement>(
      {
        ArrowLeft: () => slides.scrollPrev(),
        ArrowRight: () => slides.scrollNext(),
        Home: () => slides.scrollTo(0),
        End: () => slides.scrollTo(count - 1),
      },
      { dir: slides.direction },
    )(event);
  };

  const notePress = (event: PointerEvent<HTMLElement>) => {
    pressedAt.current = { x: event.clientX, y: event.clientY };
  };

  const closeOnAnEmptyPress = (event: MouseEvent<HTMLElement>) => {
    const from = pressedAt.current;
    pressedAt.current = null;
    if (!from) return;

    const travel = Math.hypot(event.clientX - from.x, event.clientY - from.y);
    const empty = isEmptyGround(event.target as Element, event.currentTarget);
    if (travel <= A_TAP_NOT_A_DRAG && empty) close();
  };

  const current = slides.selected;
  const context: ImageViewerContextValue = {
    items,
    index: current,
    count,
    item: items[current],
    canPrev: slides.canScrollPrev,
    canNext: slides.canScrollNext,
    prev: () => slides.scrollPrev(),
    next: () => slides.scrollNext(),
    goTo: (index) => slides.scrollTo(index),
    canZoomIn: box !== null && zoomPan.canZoomIn,
    canZoomOut: box !== null && zoomPan.canZoomOut,
    zoomIn: zoomPan.zoomIn,
    zoomOut: zoomPan.zoomOut,
    zoom: zoomPan.scale,
    canResetZoom: box !== null && zoomPan.canZoomOut,
    resetZoom: zoomPan.reset,
    close,
    styles,
  };

  return (
    <ModalLayer
      open={open}
      layer={layer}
      element={content}
      contentRef={attachContent}
      backdrop={{
        ref: attachBackdrop,
        'data-image-viewer-backdrop': '',
        'data-stacked': stacked ? '' : undefined,
        'data-ending-style': ending ? '' : undefined,
        className: styles.backdrop(),
      }}
      onBackdropClick={close}
    >
      <div
        popover="manual"
        role="dialog"
        aria-modal="true"
        aria-label={look['aria-label'] ?? t('image.viewer')}
        tabIndex={-1}
        data-image-viewer=""
        data-open={open ? '' : undefined}
        data-zoomed={zoomPan.zoomed ? '' : undefined}
        data-ending-style={ending ? '' : undefined}
        className={styles.viewer({ className: look.className })}
        style={look.style}
        onKeyDown={onKeyDown}
        onPointerDown={notePress}
        onClick={closeOnAnEmptyPress}
      >
        <section
          ref={attachViewport}
          aria-roledescription={t('carousel.roleDescription')}
          aria-label={t('image.photos')}
          data-image-viewer-stage=""
          className={styles.stage()}
        >
          <div {...slides.trackProps} className={styles.track()}>
            {items.map((item, index) => (
              <ImageViewerSlide
                key={item.key}
                item={item}
                slide={slides.slideProps(index)}
                near={isNear(index, current, count, source.loop)}
                current={index === current}
                attachArea={setArea}
                attachBox={attachBox}
                styles={styles}
                fallback={fallback}
              />
            ))}
          </div>
        </section>
        <OverlayItemContext value={null}>
          <ImageViewerContext value={context}>{chrome}</ImageViewerContext>
        </OverlayItemContext>
        <SlidesAnnouncer slides={slides} className={styles.announcer()} />
      </div>
    </ModalLayer>
  );
}

export function ImageViewerLayer({ source, look }: ImageViewerLayerProps) {
  const [session, setSession] = useState(0);
  const [openedAs, setOpenedAs] = useState(source.open);
  const surfaces = useRef<Surfaces>({ content: null, backdrop: null, box: null });

  if (openedAs !== source.open) {
    setOpenedAs(source.open);
    if (source.open) setSession((count) => count + 1);
  }

  const presence = useInternalPresence(source.open, {
    elements: () => [surfaces.current.content, surfaces.current.backdrop, surfaces.current.box],
    onExitComplete: () => source.onExitComplete?.(),
  });

  const report = useCallback<Report>((surface, node) => {
    surfaces.current[surface] = node;
  }, []);

  if (!presence.mounted) return null;
  return (
    <ViewerSession
      key={session}
      source={source}
      look={look}
      ending={presence.ending}
      report={report}
    />
  );
}
