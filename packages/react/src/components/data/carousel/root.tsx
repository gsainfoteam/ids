'use client';

import { isValidElement, type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { CarouselContext, type CarouselContextValue } from './context';
import { useInternalCarouselKeys } from './hooks/use-carousel-keys';
import { useInternalCarouselMotion } from './hooks/use-carousel-motion';
import { useInternalCarouselNameWarning } from './hooks/use-carousel-name-warning';
import { findElementOfType, startsFromAStep } from './lib/carousel-children';
import { CarouselContent, slidesOf } from './parts/content';
import { CarouselIndicator } from './parts/indicator';
import { CarouselIndicators } from './parts/indicators';
import { CarouselNext } from './parts/next';
import { CarouselPause } from './parts/pause';
import { CarouselPrev } from './parts/prev';
import { carouselStyle } from './style';
import { resolveState, type StateValue } from '../../../internal/lib/state-props';
import {
  SlidesAnnouncer,
  useInternalSlides,
  type SlidesOrientation,
} from '../../../internal/slides';
import { useInternalTranslate } from '../../../internal/translate';
import {
  containsElementOfType,
  elementTypeOf,
  flattenFragments,
  mergeEventHandlers,
} from '../../../utils';

import type { CarouselInstance } from './hooks/use-carousel';
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
  size?: IdsSize;
  carousel?: CarouselInstance;
  className?: StateValue<string | undefined, CarouselState>;
  style?: StateValue<CSSProperties | undefined, CarouselState>;
  children?: ReactNode;
};

type CarouselName =
  | { 'aria-label': string; 'aria-labelledby'?: string }
  | { 'aria-label'?: string; 'aria-labelledby': string };

export type CarouselProps = Omit<
  ComponentProps<'section'>,
  keyof CarouselOwnProps | 'aria-label' | 'aria-labelledby' | 'role'
> &
  CarouselOwnProps &
  CarouselName;

const CONTENT = new Set<unknown>([CarouselContent]);
const NAVIGATION = new Set<unknown>([
  CarouselPrev,
  CarouselNext,
  CarouselIndicators,
  CarouselIndicator,
]);
const PAUSE = new Set<unknown>([CarouselPause]);
const NOT_A_SLIDE = new Set<unknown>([...NAVIGATION, ...PAUSE]);

const ONE_SLIDE_NO_MOTION: CarouselInstance = {
  slides: {},
  motion: null,
  plugins: [],
  scrollDirection: 'forward',
  playing: {},
};

const flag = (on: boolean) => (on ? '' : undefined);

const isSlideLike = (node: ReactNode) =>
  isValidElement(node) && !NOT_A_SLIDE.has(elementTypeOf(node));

function withSlidesInContent(nodes: ReactNode[]) {
  const slides = nodes.filter(isSlideLike);
  const firstSlide = nodes.findIndex(isSlideLike);
  const content = <CarouselContent key="carousel-content">{slides}</CarouselContent>;
  if (firstSlide === -1) return [...nodes, content];

  const beforeTheSlides = nodes.slice(0, firstSlide);
  const others = nodes.slice(firstSlide).filter((node) => !isSlideLike(node));
  return [...beforeTheSlides, content, ...others];
}

export function CarouselRoot(props: CarouselProps) {
  const {
    value,
    defaultValue,
    onValueChange,
    orientation = 'horizontal',
    size = 'standard',
    carousel = ONE_SLIDE_NO_MOTION,
    className,
    style,
    children,
    ref,
    onKeyDown,
    onFocus,
    onBlur,
    ...rest
  } = props;

  const t = useInternalTranslate();

  useInternalCarouselNameWarning(Boolean(props['aria-label'] || props['aria-labelledby']));

  const composedContent = findElementOfType(children, CONTENT);
  const nodes = composedContent ? [] : flattenFragments(children);
  const slideCount = composedContent
    ? slidesOf(composedContent.props.children, composedContent.props.asChild).length
    : nodes.filter(isSlideLike).length;

  const { motion, plugins, scrollDirection, playing } = carousel;
  const slides = useInternalSlides({
    value,
    defaultValue,
    onValueChange,
    slideCount,
    orientation,
    align: carousel.slides.align,
    loop: carousel.slides.loop,
    dragFree: carousel.slides.dragFree,
    slidesPerView: carousel.slides.perView,
    slidesToScroll: carousel.slides.toScroll,
    watchDrag: startsFromAStep,
    plugins,
  });
  const rotation = useInternalCarouselMotion({ slides, motion, scrollDirection, playing });
  const { mergedRef, moveOnKeyDown } = useInternalCarouselKeys({ slides, ref, onKeyDown });

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
      <section
        {...rest}
        ref={mergedRef}
        aria-roledescription={t('carousel.roleDescription')}
        data-carousel=""
        data-orientation={orientation}
        data-size={size}
        data-playing={flag(rotation.rotating)}
        data-dragging={flag(slides.dragging)}
        className={styles.root({ className: resolveState(className, state) })}
        style={resolveState(style, state)}
        onKeyDown={moveOnKeyDown}
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
      </section>
    </CarouselContext>
  );
}
