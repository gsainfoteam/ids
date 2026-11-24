import { type ComponentProps } from 'react';

import { MarqueeItem, type MarqueeItemProps } from './parts/item';
import { MarqueePause, type MarqueePauseProps } from './parts/pause';
import { MarqueeRoot } from './root';
import { marqueeStyle } from './style';

import type { IdsSize } from '../../../tokens/types';

export type MarqueeDirection = 'start' | 'end' | 'up' | 'down';
export type MarqueeSpeed = 'slow' | 'normal' | 'fast' | number;
export type MarqueeVariant = 'fade' | 'plain';

export function Marquee(props: Marquee.Props) {
  return <MarqueeRoot {...props} />;
}

export namespace Marquee {
  export type Direction = MarqueeDirection;
  export type Speed = MarqueeSpeed;
  export type Variant = MarqueeVariant;

  export type Props = Omit<ComponentProps<'div'>, 'role'> & {
    direction?: MarqueeDirection;
    speed?: MarqueeSpeed;
    playing?: boolean;
    defaultPlaying?: boolean;
    onPlayingChange?: (playing: boolean) => void;
    variant?: MarqueeVariant;
    size?: IdsSize;
  };

  export type ItemProps = MarqueeItemProps;
  export type PauseProps = MarqueePauseProps;

  export const Item = MarqueeItem;
  export namespace Item {
    export type Props = MarqueeItemProps;
  }

  export const Pause = MarqueePause;
  export namespace Pause {
    export type Props = MarqueePauseProps;
  }

  export const Style = marqueeStyle;
}
