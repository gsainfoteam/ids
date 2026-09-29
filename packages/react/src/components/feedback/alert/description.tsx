'use client';

import { useAlertContext } from './context';
import { resolve, type PartProps } from './part-props';
import { Slot } from '../../utility/slot';

export type AlertDescriptionProps = PartProps<'div'>;

export function AlertDescription({ asChild, className, ...props }: AlertDescriptionProps) {
  const { state, styles } = useAlertContext('Alert.Description');
  const Root = asChild ? Slot : 'div';
  return (
    <Root
      {...props}
      data-alert-description=""
      className={styles.description({ className: resolve(className, state) })}
    />
  );
}

AlertDescription.displayName = 'Alert.Description';
