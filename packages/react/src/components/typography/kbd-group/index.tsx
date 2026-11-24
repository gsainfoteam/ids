import { type ComponentProps } from 'react';

import { KbdGroupRoot } from './root';
import { kbdGroupStyle } from './style';
import { type StateValue } from '../../../internal/lib/state-props';

import type { IdsSize } from '../../../tokens/types';
import type { Kbd } from '../kbd';

export function KbdGroup(props: KbdGroup.Props) {
  return <KbdGroupRoot {...props} />;
}

export namespace KbdGroup {
  export type State = Kbd.State;

  export type Props = Omit<ComponentProps<'kbd'>, 'className'> & {
    size?: IdsSize;
    platform?: Kbd.Platform;
    labels?: Kbd.Labels;
    className?: StateValue<string | undefined, State>;
  };

  export const Style = kbdGroupStyle;
}
