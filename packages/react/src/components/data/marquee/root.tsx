'use client';

import { isValidElement, type CSSProperties, type ReactNode } from 'react';

import { MarqueeContext } from './context';
import { useInternalMarquee } from './hooks/use-marquee';
import { useInternalMarqueePlaying } from './hooks/use-marquee-playing';
import { useInternalMarqueeWarnings } from './hooks/use-marquee-warnings';
import { loopDuration } from './lib/speed';
import { MarqueePause } from './parts/pause';
import { marqueeStyle, type MarqueeOrientation } from './style';
import { elementTypeOf, flattenFragments } from '../../../utils';

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
  const { reduced, playing, setPlaying } = useInternalMarqueePlaying({
    playing: playingProp,
    defaultPlaying,
    onPlayingChange,
  });
  const orientation = orientationOf(direction);
  const reverse = runsBackward(direction);

  const { setTrack, length, viewportProps } = useInternalMarquee({
    orientation,
    reverse,
    moving: !reduced,
  });

  const nodes = flattenFragments(children);
  const content = nodes.filter((node) => !isPause(node));
  const pause = reduced ? undefined : nodes.filter(isPause).at(-1);
  const named = hasText(rest['aria-label']) || rest['aria-labelledby'] != null;

  useInternalMarqueeWarnings(named, speed);

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
    <MarqueeContext value={{ styles, size, playing, setPlaying }}>
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
