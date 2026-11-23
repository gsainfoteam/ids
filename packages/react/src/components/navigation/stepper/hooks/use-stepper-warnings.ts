'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

import type { Stepper } from '..';

const PROGRESS_ONLY_PROPS = ['value', 'defaultValue', 'onValueChange', 'linear'] as const;

type StepperWarningsOptions = {
  props: Stepper.Props;
  progress: boolean;
  current: number;
  count: number;
  strayCount: number;
};

export function useInternalStepperWarnings({
  props,
  progress,
  current,
  count,
  strayCount,
}: StepperWarningsOptions) {
  const ignoredInARecord = progress
    ? ''
    : PROGRESS_ONLY_PROPS.filter((name) => props[name] !== undefined).join(', ');
  const unnamedRecord =
    !progress && props['aria-label'] === undefined && props['aria-labelledby'] === undefined;

  useEffect(() => {
    if (!isDevelopment || !progress) return;
    if (current < 0 || current > count)
      console.warn(
        `[IDS] Stepper: value=${current} is outside the ${count} steps (0 to ${count}, where ${count} means every step is completed).`,
      );
  }, [progress, current, count]);

  useEffect(() => {
    if (!isDevelopment || strayCount === 0) return;
    console.warn(
      '[IDS] Stepper: only Stepper.Item and Stepper.Content can be children. A step wrapped in your own component is not counted; render Stepper.Item directly.',
    );
  }, [strayCount]);

  useEffect(() => {
    if (!isDevelopment || ignoredInARecord === '') return;
    console.warn(
      `[IDS] Stepper: progress={false} lists events with no current step and ignores ${ignoredInARecord}. Mark an event with Stepper.Item completed or error instead.`,
    );
  }, [ignoredInARecord]);

  useEffect(() => {
    if (isDevelopment && unnamedRecord)
      console.warn(
        '[IDS] Stepper: progress={false} has no default list name, since "Progress" does not describe a record of events. Pass aria-label or aria-labelledby, such as aria-label="Recent activity".',
      );
  }, [unnamedRecord]);
}
