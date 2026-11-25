'use client';

import {
  createContext,
  use,
  type ComponentProps,
  type ComponentType,
  type ReactNode,
  type RefObject,
} from 'react';

import { invariant } from '../../utils';

import type { TemporalFieldApi, TemporalFieldState } from './hooks/use-temporal-field';
import type { TemporalMessages, TemporalPickerApi } from './lib/types';
import type { temporalFieldStyle } from './style';
import type { IdsSize } from '../../tokens/types';
import type { AccessibleName } from '../lib/accessible-name';

export type TemporalContextValue = {
  state: TemporalFieldState<unknown>;
  size: IdsSize;
  hasClear: boolean;
  hasInput: boolean;
  input: Record<string, unknown> | undefined;
  blocked: boolean;
  clear: () => void;
  onBlur: TemporalFieldApi<unknown>['onBlur'];
  trigger: Record<string, unknown>;
  text: string;
  icon: ComponentType<ComponentProps<'svg'>>;
  messages: TemporalMessages;
  content: () => ReactNode;
  picker: TemporalPickerApi<unknown>;
  popup: {
    id: string;
    name: AccessibleName;
    anchor: RefObject<HTMLDivElement | null>;
    preferredWidth: number | undefined;
    initialFocusSelector: string;
  };
  styles: ReturnType<typeof temporalFieldStyle>;
};

export const TemporalContext = createContext<TemporalContextValue | null>(null);

export function useInternalTemporalContext(part: string) {
  const context = use(TemporalContext);
  invariant(context, `${part} must be inside its field.`);
  return context;
}
