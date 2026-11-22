import { segmentSurface } from '../../../internal/surfaces/segment-surface';
import { tv } from '../../../utils';

import type { TabsVariant, TabsColorScheme, TabsOrientation } from './context';
import type { IdsSize } from '../../../tokens/types';

export const tabsStyle = tv({
  slots: {
    root: 'flex min-w-0',
    list: 'relative flex shrink-0',
    trigger: [
      'relative inline-flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap select-none',
      'text-neutral aria-selected:text-neutral-strong',
      'not-aria-selected:data-hovered:text-neutral-strong focus-ring',
      'transition-[color,background-color,box-shadow,--ids-state-opacity] duration-(--ids-motion-fast)',
      'motion-reduce:transition-none',
      'disabled:cursor-not-allowed disabled:opacity-50',
      '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    ],
    content: [
      'min-w-0 flex-1 rounded-standard text-neutral-strong focus-ring',
      '[&[hidden]:not([hidden=until-found])]:hidden',
    ],
  },
  variants: {
    colorScheme: {
      primary: { list: 'scheme-primary' },
      secondary: { list: 'scheme-secondary' },
      tertiary: { list: 'scheme-tertiary' },
    } satisfies Record<TabsColorScheme, object>,
    stretch: { true: {}, false: {} },
    orientation: {
      horizontal: {
        root: 'flex-col',
        list: 'flex-row items-end',
        trigger: 'justify-center',
      },
      vertical: {
        root: 'flex-row items-start',
        list: 'flex-col items-stretch self-stretch',
        trigger: 'justify-start text-start',
      },
    } satisfies Record<TabsOrientation, object>,
    variant: {
      underline: {
        trigger: [
          'rounded-standard',
          'after:pointer-events-none after:absolute after:bg-transparent',
          'aria-selected:text-scheme aria-selected:after:bg-(--ids-color-border-scheme-strong)',
        ],
      },
      pill: {
        list: 'gap-1',
        trigger: [
          'rounded-standard',
          'state-layer not-aria-selected:data-hovered:state-hover not-aria-selected:data-active:state-press',
          'aria-selected:bg-scheme-soft aria-selected:text-on-scheme-soft',
        ],
      },
      enclosed: {
        trigger: [
          'border border-transparent aria-selected:border-neutral aria-selected:bg-(--ids-bg-current)',
          'aria-selected:text-scheme',
        ],
      },
      segmented: {
        list: segmentSurface.track,
        trigger: [segmentSurface.segment, 'not-aria-selected:data-hovered:text-neutral'],
      },
    } satisfies Record<TabsVariant, object>,
    size: {
      standard: {
        root: 'gap-4',
        content: 'text-body-b3-regular',
        trigger: [
          'h-(--ids-size-control-standard) px-3 text-body-b3-medium',
          "[&_svg:not([class*='size-'])]:size-(--ids-size-icon-standard)",
        ],
      },
      tiny: {
        root: 'gap-3',
        content: 'text-caption-c1-regular',
        trigger: [
          'h-(--ids-size-control-tiny) gap-1.5 px-2.5 text-caption-c1-medium',
          "[&_svg:not([class*='size-'])]:size-(--ids-size-icon-tiny)",
        ],
      },
    } satisfies Record<IdsSize, object>,
  },
  compoundVariants: [
    { orientation: 'horizontal', stretch: true, class: { list: '[&>[role=tab]]:flex-1' } },
    {
      variant: 'underline',
      orientation: 'horizontal',
      class: {
        list: 'border-b border-neutral',
        trigger: 'after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full',
      },
    },
    {
      variant: 'underline',
      orientation: 'vertical',
      class: {
        list: 'border-e border-neutral',
        trigger: 'after:inset-y-0 after:-end-px after:w-0.5 after:rounded-full',
      },
    },
    {
      variant: 'enclosed',
      orientation: 'horizontal',
      class: {
        list: 'border-b border-neutral',
        trigger: '-mb-px rounded-t-standard aria-selected:border-b-transparent',
      },
    },
    {
      variant: 'enclosed',
      orientation: 'vertical',
      class: {
        list: 'border-e border-neutral',
        trigger: '-me-px rounded-s-standard aria-selected:border-e-transparent',
      },
    },
    {
      variant: 'segmented',
      orientation: 'horizontal',
      stretch: false,
      class: { list: 'w-fit' },
    },
    { variant: 'segmented', orientation: 'vertical', class: { list: 'self-start' } },
    {
      variant: 'segmented',
      size: 'standard',
      class: { trigger: segmentSurface.height.standard },
    },
    { variant: 'segmented', size: 'tiny', class: { trigger: segmentSurface.height.tiny } },
  ],
  defaultVariants: {
    colorScheme: 'primary',
    orientation: 'horizontal',
    variant: 'underline',
    size: 'standard',
  },
});
