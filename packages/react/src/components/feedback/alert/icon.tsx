import { useAlertContext } from './context';
import { resolve, type PartProps } from './part-props';
import { statusIcons } from '../../../internal/status-palette';
import { Slot } from '../../utility/slot';

export type AlertIconProps = PartProps<'span'>;

export function AlertIcon({
  asChild,
  className,
  children,
  hidden: _hidden,
  ...props
}: AlertIconProps) {
  const { state, styles } = useAlertContext('Alert.Icon');
  const Glyph = statusIcons[state.colorScheme];
  const Root = asChild ? Slot : 'span';
  return (
    <Root
      aria-hidden="true"
      {...props}
      data-alert-icon=""
      className={styles.icon({ className: resolve(className, state) })}
    >
      {children ?? <Glyph />}
    </Root>
  );
}

AlertIcon.displayName = 'Alert.Icon';
