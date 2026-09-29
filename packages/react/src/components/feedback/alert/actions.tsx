import { useAlertContext } from './context';
import { resolve, type PartProps } from './part-props';
import { Slot } from '../../utility/slot';

export type AlertActionsProps = PartProps<'div'>;

export function AlertActions({ asChild, className, ...props }: AlertActionsProps) {
  const { state, styles } = useAlertContext('Alert.Actions');
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
