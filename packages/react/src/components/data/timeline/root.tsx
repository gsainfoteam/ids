'use client';

import { useId } from 'react';

import { noop } from 'es-toolkit';

import { TimelineItem } from './parts/parts';
import { timelineStyle } from './style';
import { useInternalRequiredName } from '../../../internal/lib/accessible-name';
import { resolveState } from '../../../internal/lib/state-props';
import { flattenFragments } from '../../../utils';
import { useInternalStrayStepWarning } from '../../navigation/stepper/hooks/use-stepper-warnings';
import { sortSteps } from '../../navigation/stepper/lib/steps';
import { StepList } from '../../navigation/stepper/parts/step-list';

import type { Timeline } from '.';

const NO_CURRENT_EVENT = -1;

export function TimelineRoot(props: Timeline.Props) {
  const {
    orientation = 'vertical',
    size = 'standard',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    className,
    style,
    children,
    ...rest
  } = props;

  const id = useId();
  const state: Timeline.State = { orientation };
  const { steps, others, strayCount } = sortSteps(
    flattenFragments(resolveState(children, state)),
    TimelineItem,
  );

  useInternalStrayStepWarning('Timeline', 'Timeline.Item', strayCount);
  useInternalRequiredName('Timeline', {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
  });

  const styles = timelineStyle({ orientation, size });

  return (
    <StepList
      {...rest}
      context={{
        name: 'Timeline',
        id,
        value: NO_CURRENT_EVENT,
        count: steps.length,
        orientation,
        linear: false,
        progress: false,
        disabled: false,
        interactive: false,
        styles,
        select: noop,
        tabStop: undefined,
        onTriggerFocus: noop,
        onTriggerKeyDown: noop,
      }}
      steps={steps}
      others={others}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      data-size={size}
      className={styles.root({ className: resolveState(className, state) })}
      style={resolveState(style, state)}
    />
  );
}
