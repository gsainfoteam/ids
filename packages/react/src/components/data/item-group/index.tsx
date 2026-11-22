import { type ComponentProps, type Ref } from 'react';

import { ItemGroupRoot } from './root';
import { itemGroupStyle } from './style';

import type { IdsSize } from '../../../tokens/types';

export type ItemGroupVariant = 'bordered' | 'separated' | 'ghost';

export function ItemGroup(props: ItemGroup.Props) {
  return <ItemGroupRoot {...props} />;
}

export namespace ItemGroup {
  export type Variant = ItemGroupVariant;

  export type Props = Omit<ComponentProps<'ul'>, 'ref'> & {
    ref?: Ref<HTMLElement>;
    variant?: ItemGroupVariant;
    ordered?: boolean;
    size?: IdsSize;
  };

  export const Style = itemGroupStyle;
}
