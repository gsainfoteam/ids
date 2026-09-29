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
      'group-has-[[data-item-description]]/item:self-start [&_img]:object-cover',
      "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-(--ids-size-icon-standard)",
    ],
    content: 'flex min-w-0 flex-1 flex-col gap-0.5 [&+[data-item-content]]:flex-none',
    title: 'flex w-fit items-center gap-2',
    description: 'line-clamp-2 text-(--ids-color-on-muted)',
    actions: 'ms-auto flex shrink-0 items-center gap-2',
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
        root: 'min-h-14 gap-3 concentric-p-3',
        title: 'text-body-b3-medium',
        description: 'text-body-b3-regular',
      },
      tiny: {
        root: 'min-h-10 gap-2 concentric-p-2',
        title: 'text-caption-c1-medium',
        description: 'text-caption-c1-regular',
      },
    } satisfies Record<IdsSize, object>,
    dense: { true: {}, false: {} },
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
    { media: ['soft', 'outline'], size: 'standard', class: { media: 'size-8' } },
    { media: ['soft', 'outline'], size: 'tiny', class: { media: 'size-7' } },
    { media: ['soft', 'outline'], class: { media: 'overflow-hidden [&>img]:size-full' } },
    { dense: true, size: 'standard', class: { root: 'min-h-12 concentric-p-1.5' } },
    { dense: true, size: 'tiny', class: { root: 'min-h-8 concentric-p-1' } },
  ],
  defaultVariants: {
    groupVariant: 'ghost',
    variant: 'ghost',
    media: 'ghost',
    size: 'standard',
    dense: false,
    truncate: false,
    interactive: false,
  },
});
