import { cn, tv } from '../../../utils';
import { filePartsStyle, ownTriggerLook } from '../file-field/style';

import type { FileDropzoneVariant } from './root';

const pressLayer = cn('state-layer hover:state-hover active:state-press');

export const fileDropzoneStyle = tv({
  extend: filePartsStyle,
  slots: {
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
    dropIcon: 'mb-1 size-6 text-neutral',
    title: 'font-medium break-keep text-balance',
    hint: 'text-caption-c1-regular text-neutral break-keep text-balance',
  },
  variants: {
    variant: {
      outline: { trigger: ['border-neutral', pressLayer] },
      soft: { trigger: ['border-transparent bg-neutral-soft', pressLayer] },
      ghost: { trigger: ['border-transparent', pressLayer] },
    } satisfies Record<FileDropzoneVariant, object>,
  },
  defaultVariants: { variant: 'outline', size: 'standard' },
});
