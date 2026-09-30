'use client';

import { use, useEffect, type ComponentProps } from 'react';

import { SlideIndexContext, useCarouselContext } from './context';
import { resolveState, type StateRenderProps } from '../../../internal/state-props';
import { part } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

import type { SlideState } from '../../../internal/slides';

export type CarouselSlideState = SlideState;

export type CarouselSlideProps = Omit<
  ComponentProps<'div'>,
  'children' | 'className' | 'style' | 'role' | 'inert'
> &
  StateRenderProps<CarouselSlideState> & {
    asChild?: boolean;
  };

function useStrayWarning(stray: boolean) {
  useEffect(() => {
    if (isDevelopment && stray)
      console.warn(
        '[IDS] Carousel.Slide must be a child of Carousel.Content. A slide outside it is not part of the track and cannot be reached by dragging, buttons or keys.',
      );
  }, [stray]);
}

export function CarouselSlide({
  asChild = false,
  className,
  style,
  children,
  ...rest
}: CarouselSlideProps) {
  const { slides, styles } = useCarouselContext('Carousel.Slide');
  const index = use(SlideIndexContext);
  useStrayWarning(index === null);

  const state = slides.slideState(index ?? 0);
  if (index === null) return <div {...rest}>{resolveState(children, state)}</div>;

  const engine = slides.slideProps(index);

  return part('div', asChild, resolveState(children, state), {
    ...rest,
    ...engine,
    'aria-label': rest['aria-label'] ?? engine['aria-label'],
    'data-carousel-slide': '',
    className: styles.slide({ className: resolveState(className, state) }),
    style: resolveState(style, state),
  });
}

CarouselSlide.displayName = 'Carousel.Slide';
