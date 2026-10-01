'use client';

import type { ComponentProps, ReactElement } from 'react';

import { PauseIcon, PlayIcon } from '@heroicons/react/16/solid';

import { useCarouselContext } from './context';
import { useTranslate } from '../../../internal/translate';
import { IconToggle } from '../../action/icon-toggle';

import type { InteractiveState, InteractiveValue } from '../../../hooks/use-interactive';
import type { ControlColorScheme } from '../../../internal/control-surface';
import type { IdsSize, IdsVariant } from '../../../tokens/types';

export type CarouselPauseProps = Omit<ComponentProps<'button'>, 'children' | 'color' | 'value'> & {
  variant?: IdsVariant;
  colorScheme?: ControlColorScheme;
  size?: IdsSize;
  icon?: InteractiveValue<ReactElement>;
};

const pauseOrPlay = ({ pressed }: InteractiveState) =>
  pressed ? <PlayIcon aria-hidden="true" /> : <PauseIcon aria-hidden="true" />;

export function CarouselPause({
  icon = pauseOrPlay,
  variant = 'outline',
  size,
  className,
  ...rest
}: CarouselPauseProps) {
  const t = useTranslate();
  const carousel = useCarouselContext('Carousel.Pause');
  if (carousel.motion === null) return null;

  return (
    <IconToggle
      {...rest}
      aria-label={rest['aria-label'] ?? t('carousel.pause')}
      icon={icon}
      variant={variant}
      size={size ?? carousel.size}
      pressed={!carousel.playing}
      onPressedChange={(pressed) => carousel.setPlaying(!pressed)}
      data-carousel-pause=""
      className={carousel.styles.pause({ className })}
    />
  );
}

CarouselPause.displayName = 'Carousel.Pause';
