'use client';

import { type ComponentProps, type ReactNode, type SVGProps } from 'react';

import { usePasswordContext } from './context';
import { useTranslate } from '../../../internal/translate';

export type PasswordFieldCapsLockProps = Omit<ComponentProps<'span'>, 'children'> & {
  label?: string;
  children?: ReactNode;
};

function CapsLockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path strokeLinejoin="round" d="M12 3.75 4.5 11.25h3.75v4.5h7.5v-4.5h3.75L12 3.75Z" />
      <path strokeLinecap="round" d="M8.25 19.5h7.5" />
    </svg>
  );
}

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
          {children ?? <CapsLockIcon />}
        </span>
      )}
      <AlwaysMountedStatus>{capsLock ? text : ''}</AlwaysMountedStatus>
    </>
  );
}

PasswordFieldCapsLock.displayName = 'PasswordField.CapsLock';
