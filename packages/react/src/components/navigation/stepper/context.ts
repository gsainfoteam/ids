'use client';

import { createContext, use, type KeyboardEvent } from 'react';

import { invariant } from '../../../utils';

import type { StepItemState } from './parts/item';
import type { StepperOrientation } from './root';
import type { stepPartsStyle } from './style';

export type StepsName = 'Stepper' | 'Timeline';

export type StepsContextValue = {
  name: StepsName;
  id: string;
  value: number;
  count: number;
  orientation: StepperOrientation;
  linear: boolean;
  progress: boolean;
  disabled: boolean;
  interactive: boolean;
  styles: ReturnType<typeof stepPartsStyle>;
  select: (index: number) => void;
  tabStop: string | null | undefined;
  onTriggerFocus: (value: string) => void;
  onTriggerKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
};

type ItemContext = {
  state: StepItemState;
  reachable: boolean;
  hasTitle: boolean;
  hasDescription: boolean;
  ids: { trigger: string; title: string; description: string; status: string };
};

export const StepperContext = createContext<StepsContextValue | null>(null);
export const StepperIndexContext = createContext<number | null>(null);
export const StepperItemContext = createContext<ItemContext | null>(null);

export function useInternalRootContext(part: string) {
  const context = use(StepperContext);
  invariant(
    context,
    `\`<Stepper.${part}>\` and \`<Timeline.${part}>\` must be used inside \`<Stepper>\` or \`<Timeline>\`.`,
  );
  return context;
}

export function useInternalItemContext(part: string) {
  const context = use(StepperItemContext);
  invariant(
    context,
    `\`<Stepper.${part}>\` and \`<Timeline.${part}>\` must be used inside \`<Stepper.Item>\` or \`<Timeline.Item>\`.`,
  );
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
