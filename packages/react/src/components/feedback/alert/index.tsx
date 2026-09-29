'use client';

import {
  isValidElement,
  useCallback,
  useEffect,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { AlertActions, type AlertActionsProps } from './actions';
import { AlertClose, type AlertCloseProps } from './close';
import { AlertContext } from './context';
import { AlertDescription, type AlertDescriptionProps } from './description';
import { AlertIcon, type AlertIconProps } from './icon';
import { resolve } from './part-props';
import { alertStyle } from './style';
import { AlertTitle, type AlertTitleProps } from './title';
import { useAlert } from './use-alert';
import { announcedAssertively, type StatusColorScheme } from '../../../internal/status-palette';
import { flattenFragments, mergeEventHandlers, mergeRefs } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

function isPart(node: ReactNode, part: unknown): node is ReactElement<Record<string, unknown>> {
  return isValidElement(node) && node.type === part;
}

export function Alert({
  colorScheme = 'info',
  variant = 'soft',
  open,
  defaultOpen = true,
  onOpenChange,
  role,
  'aria-live': ariaLive,
  onKeyDown,
  className,
  style,
  children,
  ref,
  ...rest
}: Alert.Props) {
  const nodes = flattenFragments(children);
  const icon = nodes.find((node) => isPart(node, AlertIcon));
  const close = nodes.find((node) => isPart(node, AlertClose));
  const body = nodes.filter((node) => node !== icon && node !== close);
  const dismissible = close !== undefined;
  const hasText = nodes.some((node) => isPart(node, AlertTitle) || isPart(node, AlertDescription));

  const {
    setNode,
    open: isOpen,
    mounted,
    ending,
    close: requestClose,
    onKeyDown: onAlertKeyDown,
  } = useAlert({ open, defaultOpen, onOpenChange, dismissible });
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(setNode, ref)(node),
    [setNode, ref],
  );

  useEffect(() => {
    if (isDevelopment && !hasText)
      console.warn('[IDS] Alert: give it an AlertTitle or an AlertDescription.');
  }, [hasText]);

  if (!mounted) return null;

  const showIcon = icon === undefined ? colorScheme !== 'neutral' : icon.props.hidden !== true;
  const state: Alert.State = {
    colorScheme,
    variant,
    open: isOpen,
    dismissible,
    ending,
  };
  const styles = alertStyle({ colorScheme, variant, icon: showIcon, close: dismissible });
  const assertive = announcedAssertively.has(colorScheme);

  return (
    <AlertContext value={{ state, styles, close: requestClose }}>
      <div
        role={role ?? (assertive ? 'alert' : 'status')}
        aria-live={
          ariaLive ?? (role === undefined ? (assertive ? 'assertive' : 'polite') : undefined)
        }
        {...rest}
        ref={mergedRef}
        onKeyDown={mergeEventHandlers(onKeyDown, onAlertKeyDown)}
        data-alert=""
        data-color-scheme={colorScheme}
        data-variant={variant}
        data-dismissible={dismissible ? '' : undefined}
        data-ending-style={ending ? '' : undefined}
        className={styles.root({ className: resolve(className, state) })}
        style={resolve(style, state)}
      >
        {showIcon && (icon ?? <AlertIcon />)}
        <div className={styles.content()}>{body}</div>
        {close}
      </div>
    </AlertContext>
  );
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
