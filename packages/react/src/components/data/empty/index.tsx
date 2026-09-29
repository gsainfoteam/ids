import { type ComponentProps } from 'react';

import { EmptyActions, type EmptyActionsProps } from './actions';
import { EmptyDescription, type EmptyDescriptionProps } from './description';
import { EmptyMedia, type EmptyMediaProps } from './media';
import { type EmptyPartProps } from './part';
import { EmptyRoot } from './root';
import { emptyStyle } from './style';
import { EmptyTitle, type EmptyTitleProps } from './title';

import type { IdsSize } from '../../../tokens/types';

export type EmptyVariant = 'ghost' | 'soft' | 'outline';
export type EmptyMediaVariant = 'soft' | 'outline' | 'ghost';
export type EmptyAlign = 'center' | 'start';

export function Empty(props: Empty.Props) {
  return <EmptyRoot {...props} />;
}

export namespace Empty {
  export type Variant = EmptyVariant;
  export type Align = EmptyAlign;

  export type Props = ComponentProps<'div'> & {
    variant?: EmptyVariant;
    size?: IdsSize;
    align?: EmptyAlign;
  };

  export type PartProps = EmptyPartProps;

  export const Media = EmptyMedia;
  export namespace Media {
    export type Props = EmptyMediaProps;
    export type Variant = EmptyMediaVariant;
  }

  export const Title = EmptyTitle;
  export namespace Title {
    export type Props = EmptyTitleProps;
  }

  export const Description = EmptyDescription;
  export namespace Description {
    export type Props = EmptyDescriptionProps;
  }

  export const Actions = EmptyActions;
  export namespace Actions {
    export type Props = EmptyActionsProps;
  }

  export const Style = emptyStyle;
}
