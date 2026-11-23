'use client';

import { CarouselStep, type CarouselStepProps } from './step';
import { useInternalTranslate } from '../../../../internal/translate';

export type CarouselNextProps = CarouselStepProps;

export function CarouselNext(props: CarouselNextProps) {
  const t = useInternalTranslate();
  return (
    <CarouselStep {...props} part="Carousel.Next" direction="next" label={t('carousel.next')} />
  );
}

CarouselNext.displayName = 'Carousel.Next';
