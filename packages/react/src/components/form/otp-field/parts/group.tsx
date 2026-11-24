'use client';

import { type ComponentProps } from 'react';

import { GroupContext, useInternalOTPContext } from '../context';

export type OTPFieldGroupProps = ComponentProps<'div'>;

export function OTPFieldGroup({ className, ...props }: OTPFieldGroupProps) {
  const { styles } = useInternalOTPContext('OTPField.Group');
  return (
    <GroupContext value={true}>
      <div {...props} data-otp-group="" className={styles.group({ className })} />
    </GroupContext>
  );
}

OTPFieldGroup.displayName = 'OTPField.Group';
