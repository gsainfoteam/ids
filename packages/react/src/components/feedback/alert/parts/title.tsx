'use client';

import { Slot } from '../../../utility/slot';
import { useInternalAlertContext } from '../context';
import { resolve, type PartProps } from '../lib/part-props';

export type AlertTitleProps = PartProps<'div'>;

export function AlertTitle({ asChild, className, ...props }: AlertTitleProps) {
  const { state, styles } = useInternalAlertContext('Alert.Title');
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
