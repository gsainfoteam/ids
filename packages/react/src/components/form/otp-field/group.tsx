import { type ComponentProps } from 'react';

import { GroupContext, useOTPContext } from './context';

export type OTPFieldGroupProps = ComponentProps<'div'>;

export function OTPFieldGroup({ className, ...props }: OTPFieldGroupProps) {
  const { styles } = useOTPContext('OTPField.Group');
  return (
    <GroupContext value={true}>
      <div {...props} data-otp-group="" className={styles.group({ className })} />
    </GroupContext>
  );
}

OTPFieldGroup.displayName = 'OTPField.Group';
