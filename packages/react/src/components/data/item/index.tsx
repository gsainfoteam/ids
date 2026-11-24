import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { ItemActions, type ItemActionsProps } from './parts/actions';
import { ItemContent, type ItemContentProps } from './parts/content';
import { ItemDescription, type ItemDescriptionProps } from './parts/description';
import { ItemMedia, type ItemMediaProps } from './parts/media';
import { type ItemPartProps } from './parts/part';
import { ItemSeparator, type ItemSeparatorProps } from './parts/separator';
import { ItemTitle, type ItemTitleProps } from './parts/title';
import { ItemRoot, type ItemVariant } from './root';
import { itemStyle } from './style';
import { type StateValue } from '../../../internal/lib/state-props';

import type { InteractiveState } from '../../../hooks/use-interactive';
import type { IdsSize } from '../../../tokens/types';

export function Item(props: Item.Props) {
  return <ItemRoot {...props} />;
}

export namespace Item {
  export type Variant = ItemVariant;

  export type State = InteractiveState & { interactive: boolean; selected: boolean };

  export type Props = Omit<ComponentProps<'div'>, 'className' | 'style' | 'children'> & {
    variant?: ItemVariant;
    size?: IdsSize;
    interactive?: boolean;
    selected?: boolean;
    disabled?: boolean;
    asChild?: boolean;
    onInteractionChange?: (state: InteractiveState) => void;
    className?: StateValue<string | undefined, State>;
    style?: StateValue<CSSProperties | undefined, State>;
    children?: StateValue<ReactNode, State>;
  };

  export type PartProps = ItemPartProps;

  export const Media = ItemMedia;
  export namespace Media {
    export type Variant = ItemVariant;
    export type Props = ItemMediaProps;
  }

  export const Content = ItemContent;
  export namespace Content {
    export type Props = ItemContentProps;
  }

  export const Title = ItemTitle;
  export namespace Title {
    export type Props = ItemTitleProps;
  }

  export const Description = ItemDescription;
  export namespace Description {
    export type Props = ItemDescriptionProps;
  }

  export const Actions = ItemActions;
  export namespace Actions {
    export type Props = ItemActionsProps;
  }

  export const Separator = ItemSeparator;
  export namespace Separator {
    export type Props = ItemSeparatorProps;
  }

  export const Style = itemStyle;
}

export type { ItemVariant } from './root';
