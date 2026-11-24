'use client';

import type { ComponentProps, ReactElement } from 'react';

import { PauseIcon, PlayIcon } from '@heroicons/react/16/solid';

import { useInternalTranslate } from '../../../../internal/translate';
import { IconToggle } from '../../../action/icon-toggle';
import { useInternalCarouselContext } from '../context';

import type { InteractiveState, InteractiveValue } from '../../../../hooks/use-interactive';
import type {
  ControlColorScheme,
  SurfaceVariant,
} from '../../../../internal/surfaces/lib/control-surface';
import type { IdsSize } from '../../../../tokens/types';

export type CarouselPauseProps = Omit<ComponentProps<'button'>, 'children' | 'color' | 'value'> & {
  variant?: SurfaceVariant;
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
  const t = useInternalTranslate();
  const carousel = useInternalCarouselContext('Carousel.Pause');
  if (carousel.motion === null) return null;

  return (
    <IconToggle
      {...rest}
      aria-label={rest['aria-label'] ?? t('common.pause')}
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
