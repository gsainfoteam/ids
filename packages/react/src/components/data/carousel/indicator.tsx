'use client';

import type { ComponentProps, MouseEvent } from 'react';

import { useCarouselContext } from './context';
import {
  interactiveDataProps,
  useInteractive,
  type InteractiveState,
} from '../../../hooks/use-interactive';
import { resolveState, type StateRenderProps } from '../../../internal/state-props';
import { useTranslate } from '../../../internal/translate';

export type CarouselIndicatorState = InteractiveState & { index: number; current: boolean };

export type CarouselIndicatorProps = Omit<
  ComponentProps<'button'>,
  'children' | 'className' | 'style' | 'type'
> &
  StateRenderProps<CarouselIndicatorState> & {
    index: number;
  };

export function CarouselIndicator({
  index,
  className,
  style,
  children,
  onClick,
  onKeyDown,
  onKeyUp,
  onFocus,
  onBlur,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  ...rest
}: CarouselIndicatorProps) {
  const t = useTranslate();
  const { slides, styles } = useCarouselContext('Carousel.Indicator');
  const current = slides.selected === index;
  const currentFlag = current ? '' : undefined;

  const { state: interaction, handlers } = useInteractive<HTMLButtonElement>({
    onKeyDown,
    onKeyUp,
    onFocus,
    onBlur,
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
  });
  const state: CarouselIndicatorState = { ...interaction, index, current };

  const goToSlide = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) slides.scrollTo(index);
  };

  return (
    <button
      type="button"
      {...rest}
      {...handlers}
      aria-label={
        rest['aria-label'] ?? t('carousel.indicator', { index: slides.firstSlideOf(index) + 1 })
      }
      aria-current={current ? 'true' : undefined}
      data-carousel-indicator=""
      data-current={currentFlag}
      {...interactiveDataProps(interaction)}
      className={styles.indicator({ className: resolveState(className, state) })}
      style={resolveState(style, state)}
      onClick={goToSlide}
    >
      {children === undefined ? (
        <span aria-hidden="true" data-current={currentFlag} className={styles.dot()} />
      ) : (
        resolveState(children, state)
      )}
    </button>
  );
}

CarouselIndicator.displayName = 'Carousel.Indicator';
