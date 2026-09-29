'use client';

import { type ComponentProps, type MouseEvent, type ReactElement } from 'react';

import { XMarkIcon } from '@heroicons/react/16/solid';

import { useAlertContext } from './context';
import { resolve } from './part-props';
import { useTranslate } from '../../../internal/translate';
import { mergeEventHandlers } from '../../../utils';
import { IconButton } from '../../action/icon-button';

import type { Alert } from '.';

export type AlertCloseProps = Omit<ComponentProps<'button'>, 'className' | 'type' | 'children'> & {
  className?: string | ((state: Alert.State) => string | undefined);
  children?: ReactElement;
};

export function AlertClose({ className, children, onClick, ...props }: AlertCloseProps) {
  const t = useTranslate();

  const { state, styles, close } = useAlertContext('Alert.Close');
  return (
    <IconButton
      aria-label={t('alert.close')}
      {...props}
      variant="ghost"
      colorScheme={state.colorScheme}
      icon={children ?? <XMarkIcon />}
      onClick={mergeEventHandlers(onClick, (_event: MouseEvent<HTMLButtonElement>) => close())}
      data-alert-close=""
      className={styles.close({ className: resolve(className, state) })}
    />
  );
}

AlertClose.displayName = 'Alert.Close';
