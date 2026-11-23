import { fieldSurface } from '../../../internal/surfaces/field-surface';
import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export type QuestionnaireOrientation = 'vertical' | 'horizontal';

export type QuestionnaireVariant = 'card' | 'toggle';

export const questionnaireStyle = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-4',
    progress: 'flex-row items-center gap-2.5',
    progressTrack: 'w-16',
    progressValue: 'ms-0 text-caption-c1-medium text-neutral',
    question: 'flex min-w-0 flex-col gap-4',
    legend: 'p-0 text-neutral-strong',
    description: 'text-neutral',
    options: 'flex gap-2',
    toggles: 'flex flex-wrap gap-2',
    option: [
      fieldSurface.variant.outline,
      'cursor-pointer items-start rounded-standard',
      'transition-[background-color,box-shadow,--ids-state-opacity] duration-(--ids-motion-fast) motion-reduce:transition-none',
      'state-layer not-has-disabled:hover:state-hover not-has-disabled:active:state-press',
      'has-checked:bg-neutral-soft has-checked:inset-ring-primary-strong',
      'has-disabled:cursor-not-allowed has-disabled:opacity-50',
    ],
    indicator: 'flex h-[1lh] shrink-0 items-center',
    toggle: [
      'data-pressed:bg-primary-soft data-pressed:text-on-primary-soft data-pressed:inset-ring-primary-strong',
    ],
    other: 'w-full',
    navigation: 'w-full',
    navigationItems: 'flex w-full flex-wrap justify-end gap-2',
    previous: 'me-auto',
  },
  variants: {
    orientation: {
      vertical: { options: 'flex-col', toggles: 'flex-col' },
      horizontal: { options: 'w-full flex-row flex-wrap', option: 'w-auto', other: 'basis-full' },
    } satisfies Record<QuestionnaireOrientation, object>,
    size: {
      standard: {
        legend: 'mb-4 text-body-b2-semibold has-[+[data-questionnaire-description]]:mb-1',
        description: 'text-body-b3-regular',
        option: 'min-h-(--ids-size-control-standard) gap-2.5 px-3 py-2',
        indicator: 'text-body-b3-medium',
      },
      tiny: {
        root: 'gap-3',
        question: 'gap-3',
        legend: 'mb-3 text-body-b3-semibold has-[+[data-questionnaire-description]]:mb-0.5',
        description: 'text-caption-c1-regular',
        option: 'min-h-(--ids-size-control-tiny) gap-2 px-2.5 py-1.5',
        indicator: 'text-caption-c1-medium',
      },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { orientation: 'vertical', size: 'standard' },
});
