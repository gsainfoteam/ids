import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import {
  SwitchRoot,
  SwitchThumb,
  type StateProp,
  type SwitchState,
  type SwitchProps,
} from './root';
import { switchStyle } from './style';

export function Switch(props: SwitchProps) {
  return <SwitchRoot {...props} />;
}

export namespace Switch {
  export type Props = SwitchProps;
  export type State = SwitchState;

  export type ThumbProps = Omit<ComponentProps<'span'>, 'className' | 'style' | 'children'> & {
    asChild?: boolean;
    className?: StateProp<string | undefined>;
    style?: StateProp<CSSProperties | undefined>;
    children?: StateProp<ReactNode>;
  };

  export const Thumb = SwitchThumb;

  export namespace Thumb {
    export type Props = ThumbProps;
  }

  export const Style = switchStyle;
}

export type { SwitchState, SwitchProps } from './root';
