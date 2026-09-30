'use client';

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { CarouselContent, slidesOf } from './content';
import { CarouselContext, type CarouselContextValue } from './context';
import { CarouselIndicator } from './indicator';
import { CarouselIndicators } from './indicators';
import { CarouselNext } from './next';
import { CarouselPause } from './pause';
import { CarouselPrev } from './prev';
import { carouselStyle } from './style';
import {
  useCarouselMotion,
  useCarouselPlugins,
  type CarouselAutoplay,
  type CarouselAutoScroll,
} from './use-carousel-motion';
import {
  moveWithKeys,
  SlidesAnnouncer,
  useSlides,
  type SlidesAlign,
  type SlidesDragEvent,
  type SlidesOrientation,
  type SlidesPerScroll,
} from '../../../internal/slides';
import { resolveState, type StateValue } from '../../../internal/state-props';
import { useTranslate } from '../../../internal/translate';
import {
  containsElementOfType,
  elementTypeOf,
  flattenFragments,
  mergeEventHandlers,
  mergeRefs,
} from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

import type { IdsSize } from '../../../tokens/types';

export type CarouselState = {
  value: number;
  orientation: SlidesOrientation;
  playing: boolean;
  dragging: boolean;
};

type CarouselOwnProps = {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  orientation?: SlidesOrientation;
  slidesPerView?: number;
  slidesToScroll?: SlidesPerScroll;
  align?: SlidesAlign;
  loop?: boolean;
  dragFree?: boolean;
  size?: IdsSize;
  autoplay?: CarouselAutoplay;
  autoScroll?: CarouselAutoScroll;
  playing?: boolean;
  defaultPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  className?: StateValue<string | undefined, CarouselState>;
  style?: StateValue<CSSProperties | undefined, CarouselState>;
  children?: ReactNode;
};

type CarouselName =
  | { 'aria-label': string; 'aria-labelledby'?: string }
  | { 'aria-label'?: string; 'aria-labelledby': string };

export type CarouselProps = Omit<
  ComponentProps<'div'>,
  keyof CarouselOwnProps | 'aria-label' | 'aria-labelledby' | 'role'
> &
  CarouselOwnProps &
  CarouselName;

type Holder = ReactElement<{ children?: ReactNode; asChild?: boolean }>;

const CONTENT = new Set<unknown>([CarouselContent]);
const NAVIGATION = new Set<unknown>([
  CarouselPrev,
  CarouselNext,
  CarouselIndicators,
  CarouselIndicator,
]);
const PAUSE = new Set<unknown>([CarouselPause]);
const NOT_A_SLIDE = new Set<unknown>([...NAVIGATION, ...PAUSE]);

const flag = (on: boolean) => (on ? '' : undefined);

const isSlideLike = (node: ReactNode) =>
  isValidElement(node) && !NOT_A_SLIDE.has(elementTypeOf(node));

function findElementOfType(children: unknown, types: ReadonlySet<unknown>): Holder | undefined {
  if (typeof children === 'function') return undefined;

  for (const child of Children.toArray(children as ReactNode)) {
    if (!isValidElement<{ children?: ReactNode }>(child)) continue;
    if (types.has(elementTypeOf(child))) return child as Holder;
    const nested = findElementOfType(child.props.children, types);
    if (nested) return nested;
  }
  return undefined;
}

function withSlidesInContent(nodes: ReactNode[]) {
  const slides = nodes.filter(isSlideLike);
  const firstSlide = nodes.findIndex(isSlideLike);
  const content = <CarouselContent key="carousel-content">{slides}</CarouselContent>;
  if (firstSlide === -1) return [...nodes, content];

  const beforeTheSlides = nodes.slice(0, firstSlide);
  const others = nodes.slice(firstSlide).filter((node) => !isSlideLike(node));
  return [...beforeTheSlides, content, ...others];
}

const startsFromAStep = (_api: unknown, event: SlidesDragEvent) =>
  !(event.target as Element | null)?.closest?.('[data-carousel-step]');

function useNameWarning(named: boolean) {
  useEffect(() => {
    if (isDevelopment && !named)
      console.warn(
        '[IDS] Carousel: give the carousel a name with aria-label (or aria-labelledby). Screen readers announce it with the carousel role.',
      );
  }, [named]);
}

export function CarouselRoot(props: CarouselProps) {
  const {
    value,
    defaultValue,
    onValueChange,
    orientation = 'horizontal',
    slidesPerView = 1,
    slidesToScroll = 1,
    align = 'start',
    loop = false,
    dragFree = false,
    size = 'standard',
    autoplay,
    autoScroll,
    playing: playingProp,
    defaultPlaying,
    onPlayingChange,
    className,
    style,
    children,
    ref,
    onKeyDown,
    onFocus,
    onBlur,
    ...rest
  } = props;

  const t = useTranslate();
  const rootRef = useRef<HTMLDivElement>(null);
  const focusIndicatorAfterMove = useRef(false);
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(rootRef, ref)(node),
    [ref],
  );

  useNameWarning(Boolean(props['aria-label'] || props['aria-labelledby']));

  const composedContent = findElementOfType(children, CONTENT);
  const nodes = composedContent ? [] : flattenFragments(children);
  const slideCount = composedContent
    ? slidesOf(composedContent.props.children, composedContent.props.asChild).length
    : nodes.filter(isSlideLike).length;

  const { motion, plugins, scrollDirection } = useCarouselPlugins({ autoplay, autoScroll });
  const slides = useSlides({
    value,
    defaultValue,
    onValueChange,
    slideCount,
    orientation,
    align,
    loop,
    dragFree,
    slidesPerView,
    slidesToScroll,
    watchDrag: startsFromAStep,
    plugins,
  });
  const rotation = useCarouselMotion({
    slides,
    motion,
    scrollDirection,
    playing: playingProp,
    defaultPlaying,
    onPlayingChange,
  });

  useEffect(() => {
    if (!focusIndicatorAfterMove.current) return;
    focusIndicatorAfterMove.current = false;

    const root = rootRef.current;
    const indicators = root?.querySelectorAll<HTMLElement>(
      '[data-carousel-indicator][data-current]',
    );
    [...(indicators ?? [])]
      .find((indicator) => indicator.closest('[data-carousel]') === root)
      ?.focus();
  }, [slides.selected]);

  const composedNavigation = containsElementOfType(children, NAVIGATION);
  const composedPause = containsElementOfType(children, PAUSE);
  const navigable = slides.snapCount > 1;
  const defaultIndicators = !composedNavigation && navigable;
  const defaultPause = motion !== null && !composedPause;

  const styles = carouselStyle({ orientation, size });
  const state: CarouselState = {
    value: slides.selected,
    orientation,
    playing: rotation.rotating,
    dragging: slides.dragging,
  };

  const context: CarouselContextValue = {
    slides,
    styles,
    size,
    motion,
    playing: rotation.playing,
    setPlaying: rotation.setPlaying,
    edgeControls: !composedNavigation && navigable,
    onContentHover: rotation.setHovered,
  };

  return (
    <CarouselContext value={context}>
      <div
        {...rest}
        ref={mergedRef}
        role="region"
        aria-roledescription={t('carousel.roleDescription')}
        data-carousel=""
        data-orientation={orientation}
        data-size={size}
        data-playing={flag(rotation.rotating)}
        data-dragging={flag(slides.dragging)}
        className={styles.root({ className: resolveState(className, state) })}
        style={resolveState(style, state)}
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          const fromIndicator = Boolean(
            (event.target as Element).closest('[data-carousel-indicator]'),
          );
          if (moveWithKeys(slides, event)) focusIndicatorAfterMove.current = fromIndicator;
        }}
        onFocus={mergeEventHandlers(onFocus, rotation.onFocus)}
        onBlur={mergeEventHandlers(onBlur, rotation.onBlur)}
      >
        {composedContent ? children : withSlidesInContent(nodes)}
        {(defaultIndicators || defaultPause) && (
          <div data-carousel-controls="" className={styles.controls()}>
            {defaultIndicators && <CarouselIndicators />}
            {defaultPause && <CarouselPause />}
          </div>
        )}
        <SlidesAnnouncer
          slides={slides}
          rotating={rotation.rotating}
          className={styles.announcer()}
        />
      </div>
    </CarouselContext>
  );
}
