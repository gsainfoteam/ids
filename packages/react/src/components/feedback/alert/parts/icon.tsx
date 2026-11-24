'use client';

import { statusIcons } from '../../../../internal/lib/status-palette';
import { Slot } from '../../../utility/slot';
import { useInternalAlertContext } from '../context';
import { resolve, type PartProps } from '../lib/part-props';

export type AlertIconProps = PartProps<'span'>;

export function AlertIcon({
  asChild,
  className,
  children,
  hidden: _hidden,
  ...props
}: AlertIconProps) {
  const { state, styles } = useInternalAlertContext('Alert.Icon');
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
