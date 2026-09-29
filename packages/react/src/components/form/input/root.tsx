'use client';

import { useEffect } from 'react';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import { useTranslate } from '../../../internal/translate';
import { isDevelopment } from '../../../utils/dev';
import { NumberField, type NumberFieldProps } from '../number-field';
import { PasswordField, type PasswordFieldProps } from '../password-field';
import { TelField, type TelFieldProps } from '../tel-field';
import { TextField } from '../text-field';

type TextInputProps = Omit<TextField.Props, 'type'> & {
  type?: 'text' | 'email' | 'url' | 'search';
};

export type InputProps =
  | TextInputProps
  | ({ type: 'number' } & NumberFieldProps)
  | ({ type: 'password' } & PasswordFieldProps)
  | ({ type: 'tel' } & TelFieldProps);

const SUPPORTED = ['text', 'email', 'url', 'search', 'number', 'password', 'tel'];

const leaveAddressesAsTyped = {
  autoCapitalize: 'none',
  autoCorrect: 'off',
  spellCheck: false,
} as const;

export function InputRoot(props: InputProps) {
  const t = useTranslate();

  const { type = 'text' } = props;
  const supported = SUPPORTED.includes(type);
  useEffect(() => {
    if (isDevelopment && !supported)
      console.warn(
        `[IDS] Input: unsupported type "${type}"; using text. Use the dedicated field for dates, times, colors, files and OTP.`,
      );
  }, [supported, type]);

  if (props.type === 'number') {
    const { type: _type, ...rest } = props;
    return <NumberField {...rest} />;
  }
  if (props.type === 'password') {
    const { type: _type, ...rest } = props;
    return <PasswordField {...rest} />;
  }
  if (props.type === 'tel') {
    const { type: _type, ...rest } = props;
    return <TelField {...rest} />;
  }
  const { type: _type, children, ...rest } = props;
  if (type === 'search')
    return (
      <TextField enterKeyHint="search" {...rest} type="search">
        {children ?? (
          <>
            <MagnifyingGlassIcon />
            <TextField.Input />
            <TextField.Clear aria-label={t('input.clearSearch')} />
          </>
        )}
      </TextField>
    );
  const hints = type === 'email' || type === 'url' ? leaveAddressesAsTyped : undefined;
  return (
    <TextField {...hints} {...rest} type={supported ? type : 'text'}>
      {children}
    </TextField>
  );
}
