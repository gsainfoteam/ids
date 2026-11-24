'use client';

import { isValidElement, useCallback, useEffect, type ReactElement, type ReactNode } from 'react';

import { AlertContext } from './context';
import { useInternalAlert } from './hooks/use-alert';
import { resolve } from './lib/part-props';
import { AlertClose } from './parts/close';
import { AlertDescription } from './parts/description';
import { AlertIcon } from './parts/icon';
import { AlertTitle } from './parts/title';
import { alertStyle } from './style';
import { announcedAssertively } from '../../../internal/lib/status-palette';
import { elementTypeOf, flattenFragments, mergeEventHandlers, mergeRefs } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

import type { Alert } from '.';

function isPart(node: ReactNode, part: unknown): node is ReactElement<Record<string, unknown>> {
  return isValidElement(node) && elementTypeOf(node) === part;
}

export function AlertRoot({
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
  } = useInternalAlert({ open, defaultOpen, onOpenChange, dismissible });
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
