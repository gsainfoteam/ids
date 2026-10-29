'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { ArrowBigUpDash } from 'lucide-react';

import { usePasswordContext } from './context';
import { useTranslate } from '../../../internal/translate';

export type PasswordFieldCapsLockProps = Omit<ComponentProps<'span'>, 'children'> & {
  label?: string;
  children?: ReactNode;
};

function AlwaysMountedStatus({ children }: { children: string }) {
  return (
    <span role="status" className="sr-only">
      {children}
    </span>
  );
}

export function PasswordFieldCapsLock({
  label,
  className,
  children,
  ...props
}: PasswordFieldCapsLockProps) {
  const t = useTranslate();

  const { capsLock, styles } = usePasswordContext('CapsLock');
  const text = label ?? t('passwordField.capsLock');
  return (
    <>
      {capsLock && (
        <span
          {...props}
          aria-hidden="true"
          title={text}
          data-password-field-caps-lock=""
          className={styles.capsLock({ className })}
        >
          {children ?? <ArrowBigUpDash />}
        </span>
      )}
      <AlwaysMountedStatus>{capsLock ? text : ''}</AlwaysMountedStatus>
    </>
  );
}

PasswordFieldCapsLock.displayName = 'PasswordField.CapsLock';
