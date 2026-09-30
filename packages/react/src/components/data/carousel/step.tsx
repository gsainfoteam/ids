'use client';

import type { ComponentProps, MouseEvent, ReactElement } from 'react';

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from '@heroicons/react/16/solid';

import { useCarouselContext } from './context';
import { IconButton } from '../../action/icon-button';

import type { ControlColorScheme } from '../../../internal/control-surface';
import type { IdsSize, IdsVariant } from '../../../tokens/types';

export type CarouselStepProps = Omit<ComponentProps<'button'>, 'children' | 'color'> & {
  variant?: IdsVariant;
  colorScheme?: ControlColorScheme;
  size?: IdsSize;
  icon?: ReactElement;
};

type StepOptions = {
  part: string;
  direction: 'prev' | 'next';
  label: string;
};

const GLYPHS = {
  horizontal: {
    prev: <ChevronLeftIcon aria-hidden="true" />,
    next: <ChevronRightIcon aria-hidden="true" />,
  },
  vertical: {
    prev: <ChevronUpIcon aria-hidden="true" />,
    next: <ChevronDownIcon aria-hidden="true" />,
  },
};

export function CarouselStep({
  part,
  direction,
  label,
  icon,
  variant = 'outline',
  size,
  disabled,
  className,
  onClick,
  ...rest
}: CarouselStepProps & StepOptions) {
  const carousel = useCarouselContext(part);
  const { slides, styles } = carousel;
  const atTheEnd = direction === 'prev' ? !slides.canScrollPrev : !slides.canScrollNext;

  const step = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (direction === 'prev') slides.scrollPrev();
    else slides.scrollNext();
  };

  return (
    <IconButton
      {...rest}
      aria-label={rest['aria-label'] ?? label}
      icon={icon ?? GLYPHS[slides.orientation][direction]}
      variant={variant}
      size={size ?? carousel.size}
      disabled={disabled || atTheEnd}
      focusableWhenDisabled
      data-carousel-step={direction}
      className={styles.step({ className })}
      onClick={step}
    />
  );
}
