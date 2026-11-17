import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export type QuestionnaireOrientation = 'vertical' | 'horizontal';

export type QuestionnaireAppearance = 'card' | 'toggle';

export const questionnaireStyle = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-5',
    progress: 'gap-1.5',
    question: 'flex flex-col gap-3',
    legend: 'mb-2 p-0 text-on-surface',
    description: 'text-neutral',
    options: 'flex gap-2',
    toggles: 'flex-wrap [&>[data-toggle-group-item]]:flex-initial',
    option: 'cursor-pointer rounded-standard has-disabled:cursor-not-allowed',
    other: 'w-full',
    navigation: 'w-full flex-wrap justify-end',
    previous: 'me-auto',
  },
  variants: {
    orientation: {
      vertical: { options: 'flex-col' },
      horizontal: { options: 'w-full flex-row flex-wrap', option: 'w-auto', other: 'basis-full' },
    } satisfies Record<QuestionnaireOrientation, object>,
    size: {
      standard: {
        legend: 'text-body-b1-semibold',
        description: 'text-body-b3-regular -mt-2',
        option: 'min-h-(--ids-size-control-standard) px-4 py-2',
        other: 'px-4',
      },
      tiny: {
        root: 'gap-4',
        legend: 'text-body-b2-semibold',
        description: 'text-body-b3-regular -mt-2',
        option: 'min-h-(--ids-size-control-tiny) px-3 py-1.5',
        other: 'px-3',
      },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { orientation: 'vertical', size: 'standard' },
});
