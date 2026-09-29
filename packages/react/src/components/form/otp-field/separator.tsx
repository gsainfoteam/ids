import { type ComponentProps } from 'react';

import { MinusIcon } from '@heroicons/react/16/solid';

import { useOTPContext } from './context';

export type OTPFieldSeparatorProps = ComponentProps<'div'>;

export function OTPFieldSeparator({ className, children, ...props }: OTPFieldSeparatorProps) {
  const { styles } = useOTPContext('OTPField.Separator');
  return (
    <div {...props} aria-hidden="true" className={styles.separator({ className })}>
      {children ?? <MinusIcon />}
    </div>
  );
}

OTPFieldSeparator.displayName = 'OTPField.Separator';
