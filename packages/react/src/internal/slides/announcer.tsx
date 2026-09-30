'use client';

import { useTranslate } from '../translate';

import type { Slides } from './use-slides';

export type SlidesAnnouncerProps = {
  slides: Slides;
  rotating?: boolean;
  counter?: boolean;
  className?: string;
};

export function SlidesAnnouncer({
  slides,
  rotating = false,
  counter = false,
  className,
}: SlidesAnnouncerProps) {
  const t = useTranslate();
  const position = { index: slides.firstSlideOf(slides.selected) + 1, count: slides.slideCount };
  const hasSlides = slides.slideCount > 0;

  return (
    <div
      aria-live={rotating ? 'off' : 'polite'}
      aria-atomic="true"
      data-slides-announcer=""
      className={className}
    >
      {hasSlides && counter && <span aria-hidden="true">{t('slides.counter', position)}</span>}
      {hasSlides && (
        <span className={counter ? 'sr-only' : undefined}>{t('slides.slide', position)}</span>
      )}
    </div>
  );
}
