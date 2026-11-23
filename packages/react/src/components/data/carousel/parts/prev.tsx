'use client';

import { CarouselStep, type CarouselStepProps } from './step';
import { useInternalTranslate } from '../../../../internal/translate';

export type CarouselPrevProps = CarouselStepProps;

export function CarouselPrev(props: CarouselPrevProps) {
  const t = useInternalTranslate();
  return (
    <CarouselStep {...props} part="Carousel.Prev" direction="prev" label={t('carousel.previous')} />
  );
}

CarouselPrev.displayName = 'Carousel.Prev';
