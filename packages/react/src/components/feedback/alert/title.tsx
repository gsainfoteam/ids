'use client';

import { useAlertContext } from './context';
import { resolve, type PartProps } from './part-props';
import { Slot } from '../../utility/slot';

export type AlertTitleProps = PartProps<'div'>;

export function AlertTitle({ asChild, className, ...props }: AlertTitleProps) {
  const { state, styles } = useAlertContext('Alert.Title');
  const Root = asChild ? Slot : 'div';
  return (
    <Root
      {...props}
      data-alert-title=""
      className={styles.title({ className: resolve(className, state) })}
    />
  );
}

AlertTitle.displayName = 'Alert.Title';
