import { fieldAction, fieldTrigger } from '../../../internal/field-surface';
import { cn, tv } from '../../../utils';

import type { FileFieldVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

const alreadyDimmedByField = cn('data-disabled:opacity-100');

export const fileFieldStyle = tv({
  slots: {
    root: 'relative grid min-w-0 gap-2',
    control: ['relative', fieldTrigger.base],
    trigger: [
      'flex min-w-0 cursor-pointer touch-manipulation items-center text-start text-(--ids-color-on-surface)',
      'disabled:cursor-not-allowed aria-disabled:cursor-default',
    ],
    icon: 'shrink-0 text-(--ids-color-on-muted)',
    thumb: [
      'flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-indicator',
      'text-(--ids-color-on-muted) [&_img]:size-full [&_img]:object-cover [&_svg]:size-3.5',
    ],
    value: 'min-w-0 flex-1 truncate data-placeholder:text-(--ids-color-on-muted)',
    clear: [fieldAction.base, alreadyDimmedByField],
    dropzoneIcon: 'mb-1 size-6 text-(--ids-color-on-muted)',
    dropzoneTitle: 'font-medium break-keep text-balance',
    dropzoneHint: 'text-caption-c1-regular text-(--ids-color-on-muted) break-keep text-balance',
    list: 'flex flex-col gap-1',
    item: 'bg-(--ids-color-surface) dark:bg-(--ids-color-muted)/30',
    preview: 'text-(--ids-color-on-muted)',
    itemSize: 'text-caption-c1-regular',
    itemRemove: fieldAction.base,
    rejections: 'grid gap-0.5 wrap-anywhere text-(--ids-color-danger)',
  },
  variants: {
    appearance: {
      field: { trigger: 'h-full flex-1 self-stretch bg-transparent outline-none' },
      dropzone: {
        trigger: [
          'min-h-32 w-full flex-col justify-center gap-1 text-center concentric-p-4',
          'border border-dashed focus-ring',
          'transition-[color,background-color,border-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
          'data-dragging:border-(--ids-color-primary) data-dragging:bg-(--ids-color-primary)/5',
          'aria-invalid:border-(--ids-color-danger)',
          'disabled:opacity-50',
        ],
      },
    },
    variant: {
      outline: {},
      soft: {},
      ghost: {},
    } satisfies Record<FileFieldVariant, object>,
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
  compoundVariants: [
    { appearance: 'field', variant: 'outline', class: { control: fieldTrigger.variant.outline } },
    { appearance: 'field', variant: 'soft', class: { control: fieldTrigger.variant.soft } },
    { appearance: 'field', variant: 'ghost', class: { control: fieldTrigger.variant.ghost } },
    {
      appearance: 'field',
      size: 'standard',
      class: {
        control: 'h-(--ids-size-control-standard) rounded-standard',
        trigger: 'gap-2 px-3',
      },
    },
    {
      appearance: 'field',
      size: 'tiny',
      class: {
        control: 'h-(--ids-size-control-tiny) rounded-standard',
        trigger: 'gap-1.5 px-2.5',
      },
    },
    {
      appearance: 'dropzone',
      variant: 'outline',
      class: {
        trigger:
          'border-(--ids-color-border) hover:bg-(--ids-color-muted) active:bg-(--ids-color-muted-hover)',
      },
    },
    {
      appearance: 'dropzone',
      variant: 'soft',
      class: {
        trigger: [
          'border-transparent bg-(--ids-color-muted)',
          'hover:bg-(--ids-color-muted-hover) active:bg-(--ids-color-muted-active)',
        ],
      },
    },
    {
      appearance: 'dropzone',
      variant: 'ghost',
      class: {
        trigger:
          'border-transparent hover:bg-(--ids-color-muted) active:bg-(--ids-color-muted-hover)',
      },
    },
  ],
  defaultVariants: { appearance: 'field', variant: 'outline', size: 'standard' },
});
