'use client';

import { createContext } from 'react';

import type { CheckboxState } from '.';
import type { checkboxStyle } from './style';

type Context = {
  state: CheckboxState;
  styles: ReturnType<typeof checkboxStyle>;
};

export const CheckboxContext = createContext<Context | null>(null);
