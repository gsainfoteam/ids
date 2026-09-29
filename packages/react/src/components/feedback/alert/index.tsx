import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { AlertActions, type AlertActionsProps } from './actions';
import { AlertClose, type AlertCloseProps } from './close';
import { AlertDescription, type AlertDescriptionProps } from './description';
import { AlertIcon, type AlertIconProps } from './icon';
import { AlertRoot } from './root';
import { alertStyle } from './style';
import { AlertTitle, type AlertTitleProps } from './title';
import { type StatusColorScheme } from '../../../internal/status-palette';

export function Alert(props: Alert.Props) {
  return <AlertRoot {...props} />;
}

export namespace Alert {
  export type ColorScheme = StatusColorScheme;
  export type Variant = 'solid' | 'soft' | 'outline' | 'ghost';

  export type State = {
    colorScheme: ColorScheme;
    variant: Variant;
    open: boolean;
    dismissible: boolean;
    ending: boolean;
  };

  export type Props = Omit<ComponentProps<'div'>, 'className' | 'style' | 'children'> & {
    colorScheme?: ColorScheme;
    variant?: Variant;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string | ((state: State) => string | undefined);
    style?: CSSProperties | ((state: State) => CSSProperties | undefined);
    children?: ReactNode;
  };

  export const Icon = AlertIcon;
  export namespace Icon {
    export type Props = AlertIconProps;
  }

  export const Title = AlertTitle;
  export namespace Title {
    export type Props = AlertTitleProps;
  }

  export const Description = AlertDescription;
  export namespace Description {
    export type Props = AlertDescriptionProps;
  }

  export const Actions = AlertActions;
  export namespace Actions {
    export type Props = AlertActionsProps;
  }

  export const Close = AlertClose;
  export namespace Close {
    export type Props = AlertCloseProps;
  }

  export const Style = alertStyle;
}
