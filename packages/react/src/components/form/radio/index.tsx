import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import {
  RadioRoot,
  type StateProp,
  RadioIndicator,
  type RadioVariant,
  type RadioState,
  type RadioProps,
} from './root';
import { radioStyle } from './style';

export function Radio(props: RadioProps) {
  return <RadioRoot {...props} />;
}

export namespace Radio {
  export type Props = RadioProps;
  export type State = RadioState;
  export type Variant = RadioVariant;

  export type IndicatorProps = Omit<ComponentProps<'span'>, 'className' | 'style' | 'children'> & {
    asChild?: boolean;
    className?: StateProp<string | undefined>;
    style?: StateProp<CSSProperties | undefined>;
    children?: StateProp<ReactNode>;
  };

  export const Indicator = RadioIndicator;

  export namespace Indicator {
    export type Props = IndicatorProps;
  }

  export const Style = radioStyle;
}

export type { RadioVariant, RadioState, RadioProps } from './root';
