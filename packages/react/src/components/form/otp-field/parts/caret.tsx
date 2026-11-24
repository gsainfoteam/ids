'use client';

import { type ComponentProps } from 'react';

import { cn } from '../../../../utils';
import { useInternalOTPContext } from '../context';

export type OTPFieldCaretProps = ComponentProps<'span'>;

export function OTPFieldCaret({ className, ...props }: OTPFieldCaretProps) {
  const { styles } = useInternalOTPContext('OTPField.Caret');
  return (
    <span {...props} className={styles.caret()}>
      <span className={cn(styles.caretLine(), className)} />
    </span>
  );
}

OTPFieldCaret.displayName = 'OTPField.Caret';
