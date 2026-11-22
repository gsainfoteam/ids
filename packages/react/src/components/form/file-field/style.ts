import { fieldAction, fieldTrigger } from '../../../internal/surfaces/field-surface';
import { cn, tv } from '../../../utils';

import type { FileFieldVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

const alreadyDimmedByField = cn('data-disabled:opacity-100');

const ownTriggerLook = cn(
  'flex min-w-0 cursor-pointer items-center text-start text-neutral-strong',
);

export const fileFieldStyle = tv({
  slots: {
    root: 'relative grid min-w-0 gap-2',
    control: ['relative', fieldTrigger.base],
    trigger: 'touch-manipulation disabled:cursor-not-allowed aria-disabled:cursor-default',
    icon: 'shrink-0 text-neutral',
    thumb: [
      'flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-indicator',
      'text-neutral [&_img]:size-full [&_img]:object-cover [&_svg]:size-3.5',
    ],
    value: 'min-w-0 flex-1 truncate data-placeholder:text-neutral',
    clear: [fieldAction.base, alreadyDimmedByField],
    dropzoneIcon: 'mb-1 size-6 text-neutral',
    dropzoneTitle: 'font-medium break-keep text-balance',
    dropzoneHint: 'text-caption-c1-regular text-neutral break-keep text-balance',
    list: 'flex flex-col gap-1',
    item: 'bg-surface',
    preview: 'text-neutral',
    itemSize: 'text-caption-c1-regular',
    itemRemove: fieldAction.base,
    rejections: 'grid gap-0.5 wrap-anywhere text-danger',
  },
  variants: {
    appearance: {
      field: {
        trigger: [ownTriggerLook, 'h-full flex-1 self-stretch bg-transparent outline-none'],
      },
      dropzone: {
        trigger: [
          ownTriggerLook,
          'min-h-32 w-full flex-col justify-center gap-1 text-center concentric-p-4',
          'border border-dashed focus-ring',
          'transition-[color,background-color,border-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
          'data-dragging:border-primary-strong data-dragging:bg-primary-soft',
          'data-dragging:text-on-primary-soft',
          'aria-invalid:border-danger-strong',
          'disabled:opacity-50',
        ],
      },
      embedded: {},
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
        trigger: 'border-neutral state-layer hover:state-hover active:state-press',
      },
    },
    {
      appearance: 'dropzone',
      variant: 'soft',
      class: {
        trigger: [
          'border-transparent bg-neutral-soft',
          'state-layer hover:state-hover active:state-press',
        ],
      },
    },
    {
      appearance: 'dropzone',
      variant: 'ghost',
      class: {
        trigger: 'border-transparent state-layer hover:state-hover active:state-press',
      },
    },
  ],
  defaultVariants: { appearance: 'field', variant: 'outline', size: 'standard' },
});
