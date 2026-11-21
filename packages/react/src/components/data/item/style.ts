import { tv } from '../../../utils';

import type { ItemVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

export const itemStyle = tv({
  slots: {
    root: [
      'group/item relative isolate flex w-full min-w-0 items-center text-start text-neutral-bold',
      'state-layer data-selected:state-press',
      'transition-[--ids-state-opacity] duration-(--ids-motion-fast) motion-reduce:transition-none',
    ],
    media: [
      'flex shrink-0 items-center justify-center gap-2 text-neutral',
      '[&_img]:object-cover',
      "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-(--ids-size-icon-standard)",
    ],
    content: 'flex min-w-0 flex-1 flex-col gap-0.5 [&+[data-item-content]]:flex-none',
    title: 'flex w-fit items-center gap-2',
    description: 'line-clamp-2 text-neutral',
    actions: [
      'ms-auto flex shrink-0 items-center gap-2',
      "[&>svg]:pointer-events-none [&>svg:not([class*='text-'])]:text-neutral [&>svg:not([class*='size-'])]:size-(--ids-size-icon-standard)",
    ],
  },
  variants: {
    variant: {
      ghost: {},
      outline: { root: 'inset-ring-1 inset-ring-neutral' },
      soft: { root: 'bg-neutral-subtle' },
    } satisfies Record<ItemVariant, object>,
    media: {
      ghost: {},
      soft: { media: 'rounded-standard bg-neutral-subtle text-neutral-bold' },
      outline: {
        media: 'rounded-standard inset-ring-1 inset-ring-neutral text-neutral-bold',
      },
    } satisfies Record<ItemVariant, object>,
    size: {
      standard: {
        root: [
          'min-h-14 gap-3 concentric-p-3 [--item-padding:calc(var(--spacing)*3)]',
          '[--item-media-ratio:calc(8/14)] [--item-row-height:calc(var(--spacing)*14)]',
          'has-[[data-item-description]]:[--item-row-height:calc(var(--ids-text-body-b3-medium)*var(--ids-text-body-b3-medium--line-height)+var(--spacing)*0.5+var(--ids-text-body-b3-regular)*var(--ids-text-body-b3-regular--line-height)+var(--spacing)*6)]',
          '[--item-row-largest:calc(var(--ids-text-body-b3-medium)*var(--ids-text-body-b3-medium--line-height)+var(--spacing)*0.5+var(--ids-text-body-b3-regular)*var(--ids-text-body-b3-regular--line-height)+var(--spacing)*6)]',
        ],
        title: 'text-body-b3-medium',
        description: 'text-body-b3-regular',
      },
      tiny: {
        root: [
          'min-h-10 gap-2 concentric-p-2 [--item-padding:calc(var(--spacing)*2)]',
          '[--item-media-ratio:calc(7/11)] [--item-row-height:calc(var(--spacing)*11)]',
          'has-[[data-item-description]]:[--item-row-height:calc(var(--ids-text-caption-c1-medium)*var(--ids-text-caption-c1-medium--line-height)+var(--spacing)*0.5+var(--ids-text-caption-c1-regular)*var(--ids-text-caption-c1-regular--line-height)+var(--spacing)*4)]',
          '[--item-row-largest:calc(var(--ids-text-caption-c1-medium)*var(--ids-text-caption-c1-medium--line-height)+var(--spacing)*0.5+var(--ids-text-caption-c1-regular)*var(--ids-text-caption-c1-regular--line-height)+var(--spacing)*4)]',
        ],
        title: 'text-caption-c1-medium',
        description: 'text-caption-c1-regular',
      },
    } satisfies Record<IdsSize, object>,
    truncate: { true: { title: 'block max-w-full truncate' }, false: {} },
    interactive: {
      true: {
        root: [
          'cursor-pointer select-none focus-ring',
          'not-data-selected:data-hovered:state-hover data-active:state-press',
          'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        ],
      },
      false: {},
    },
  },
  compoundVariants: [
    {
      media: ['soft', 'outline'],
      class: {
        media: [
          'overflow-hidden [&>img]:size-full',
          '[--item-row:min(var(--item-row-height),var(--item-row-largest))]',
          'size-[calc(var(--item-row)*var(--item-media-ratio))]',
          '[--item-media-inset:calc(var(--item-row)*(1-var(--item-media-ratio))/2-var(--item-padding))]',
          'ms-(--item-media-inset) mt-(--item-media-inset) self-start',
          "[&_svg:not([class*='size-'])]:size-[calc(var(--item-row)*var(--item-media-ratio)/2)]",
        ],
      },
    },
  ],
  defaultVariants: {
    variant: 'ghost',
    media: 'ghost',
    size: 'standard',
    truncate: false,
    interactive: false,
  },
});
