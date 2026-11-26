import { type ComponentProps } from 'react';

import { ChipGroupRoot } from './root';
import { chipGroupStyle } from './style';

import type { IdsSize } from '../../../tokens/types';

export function ChipGroup(props: ChipGroup.Props) {
  return <ChipGroupRoot {...props} />;
}

export namespace ChipGroup {
  export type Props = ComponentProps<'div'> & {
    size?: IdsSize;
    asChild?: boolean;
  };

  export const Style = chipGroupStyle;
}

export type ChipGroupProps = ChipGroup.Props;
