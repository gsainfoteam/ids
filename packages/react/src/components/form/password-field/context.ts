'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { PasswordFieldState } from '.';
import type { passwordFieldStyle } from './style';
import type { usePasswordField } from './use-password-field';

type PasswordFieldContextValue = {
  inputProps: ReturnType<typeof usePasswordField>['inputProps'];
  state: PasswordFieldState;
  capsLock: boolean;
  toggle: (byPointer: boolean) => void;
  styles: ReturnType<typeof passwordFieldStyle>;
};

export const PasswordFieldContext = createContext<PasswordFieldContextValue | null>(null);

export function usePasswordContext(part: string) {
  const context = use(PasswordFieldContext);
  invariant(
    context != null,
    `\`<PasswordField.${part}>\` must be used inside \`<PasswordField>\`.`,
  );
  return context;
}
