'use client';

import { type ComponentProps, type MouseEvent, type ReactElement } from 'react';

import { XMarkIcon } from '@heroicons/react/16/solid';

import { useInternalTranslate } from '../../../../internal/translate';
import { mergeEventHandlers } from '../../../../utils';
import { IconButton } from '../../../action/icon-button';
import { useInternalAlertContext } from '../context';
import { resolve } from '../lib/part-props';

import type { Alert } from '..';

export type AlertCloseProps = Omit<ComponentProps<'button'>, 'className' | 'type' | 'children'> & {
  className?: string | ((state: Alert.State) => string | undefined);
  children?: ReactElement;
};

export function AlertClose({ className, children, onClick, ...props }: AlertCloseProps) {
  const t = useInternalTranslate();

  const { state, styles, close } = useInternalAlertContext('Alert.Close');
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
