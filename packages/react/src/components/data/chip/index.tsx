import { type CSSProperties, type HTMLAttributes, type ReactNode, type Ref } from 'react';

import { ChipClose, type ChipCloseProps } from './close';
import { ChipIcon, type ChipIconProps } from './icon';
import { ChipLabel, type ChipLabelProps } from './label';
import { ChipRoot, type ChipVariant, type ChipColorScheme } from './root';
import { chipStyle } from './style';
import { type ChipRemoveEvent } from './use-chip';
import { type InteractiveState } from '../../../hooks/use-interactive';
import { type StateValue } from '../../../internal/state-props';

import type { IdsSize } from '../../../tokens/types';

export function Chip(props: Chip.Props) {
  return <ChipRoot {...props} />;
}

export namespace Chip {
  export type Variant = ChipVariant;
  export type ColorScheme = ChipColorScheme;
  export type RemoveEvent = ChipRemoveEvent;

  export type State = InteractiveState & {
    selected: boolean;
    removable: boolean;
    interactive: boolean;
  };

  export type Props = Omit<HTMLAttributes<HTMLElement>, 'className' | 'style' | 'children'> & {
    ref?: Ref<HTMLElement>;
    variant?: ChipVariant;
    colorScheme?: ChipColorScheme;
    size?: IdsSize;
    selected?: boolean;
    defaultSelected?: boolean;
    onSelectedChange?: (selected: boolean) => void;
    onRemove?: (event: RemoveEvent) => void;
    disabled?: boolean;
    asChild?: boolean;
    onInteractionChange?: (state: InteractiveState) => void;
    className?: StateValue<string | undefined, State>;
    style?: StateValue<CSSProperties | undefined, State>;
    children?: StateValue<ReactNode, State>;
  };

  export const Icon = ChipIcon;
  export namespace Icon {
    export type Props = ChipIconProps;
  }

  export const Label = ChipLabel;
  export namespace Label {
    export type Props = ChipLabelProps;
  }

  export const Close = ChipClose;
  export namespace Close {
    export type Props = ChipCloseProps;
  }

  export const Style = chipStyle;
}

export type { ChipVariant, ChipColorScheme } from './root';
