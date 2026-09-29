import { type ComponentProps, type ReactNode } from 'react';

import { type KbdKeys, type KbdLabels, type KbdPlatform } from './keys';
import { KbdRoot, KbdGroup } from './root';
import { kbdStyle } from './style';

import type { IdsSize } from '../../../tokens/types';

export function Kbd(props: Kbd.Props) {
  return <KbdRoot {...props} />;
}

export namespace Kbd {
  export type Platform = KbdPlatform;
  export type Keys = KbdKeys;
  export type Labels = KbdLabels;

  export type State = {
    size: IdsSize;
    platform: Platform;
    combination: boolean;
  };

  export type Props = Omit<ComponentProps<'kbd'>, 'className'> & {
    keys?: Keys;
    size?: IdsSize;
    platform?: Platform;
    labels?: Labels;
    separator?: ReactNode;
    className?: string | ((state: State) => string | undefined);
  };

  export const Group = KbdGroup;
  export namespace Group {
    export type Props = Omit<ComponentProps<'kbd'>, 'className'> & {
      size?: IdsSize;
      platform?: Platform;
      labels?: Labels;
      className?: string | ((state: State) => string | undefined);
    };
  }

  export const Style = kbdStyle;
}
export type { KbdKeys, KbdLabel, KbdLabels, KbdPlatform } from './keys';
