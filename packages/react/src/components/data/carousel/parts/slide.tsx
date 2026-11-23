'use client';

import { use, type ComponentProps } from 'react';

import { resolveState, type StateRenderProps } from '../../../../internal/lib/state-props';
import { part } from '../../../../utils';
import { SlideIndexContext, useInternalCarouselContext } from '../context';
import { useInternalCarouselSlideStrayWarning } from '../hooks/use-carousel-slide-stray-warning';

import type { SlideState } from '../../../../internal/slides';

export type CarouselSlideState = SlideState;

export type CarouselSlideProps = Omit<
  ComponentProps<'div'>,
  'children' | 'className' | 'style' | 'role' | 'inert'
> &
  StateRenderProps<CarouselSlideState> & {
    asChild?: boolean;
  };

export function CarouselSlide({
  asChild = false,
  className,
  style,
  children,
  ...rest
}: CarouselSlideProps) {
  const { slides, styles } = useInternalCarouselContext('Carousel.Slide');
  const index = use(SlideIndexContext);
  useInternalCarouselSlideStrayWarning(index === null);

  const state = slides.slideState(index ?? 0);
  if (index === null) return <div {...rest}>{resolveState(children, state)}</div>;

  const engine = slides.slideProps(index);

  return part('div', asChild, resolveState(children, state), {
    ...rest,
    ...engine,
    'aria-label': rest['aria-label'] ?? engine['aria-label'],
    'data-carousel-slide': '',
    'data-field-input': '',
    className: styles.slide({ className: resolveState(className, state) }),
    style: resolveState(style, state),
  });
}

CarouselSlide.displayName = 'Carousel.Slide';
