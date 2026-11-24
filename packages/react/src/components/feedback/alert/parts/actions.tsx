'use client';

import { Slot } from '../../../utility/slot';
import { useInternalAlertContext } from '../context';
import { resolve, type PartProps } from '../lib/part-props';

export type AlertActionsProps = PartProps<'div'>;

export function AlertActions({ asChild, className, ...props }: AlertActionsProps) {
  const { state, styles } = useInternalAlertContext('Alert.Actions');
  const Root = asChild ? Slot : 'div';
  return (
    <Root
      {...props}
      data-alert-actions=""
      className={styles.actions({ className: resolve(className, state) })}
    />
  );
}

AlertActions.displayName = 'Alert.Actions';
