import { tv } from '../../../utils';

import type { ItemGroupVariant, ItemVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

export const itemStyle = tv({
  slots: {
    root: [
      'group/item relative isolate flex w-full min-w-0 items-center text-start text-(--ids-color-on-surface)',
      'before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit]',
      'before:bg-(--ids-color-on-surface) before:opacity-0',
      'before:transition-opacity before:duration-(--ids-motion-fast) motion-reduce:before:transition-none',
      'data-selected:before:opacity-6',
    ],
    media: [
      'flex shrink-0 items-center justify-center gap-2 text-(--ids-color-on-muted)',
      '[&_img]:object-cover',
      "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-(--ids-size-icon-standard)",
    ],
    content: 'flex min-w-0 flex-1 flex-col gap-0.5 [&+[data-item-content]]:flex-none',
    title: 'flex w-fit items-center gap-2',
    description: 'line-clamp-2 text-(--ids-color-on-muted)',
    actions: [
      'ms-auto flex shrink-0 items-center gap-2',
      "[&>svg]:pointer-events-none [&>svg:not([class*='text-'])]:text-(--ids-color-on-muted) [&>svg:not([class*='size-'])]:size-(--ids-size-icon-standard)",
    ],
    group: 'flex min-w-0 flex-col',
    groupItem: 'flex',
  },
  variants: {
    groupVariant: {
      bordered: {
        group: 'divide-y divide-(--ids-color-border) [&>li>[data-item]]:rounded-none',
      },
      separated: { group: 'gap-2' },
      ghost: {},
    } satisfies Record<ItemGroupVariant, object>,
    variant: {
      ghost: {},
      outline: { root: 'inset-ring-1 inset-ring-(--ids-color-border)' },
      soft: { root: 'bg-(--ids-color-muted)' },
    } satisfies Record<ItemVariant, object>,
    media: {
      ghost: {},
      soft: { media: 'rounded-standard bg-(--ids-color-muted) text-(--ids-color-on-surface)' },
      outline: {
        media:
          'rounded-standard inset-ring-1 inset-ring-(--ids-color-border) text-(--ids-color-on-surface)',
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
          'data-hovered:before:opacity-4 data-active:before:opacity-8',
          'data-selected:data-hovered:before:opacity-10',
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
    groupVariant: 'ghost',
    variant: 'ghost',
    media: 'ghost',
    size: 'standard',
    truncate: false,
    interactive: false,
  },
});
