import { type CSSProperties, type HTMLAttributes, type ReactNode, type Ref } from 'react';

import { MarkerRoot } from './root';
import { markerStyle } from './style';

import type { StateValue } from '../../../internal/state-props';
import type { IdsSize } from '../../../tokens/types';

export function Marker(props: Marker.Props) {
  return <MarkerRoot {...props} />;
}

export namespace Marker {
  export type Variant = 'default' | 'underline' | 'separator';

  export type State = {
    variant: Variant;
    size: IdsSize;
    pending: boolean;
  };

  export type Props = Omit<HTMLAttributes<HTMLElement>, 'className' | 'style' | 'children'> & {
    ref?: Ref<HTMLElement>;
    variant?: Variant;
    size?: IdsSize;
    pending?: boolean;
    asChild?: boolean;
    className?: StateValue<string | undefined, State>;
    style?: StateValue<CSSProperties | undefined, State>;
    children?: ReactNode;
  };

  export const Style = markerStyle;
}
