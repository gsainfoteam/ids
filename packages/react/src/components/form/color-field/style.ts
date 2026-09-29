import { fieldAction, fieldTrigger } from '../../../internal/field-surface';
import { cn, tv } from '../../../utils';

import type { ColorFieldVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

const alreadyDimmedByField = cn('data-disabled:opacity-100');

export const colorFieldStyle = tv({
  slots: {
    root: ['relative', fieldTrigger.base],
    trigger: [
      'flex h-full min-w-0 flex-1 cursor-pointer items-center self-stretch bg-transparent text-start outline-none',
      'disabled:cursor-not-allowed data-readonly:cursor-default',
    ],
    swatch: [
      'shrink-0 rounded-indicator inset-ring-1 inset-ring-(--ids-color-on-surface)/15',
      'data-empty:bg-[linear-gradient(to_top_right,transparent_calc(50%-0.75px),var(--ids-color-danger)_50%,transparent_calc(50%+0.75px))]',
      'data-empty:inset-ring-(--ids-color-border)',
    ],
    value: [
      'min-w-0 flex-1 truncate font-mono',
      'data-placeholder:font-sans data-placeholder:text-(--ids-color-on-muted)',
    ],
    clear: [fieldAction.base, alreadyDimmedByField],
    popup: 'concentric-p-3',
  },
  variants: {
    variant: {
      outline: { root: fieldTrigger.variant.outline },
      soft: { root: fieldTrigger.variant.soft },
      ghost: { root: fieldTrigger.variant.ghost },
    } satisfies Record<ColorFieldVariant, object>,
    size: {
      standard: {
        root: 'h-(--ids-size-control-standard) rounded-standard text-body-b3-regular',
        trigger: 'gap-2 px-3',
        swatch: 'size-5',
        clear: fieldAction.unpadded.standard,
      },
      tiny: {
        root: 'h-(--ids-size-control-tiny) rounded-standard text-caption-c1-regular',
        trigger: 'gap-1.5 px-2.5',
        swatch: 'size-4',
        clear: fieldAction.unpadded.tiny,
      },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { variant: 'outline', size: 'standard' },
});
