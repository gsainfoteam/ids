import { tv } from '../../utils';
import { fieldAction, fieldSurface, type FieldSurfaceVariant } from '../field-surface';

import type { IdsSize } from '../../tokens/types';

export const temporalFieldStyle = tv({
  slots: {
    root: ['relative inline-flex w-full min-w-0 items-center', fieldSurface.base],
    trigger: [
      'flex h-full min-w-0 flex-1 cursor-pointer touch-manipulation items-center self-stretch',
      'bg-transparent text-start outline-none disabled:cursor-not-allowed',
    ],
    icon: 'shrink-0 text-(--ids-color-on-muted)',
    value: 'min-w-0 flex-1 truncate data-placeholder:text-(--ids-color-on-muted)',
    clear: fieldAction.base,
    input: [
      'h-full min-w-0 flex-1 self-stretch bg-transparent outline-none',
      'placeholder:text-(--ids-color-on-muted) disabled:cursor-not-allowed',
    ],
    button: fieldAction.base,
    content: 'flex justify-center',
    panel: 'flex flex-col gap-4 sm:flex-row',
    panelTime: 'flex min-w-0 flex-col gap-2 sm:w-52',
    panelHint: 'text-caption-c1-regular text-(--ids-color-on-muted)',
  },
  variants: {
    variant: {
      outline: { root: fieldSurface.variant.outline },
      soft: { root: fieldSurface.variant.soft },
      ghost: { root: fieldSurface.variant.ghost },
    } satisfies Record<FieldSurfaceVariant, object>,
    size: {
      standard: {
        root: 'h-(--ids-size-control-standard) rounded-standard text-body-b3-regular',
        trigger: 'gap-2 px-3',
        icon: 'size-(--ids-size-icon-standard)',
        clear: fieldAction.unpadded.standard,
        input: 'ps-3',
        button: fieldAction.unpadded.standard,
      },
      tiny: {
        root: 'h-(--ids-size-control-tiny) rounded-standard text-caption-c1-regular',
        trigger: 'gap-1.5 px-2.5',
        icon: 'size-(--ids-size-icon-tiny)',
        clear: fieldAction.unpadded.tiny,
        input: 'ps-2.5',
        button: fieldAction.unpadded.tiny,
      },
    } satisfies Record<IdsSize, object>,
    disabled: {
      true: { root: 'cursor-not-allowed opacity-50' },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'standard',
  },
});
