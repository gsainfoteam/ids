'use client';

import type { RefObject } from 'react';

import { noop } from 'es-toolkit';

export type FormValueProps = {
  name?: string;
  form?: string;
  value: string | readonly string[] | null | undefined;
  required?: boolean;
  disabled?: boolean;
  anchor: RefObject<HTMLElement | null>;
  message?: string;
};

const readOnlyWouldBarValidation = noop;

export function FormValue({
  name,
  form,
  value,
  required,
  disabled,
  anchor,
  message,
}: FormValueProps) {
  const values = value == null ? [] : typeof value === 'string' ? [value] : [...value];
  const filled = values.filter((entry) => entry !== '');
  const missing = message !== undefined && filled.length === 0 ? message : '';
  const passFocusToControlOnceTheBrowserHasReported = () =>
    requestAnimationFrame(() => anchor.current?.focus());

  return (
    <>
      {name != null &&
        filled.map((entry, index) => (
          <input
            key={`${index}:${entry}`}
            type="hidden"
            name={name}
            form={form}
            value={entry}
            disabled={disabled}
          />
        ))}
      {required && !disabled && (
        <input
          ref={(node) => node?.setCustomValidity(missing)}
          aria-hidden="true"
          tabIndex={-1}
          required
          form={form}
          value={filled.join(',')}
          onChange={readOnlyWouldBarValidation}
          onFocus={passFocusToControlOnceTheBrowserHasReported}
          data-form-value-validator=""
          className="pointer-events-none absolute inset-0 size-full opacity-0"
        />
      )}
    </>
  );
}
