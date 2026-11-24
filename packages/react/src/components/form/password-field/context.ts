'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { PasswordFieldState } from '.';
import type { useInternalPasswordField } from './hooks/use-password-field';
import type { passwordFieldStyle } from './style';

type PasswordFieldContextValue = {
  inputProps: ReturnType<typeof useInternalPasswordField>['inputProps'];
  state: PasswordFieldState;
  capsLock: boolean;
  toggle: (byPointer: boolean) => void;
  styles: ReturnType<typeof passwordFieldStyle>;
};

export const PasswordFieldContext = createContext<PasswordFieldContextValue | null>(null);

export function useInternalPasswordContext(part: string) {
  const context = use(PasswordFieldContext);
  invariant(
    context != null,
    `\`<PasswordField.${part}>\` must be used inside \`<PasswordField>\`.`,
  );
  return context;
}
