import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { CardAction, type CardActionProps } from './parts/action';
import { CardContent, type CardContentProps } from './parts/content';
import { CardDescription, type CardDescriptionProps } from './parts/description';
import { CardFooter, type CardFooterProps } from './parts/footer';
import { CardHeader, type CardHeaderProps } from './parts/header';
import { CardMedia, type CardMediaProps } from './parts/media';
import { type CardPartProps } from './parts/part';
import { CardTitle, type CardTitleProps } from './parts/title';
import { CardRoot, type CardVariant } from './root';
import { cardStyle } from './style';
import { type StateValue } from '../../../internal/lib/state-props';

import type { InteractiveState } from '../../../hooks/use-interactive';
import type { IdsSize } from '../../../tokens/types';

export function Card(props: Card.Props) {
  return <CardRoot {...props} />;
}

export namespace Card {
  export type Variant = CardVariant;

  export type State = InteractiveState & { interactive: boolean };

  export type Props = Omit<ComponentProps<'div'>, 'className' | 'style' | 'children'> & {
    variant?: CardVariant;
    size?: IdsSize;
    disabled?: boolean;
    asChild?: boolean;
    onInteractionChange?: (state: InteractiveState) => void;
    className?: StateValue<string | undefined, State>;
    style?: StateValue<CSSProperties | undefined, State>;
    children?: StateValue<ReactNode, State>;
  };

  export type PartProps = CardPartProps;

  export const Header = CardHeader;
  export namespace Header {
    export type Props = CardHeaderProps;
  }

  export const Title = CardTitle;
  export namespace Title {
    export type Props = CardTitleProps;
  }

  export const Description = CardDescription;
  export namespace Description {
    export type Props = CardDescriptionProps;
  }

  export const Action = CardAction;
  export namespace Action {
    export type Props = CardActionProps;
  }

  export const Content = CardContent;
  export namespace Content {
    export type Props = CardContentProps;
  }

  export const Footer = CardFooter;
  export namespace Footer {
    export type Props = CardFooterProps;
  }

  export const Media = CardMedia;
  export namespace Media {
    export type Props = CardMediaProps;
  }

  export const Style = cardStyle;
}

export type { CardVariant } from './root';
