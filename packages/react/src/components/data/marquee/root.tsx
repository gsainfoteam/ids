'use client';

import { isValidElement, useEffect, type CSSProperties, type ReactNode } from 'react';

import { MarqueeContext } from './context';
import { MarqueePause } from './pause';
import { isValidSpeed, loopDuration } from './speed';
import { marqueeStyle, type MarqueeOrientation } from './style';
import { useMarquee } from './use-marquee';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { useReducedMotion } from '../../../hooks/use-reduced-motion';
import { elementTypeOf, flattenFragments } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

import type { Marquee, MarqueeDirection } from '.';

const isPause = (node: ReactNode) => isValidElement(node) && elementTypeOf(node) === MarqueePause;

const orientationOf = (direction: MarqueeDirection): MarqueeOrientation =>
  direction === 'up' || direction === 'down' ? 'vertical' : 'horizontal';

const runsBackward = (direction: MarqueeDirection) => direction === 'end' || direction === 'down';

const hasText = (value: unknown) => typeof value === 'string' && value.trim() !== '';

export function MarqueeRoot({
  direction = 'start',
  speed = 'normal',
  playing: playingProp,
  defaultPlaying,
  onPlayingChange,
  variant = 'fade',
  size = 'standard',
  className,
  style,
  children,
  ...rest
}: Marquee.Props) {
  const reduced = useReducedMotion();
  const orientation = orientationOf(direction);
  const reverse = runsBackward(direction);
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
  const pause = reduced ? undefined : nodes.filter(isPause).at(-1);
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
    reverse,
    variant,
    pauseSpace: pause ? size : 'none',
  });
  const listItems = content.map((node, index) => (
    <li key={isValidElement(node) ? node.key : index} className={styles.listItem()}>
      {node}
    </li>
  ));
  const duration = { '--marquee-duration': loopDuration(length, speed) } as CSSProperties;

  return (
    <MarqueeContext value={{ styles, size, playing, setPlaying: setChosen }}>
      <div
        {...rest}
        role="group"
        data-marquee=""
        data-orientation={orientation}
        data-direction={direction}
        data-playing={playing ? '' : undefined}
        data-paused={playing ? undefined : ''}
        data-reduced-motion={reduced ? '' : undefined}
        className={styles.root({ className })}
        style={{ ...duration, ...style }}
      >
        <div {...viewportProps} data-marquee-viewport="" className={styles.viewport()}>
          <div ref={setTrack} data-marquee-track="" className={styles.track()}>
            <ul data-marquee-content="" className={styles.content()}>
              {listItems}
            </ul>
            {!reduced && (
              <ul
                aria-hidden="true"
                inert
                data-marquee-content=""
                data-marquee-copy=""
                className={styles.content({ copy: true })}
              >
                {listItems}
              </ul>
            )}
          </div>
        </div>
        {pause}
      </div>
    </MarqueeContext>
  );
}
