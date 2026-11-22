import { fieldAction, fieldTrigger } from '../../../internal/surfaces/field-surface';
import { cn, tv } from '../../../utils';

import type { FileFieldVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

const alreadyDimmedByField = cn('data-disabled:opacity-100');

export const ownTriggerLook = cn(
  'flex min-w-0 cursor-pointer items-center text-start text-neutral-strong',
);

export const filePartsStyle = tv({
  slots: {
    root: 'relative grid min-w-0 gap-2',
    trigger: 'touch-manipulation disabled:cursor-not-allowed aria-disabled:cursor-default',
    icon: 'shrink-0 text-neutral',
    thumb: [
      'flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-indicator',
      'text-neutral [&_img]:size-full [&_img]:object-cover [&_svg]:size-3.5',
    ],
    value: 'min-w-0 flex-1 truncate data-placeholder:text-neutral',
    clear: [fieldAction.base, alreadyDimmedByField],
    list: 'flex flex-col gap-1',
    item: 'bg-surface',
    preview: 'text-neutral',
    itemSize: 'text-caption-c1-regular',
    itemRemove: fieldAction.base,
    rejections: 'grid gap-0.5 wrap-anywhere text-danger',
  },
  variants: {
    size: {
      standard: {
        root: 'text-body-b3-regular',
        clear: fieldAction.unpadded.standard,
        itemRemove: 'size-7',
        icon: fieldTrigger.icon.standard,
        rejections: 'text-body-b3-regular',
      },
      tiny: {
        root: 'text-caption-c1-regular',
        clear: fieldAction.unpadded.tiny,
        itemRemove: 'size-6',
        icon: fieldTrigger.icon.tiny,
        rejections: 'text-caption-c1-regular',
      },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { size: 'standard' },
});

export const fileFieldStyle = tv({
  extend: filePartsStyle,
  slots: {
    control: ['relative', fieldTrigger.base],
    trigger: [ownTriggerLook, 'h-full flex-1 self-stretch bg-transparent outline-none'],
  },
  variants: {
    variant: {
      outline: { control: fieldTrigger.variant.outline },
      soft: { control: fieldTrigger.variant.soft },
      ghost: { control: fieldTrigger.variant.ghost },
    } satisfies Record<FileFieldVariant, object>,
    size: {
      standard: {
        control: 'h-(--ids-size-control-standard) rounded-standard',
        trigger: 'gap-2 px-3',
      },
      tiny: {
        control: 'h-(--ids-size-control-tiny) rounded-standard',
        trigger: 'gap-1.5 px-2.5',
      },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { variant: 'outline', size: 'standard' },
});
