'use client';

import { Fragment, type ComponentProps, type ReactNode } from 'react';

import { range } from 'es-toolkit';

import { useCarouselContext } from './context';
import { CarouselIndicator } from './indicator';

export type CarouselIndicatorsProps = Omit<ComponentProps<'div'>, 'children'> & {
  children?: ReactNode | ((index: number) => ReactNode);
};

export function CarouselIndicators({ className, children, ...rest }: CarouselIndicatorsProps) {
  const { slides, styles } = useCarouselContext('Carousel.Indicators');
  const drawEach =
    typeof children === 'function'
      ? children
      : children === undefined
        ? (index: number) => <CarouselIndicator index={index} />
        : undefined;

  const indicators = drawEach
    ? range(slides.snapCount).map((index) => <Fragment key={index}>{drawEach(index)}</Fragment>)
    : (children as ReactNode);

  return (
    <div {...rest} data-carousel-indicators="" className={styles.indicators({ className })}>
      {indicators}
    </div>
  );
}

CarouselIndicators.displayName = 'Carousel.Indicators';
