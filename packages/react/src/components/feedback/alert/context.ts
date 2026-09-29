import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { Alert } from '.';
import type { alertStyle } from './style';

type Context = {
  state: Alert.State;
  styles: ReturnType<typeof alertStyle>;
  close: () => void;
};

export const AlertContext = createContext<Context | null>(null);

export function useAlertContext(part: string) {
  const context = use(AlertContext);
  invariant(context, `${part} must be rendered inside Alert.`);
  return context;
}
