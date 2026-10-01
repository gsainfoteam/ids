'use client';

import { isValidElement, useEffect, type CSSProperties, type ReactNode } from 'react';

import { MarqueeContext } from './context';
import { MarqueePause } from './pause';
import { isValidSpeed, loopDuration } from './speed';
import { marqueeStyle, type MarqueeMotion } from './style';
import { useMarquee } from './use-marquee';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { useReducedMotion } from '../../../hooks/use-reduced-motion';
import { elementTypeOf, flattenFragments } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

import type { Marquee } from '.';

const isPause = (node: ReactNode) => isValidElement(node) && elementTypeOf(node) === MarqueePause;

function motionOf(reducedMotion: boolean | undefined): MarqueeMotion {
  if (reducedMotion === undefined) return 'media';
  return reducedMotion ? 'off' : 'on';
}

const hasText = (value: unknown) => typeof value === 'string' && value.trim() !== '';

export function MarqueeRoot({
  orientation = 'horizontal',
  reverse = false,
  speed = 'normal',
  playing: playingProp,
  defaultPlaying,
  onPlayingChange,
  pauseOnHover = true,
  pauseOnFocus = true,
  pauseControl = true,
  fade = true,
  size = 'standard',
  reducedMotion,
  className,
  style,
  children,
  ...rest
}: Marquee.Props) {
  const prefersReducedMotion = useReducedMotion();
  const reduced = reducedMotion ?? prefersReducedMotion;
  const [chosen, setChosen] = useControllableState<boolean | undefined>({
    value: playingProp,
    defaultValue: defaultPlaying,
    onValueChange: onPlayingChange as ((playing: boolean | undefined) => void) | undefined,
  });
  const playing = !reduced && (chosen ?? true);

  const { setTrack, length, viewportProps } = useMarquee({
    orientation,
    reverse,
    moving: !reduced,
  });

  const nodes = flattenFragments(children);
  const content = nodes.filter((node) => !isPause(node));
  const pause = pauseControl && !reduced && (nodes.filter(isPause).at(-1) ?? <MarqueePause />);
  const named = hasText(rest['aria-label']) || rest['aria-labelledby'] != null;

  useEffect(() => {
    if (!isDevelopment) return;
    if (!named)
      console.warn(
        '[IDS] Marquee: give it an aria-label that says what flows by, such as "Partners".',
      );
    if (!isValidSpeed(speed))
      console.warn('[IDS] Marquee: speed must be a positive number of pixels per second.');
  }, [named, speed]);

  const styles = marqueeStyle({
    orientation,
    motion: motionOf(reducedMotion),
    reverse,
    fade,
    pauseSpace: pause ? size : 'none',
    pauseOnHover,
    pauseOnFocus,
  });
  const duration = { '--ids-marquee-duration': loopDuration(length, speed) } as CSSProperties;

  return (
    <MarqueeContext value={{ styles, size, playing, setPlaying: setChosen }}>
      <div
        {...rest}
        role="group"
        data-marquee=""
        data-orientation={orientation}
        data-reverse={reverse ? '' : undefined}
        data-playing={playing ? '' : undefined}
        data-paused={playing ? undefined : ''}
        data-reduced-motion={reduced ? '' : undefined}
        className={styles.root({ className })}
        style={{ ...duration, ...style }}
      >
        <div {...viewportProps} data-marquee-viewport="" className={styles.viewport()}>
          <div ref={setTrack} data-marquee-track="" className={styles.track()}>
            <div data-marquee-content="" className={styles.content()}>
              {content}
            </div>
            {!reduced && (
              <div
                aria-hidden="true"
                inert
                data-marquee-content=""
                data-marquee-copy=""
                className={styles.content({ copy: true })}
              >
                {content}
              </div>
            )}
          </div>
        </div>
        {pause}
      </div>
    </MarqueeContext>
  );
}
