'use client';

import { createContext, use, type KeyboardEvent } from 'react';

import { invariant } from '../../../utils';

import type { StepperItemState } from './item';
import type { StepperOrientation } from './root';
import type { stepperStyle } from './style';

type RootContext = {
  id: string;
  value: number;
  count: number;
  orientation: StepperOrientation;
  linear: boolean;
  progress: boolean;
  disabled: boolean;
  interactive: boolean;
  styles: ReturnType<typeof stepperStyle>;
  select: (index: number) => void;
  tabStop: string | null | undefined;
  onTriggerFocus: (value: string) => void;
  onTriggerKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
};

type ItemContext = {
  state: StepperItemState;
  reachable: boolean;
  hasTitle: boolean;
  hasDescription: boolean;
  ids: { trigger: string; title: string; description: string; status: string };
};

export const StepperContext = createContext<RootContext | null>(null);
export const StepperIndexContext = createContext<number | null>(null);
export const StepperItemContext = createContext<ItemContext | null>(null);

export function useRootContext(part: string) {
  const context = use(StepperContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Stepper>\`.`);
  return context;
}

export function useItemContext(part: string) {
  const context = use(StepperItemContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Stepper.Item>\`.`);
  return context;
}

export function stepIds(rootId: string, index: number) {
  const step = `${rootId}-step-${index}`;
  return {
    trigger: `${step}-trigger`,
    title: `${step}-title`,
    description: `${step}-description`,
    status: `${step}-status`,
  };
}
