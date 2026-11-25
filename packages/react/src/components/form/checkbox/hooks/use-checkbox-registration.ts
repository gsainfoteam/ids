'use client';

import { useLayoutEffect } from 'react';

type Register = (option: string, inputId: string, disabled: boolean) => () => void;

export function useInternalCheckboxRegistration({
  register,
  option,
  inputId,
  disabled,
}: {
  register: Register | undefined;
  option: string;
  inputId: string | undefined;
  disabled: boolean;
}) {
  useLayoutEffect(() => {
    if (register && inputId) return register(option, inputId, disabled);
  }, [register, option, inputId, disabled]);
}
