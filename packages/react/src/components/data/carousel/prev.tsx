'use client';

import { CarouselStep, type CarouselStepProps } from './step';
import { useTranslate } from '../../../internal/translate';

export type CarouselPrevProps = CarouselStepProps;

export function CarouselPrev(props: CarouselPrevProps) {
  const t = useTranslate();
  return (
    <CarouselStep {...props} part="Carousel.Prev" direction="prev" label={t('carousel.previous')} />
  );
}

CarouselPrev.displayName = 'Carousel.Prev';
