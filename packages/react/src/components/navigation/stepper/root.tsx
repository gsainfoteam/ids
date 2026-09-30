'use client';

import { isValidElement, useEffect, useId, useRef, type ReactElement } from 'react';

import { StepperContent } from './content';
import { StepperContext, StepperIndexContext } from './context';
import { StepperItem } from './item';
import { flag } from './step-state';
import { stepperStyle } from './style';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { resolveState } from '../../../internal/state-props';
import { useTranslate } from '../../../internal/translate';
import { elementTypeOf, flattenFragments } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { useRovingFocus } from '../../utility/group/use-roving-focus';

import type { Stepper } from '.';

export type StepperOrientation = 'horizontal' | 'vertical';

const NO_CURRENT_STEP = -1;
const PROGRESS_ONLY_PROPS = ['value', 'defaultValue', 'onValueChange', 'linear'] as const;

const isStep = (node: unknown): node is ReactElement =>
  isValidElement(node) && elementTypeOf(node) === StepperItem;

const isStray = (node: unknown) =>
  isValidElement(node) && !isStep(node) && elementTypeOf(node) !== StepperContent;

export function StepperRoot(props: Stepper.Props) {
  const {
    value,
    defaultValue,
    onValueChange,
    orientation = 'horizontal',
    linear = true,
    progress = true,
    size = 'standard',
    disabled = false,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    className,
    style,
    children,
    ...rest
  } = props;

  const t = useTranslate();
  const id = useId();
  const listRef = useRef<HTMLOListElement>(null);
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue: defaultValue ?? 0,
    onValueChange,
  });
  const interactive = progress && (value === undefined || onValueChange !== undefined);
  const shownValue = progress ? current : NO_CURRENT_STEP;

  const state: Stepper.State = { value: shownValue, orientation, disabled, progress };
  const nodes = flattenFragments(resolveState(children, state));
  const steps = nodes.filter(isStep);
  const others = nodes.filter((node) => !isStep(node));
  const count = steps.length;
  const strayCount = others.filter(isStray).length;
  const ignoredInARecord = progress
    ? ''
    : PROGRESS_ONLY_PROPS.filter((name) => props[name] !== undefined).join(', ');
  const unnamedRecord = !progress && ariaLabel === undefined && ariaLabelledBy === undefined;

  const roving = useRovingFocus({
    rootRef: listRef,
    ownItemSelector: `[data-stepper-trigger="${id}"]`,
    orientation,
    loop: false,
    radio: true,
    checked: String(current),
  });

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

  const styles = stepperStyle({ orientation, size, interactive, progress });
  const defaultLabel = progress ? t('stepper.label') : undefined;

  return (
    <StepperContext
      value={{
        id,
        value: shownValue,
        count,
        orientation,
        linear,
        progress,
        disabled,
        interactive,
        styles,
        select: (index) => {
          if (interactive && !disabled) setCurrent(index);
        },
        tabStop: roving.tabStop,
        onTriggerFocus: roving.onItemFocus,
        onTriggerKeyDown: roving.onItemKeyDown,
      }}
    >
      <div
        {...rest}
        data-stepper=""
        data-orientation={orientation}
        data-size={size}
        data-disabled={flag(disabled)}
        className={styles.root({ className: resolveState(className, state) })}
        style={resolveState(style, state)}
      >
        <ol
          ref={listRef}
          aria-label={ariaLabelledBy === undefined ? (ariaLabel ?? defaultLabel) : ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className={styles.list()}
        >
          {steps.map((step, index) => (
            <StepperIndexContext key={step.key ?? index} value={index}>
              {step}
            </StepperIndexContext>
          ))}
        </ol>
        {others}
      </div>
    </StepperContext>
  );
}
