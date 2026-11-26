'use client';

import { type ComponentType, type ComponentProps } from 'react';

import { registerPartAlias } from '../../../navigation/stepper/lib/is-type';
import { StepBody, type StepBodyProps } from '../../../navigation/stepper/parts/body';
import {
  StepDescription,
  type StepDescriptionProps,
} from '../../../navigation/stepper/parts/description';
import {
  StepIndicator,
  type StepIndicatorProps,
} from '../../../navigation/stepper/parts/indicator';
import { StepItem } from '../../../navigation/stepper/parts/item';
import {
  StepSeparator,
  type StepSeparatorProps,
} from '../../../navigation/stepper/parts/separator';
import { StepTitle, type StepTitleProps } from '../../../navigation/stepper/parts/title';

import type { StateRenderProps } from '../../../../internal/lib/state-props';
import type { TimelineStatus } from '../../../navigation/stepper/lib/step-state';

export type TimelineItemState = { index: number; status: TimelineStatus; last: boolean };

export type TimelineItemProps = Omit<ComponentProps<'li'>, 'children' | 'className' | 'style'> &
  StateRenderProps<TimelineItemState> & {
    status?: TimelineStatus;
  };
export type TimelineIndicatorProps = StepIndicatorProps<TimelineItemState>;
export type TimelineTitleProps = StepTitleProps<TimelineItemState>;
export type TimelineDescriptionProps = StepDescriptionProps<TimelineItemState>;
export type TimelineBodyProps = StepBodyProps<TimelineItemState>;
export type TimelineSeparatorProps = StepSeparatorProps<TimelineItemState>;

function renamedPart<P extends object>(Part: unknown, displayName: string) {
  const Shared = Part as ComponentType<P>;

  function Renamed(props: P) {
    return <Shared {...props} />;
  }
  Renamed.displayName = displayName;
  registerPartAlias(Renamed, Part);

  return Renamed;
}

export const TimelineItem = renamedPart<TimelineItemProps>(StepItem, 'Timeline.Item');
export const TimelineIndicator = renamedPart<TimelineIndicatorProps>(
  StepIndicator,
  'Timeline.Indicator',
);
export const TimelineTitle = renamedPart<TimelineTitleProps>(StepTitle, 'Timeline.Title');
export const TimelineDescription = renamedPart<TimelineDescriptionProps>(
  StepDescription,
  'Timeline.Description',
);
export const TimelineBody = renamedPart<TimelineBodyProps>(StepBody, 'Timeline.Body');
export const TimelineSeparator = renamedPart<TimelineSeparatorProps>(
  StepSeparator,
  'Timeline.Separator',
);
