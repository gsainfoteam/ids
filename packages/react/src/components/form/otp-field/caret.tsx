'use client';

import { type ComponentProps } from 'react';

import { useOTPContext } from './context';
import { cn } from '../../../utils';

export type OTPFieldCaretProps = ComponentProps<'span'>;

export function OTPFieldCaret({ className, ...props }: OTPFieldCaretProps) {
  const { styles } = useOTPContext('OTPField.Caret');
  return (
    <span {...props} className={styles.caret()}>
      <span className={cn(styles.caretLine(), className)} />
    </span>
  );
}

OTPFieldCaret.displayName = 'OTPField.Caret';
