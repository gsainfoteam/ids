'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { ArrowBigUpDash } from 'lucide-react';

import { useInternalPasswordContext } from '../context';

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
  const { capsLock, styles } = useInternalPasswordContext('CapsLock');

  return (
    <>
      {capsLock && (
        <span
          {...props}
          aria-hidden="true"
          title={label}
          data-password-field-caps-lock=""
          className={styles.capsLock({ className })}
        >
          {children ?? <ArrowBigUpDash />}
        </span>
      )}
      <AlwaysMountedStatus>{capsLock ? (label ?? '') : ''}</AlwaysMountedStatus>
    </>
  );
}

PasswordFieldCapsLock.displayName = 'PasswordField.CapsLock';
