'use client';

import { type ReactElement } from 'react';

import { PauseIcon, PlayIcon } from '@heroicons/react/16/solid';

import { useInternalTranslate } from '../../../../internal/translate';
import { IconToggle } from '../../../action/icon-toggle';
import { useInternalMarqueeContext } from '../context';

import type { InteractiveState, InteractiveValue } from '../../../../hooks/use-interactive';

export type MarqueePauseProps = Omit<
  IconToggle.Props,
  | 'icon'
  | 'pressed'
  | 'defaultPressed'
  | 'onPressedChange'
  | 'size'
  | 'asChild'
  | 'children'
  | 'className'
> & {
  icon?: InteractiveValue<ReactElement>;
  className?: string;
};

const pauseOrPlay = (state: InteractiveState) => (state.pressed ? <PlayIcon /> : <PauseIcon />);

export function MarqueePause({ icon = pauseOrPlay, className, ...props }: MarqueePauseProps) {
  const t = useInternalTranslate();
  const { styles, size, playing, setPlaying } = useInternalMarqueeContext('Marquee.Pause');

  return (
    <IconToggle
      aria-label={t('marquee.pause')}
      variant="ghost"
      {...props}
      icon={icon}
      size={size}
      pressed={!playing}
      onPressedChange={(pressed) => setPlaying(!pressed)}
      data-marquee-pause=""
      className={styles.pause({ className })}
    />
  );
}

MarqueePause.displayName = 'Marquee.Pause';
