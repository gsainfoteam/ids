import { type ComponentProps } from 'react';

import { type KbdKeys, type KbdLabels, type KbdPlatform } from './keys';
import { KbdRoot } from './root';
import { KbdSeparator, type KbdSeparatorProps } from './separator';
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
    className?: string | ((state: State) => string | undefined);
  };

  export type SeparatorProps = KbdSeparatorProps;

  export const Separator = KbdSeparator;
  export namespace Separator {
    export type Props = KbdSeparatorProps;
  }

  export const Style = kbdStyle;
}
export type { KbdKeys, KbdLabel, KbdLabels, KbdPlatform } from './keys';
