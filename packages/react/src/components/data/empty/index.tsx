import { type ComponentProps } from 'react';

import { EmptyActions, type EmptyActionsProps } from './parts/actions';
import { EmptyDescription, type EmptyDescriptionProps } from './parts/description';
import { EmptyMedia, type EmptyMediaProps } from './parts/media';
import { type EmptyPartProps } from './parts/part';
import { EmptyTitle, type EmptyTitleProps } from './parts/title';
import { EmptyRoot } from './root';
import { emptyStyle } from './style';

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
