import { type ComponentProps } from 'react';

import { MarqueeItem, type MarqueeItemProps } from './item';
import { MarqueePause, type MarqueePauseProps } from './pause';
import { MarqueeRoot } from './root';
import { marqueeStyle } from './style';

import type { IdsSize } from '../../../tokens/types';

export type MarqueeOrientation = 'horizontal' | 'vertical';
export type MarqueeSpeed = 'slow' | 'normal' | 'fast' | number;

export function Marquee(props: Marquee.Props) {
  return <MarqueeRoot {...props} />;
}

export namespace Marquee {
  export type Orientation = MarqueeOrientation;
  export type Speed = MarqueeSpeed;

  export type Props = Omit<ComponentProps<'div'>, 'role'> & {
    orientation?: MarqueeOrientation;
    reverse?: boolean;
    speed?: MarqueeSpeed;
    playing?: boolean;
    defaultPlaying?: boolean;
    onPlayingChange?: (playing: boolean) => void;
    pauseOnHover?: boolean;
    pauseOnFocus?: boolean;
    pauseControl?: boolean;
    fade?: boolean;
    size?: IdsSize;
    reducedMotion?: boolean;
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
