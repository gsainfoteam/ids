import { controlSurface, type SurfaceVariant } from '../../../internal/control-surface';
import { tv } from '../../../utils';

import type { TabsAppearance, TabsColorScheme, TabsOrientation } from './context';
import type { IdsSize } from '../../../tokens/types';

export const tabsStyle = tv({
  slots: {
    root: 'flex min-w-0',
    list: 'relative flex shrink-0',
    trigger: [
      'relative inline-flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap select-none',
      'text-neutral aria-selected:text-neutral-bold',
      'not-aria-selected:data-hovered:text-neutral-bold focus-ring',
      'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast)',
      'motion-reduce:transition-none',
      'disabled:cursor-not-allowed disabled:opacity-50',
      '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    ],
    content: [
      'min-w-0 flex-1 rounded-standard text-neutral-bold focus-ring',
      '[&[hidden]:not([hidden=until-found])]:hidden',
    ],
  },
  variants: {
    colorScheme: {
      primary: { list: controlSurface.colorScheme.primary },
      secondary: { list: controlSurface.colorScheme.secondary },
      tertiary: { list: controlSurface.colorScheme.tertiary },
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
    appearance: {
      underline: {
        trigger: [
          'rounded-standard',
          'after:pointer-events-none after:absolute after:bg-transparent',
          'aria-selected:after:bg-(--control-ring)',
        ],
      },
      pill: {
        list: 'gap-1',
        trigger: [
          'rounded-standard',
          'state-layer not-aria-selected:data-hovered:state-hover',
          'not-aria-selected:data-active:state-press',
        ],
      },
      enclosed: {
        trigger: 'border border-transparent aria-selected:border-neutral aria-selected:bg-neutral-subtlest',
      },
    } satisfies Record<TabsAppearance, object>,
    variant: {
      ghost: {},
      outline: {},
      soft: {},
      solid: {},
      glossy: {},
    } satisfies Record<SurfaceVariant, object>,
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
      appearance: 'underline',
      orientation: 'horizontal',
      class: {
        list: 'border-b border-neutral',
        trigger: 'after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full',
      },
    },
    {
      appearance: 'underline',
      orientation: 'vertical',
      class: {
        list: 'border-e border-neutral',
        trigger: 'after:inset-y-0 after:-end-px after:w-0.5 after:rounded-full',
      },
    },
    {
      appearance: 'enclosed',
      orientation: 'horizontal',
      class: {
        list: 'border-b border-neutral',
        trigger: '-mb-px rounded-t-standard aria-selected:border-b-transparent',
      },
    },
    {
      appearance: 'enclosed',
      orientation: 'vertical',
      class: {
        list: 'border-e border-neutral',
        trigger: '-me-px rounded-s-standard aria-selected:border-e-transparent',
      },
    },
    {
      appearance: 'pill',
      variant: 'ghost',
      class: { trigger: 'aria-selected:state-press' },
    },
    {
      appearance: 'pill',
      variant: 'soft',
      class: {
        trigger: 'aria-selected:bg-(--control-soft) aria-selected:text-(--control-on-soft)',
      },
    },
    {
      appearance: 'pill',
      variant: 'outline',
      class: {
        trigger: [
          'aria-selected:bg-neutral-subtlest aria-selected:shadow-xs',
          'aria-selected:inset-ring-1 aria-selected:inset-ring-neutral',
          'dark:aria-selected:bg-neutral-subtle',
        ],
      },
    },
    {
      appearance: 'pill',
      variant: 'solid',
      class: {
        trigger: [
          'aria-selected:bg-(--control-fill) aria-selected:text-(--control-on-fill)',
          'aria-selected:shadow-xs',
        ],
      },
    },
    {
      appearance: 'pill',
      variant: 'glossy',
      class: {
        trigger: [
          'aria-selected:bg-(--control-fill) aria-selected:text-(--control-on-fill)',
          'aria-selected:shadow-sm aria-selected:bg-linear-to-b',
          'aria-selected:from-white/20 aria-selected:to-transparent',
          'aria-selected:inset-shadow-[0_1px_0_rgb(255_255_255/0.35)]',
          'aria-selected:inset-ring-1',
          'aria-selected:inset-ring-[color-mix(in_oklab,var(--control-fill),black_20%)]',
        ],
      },
    },
  ],
  defaultVariants: {
    colorScheme: 'primary',
    orientation: 'horizontal',
    appearance: 'underline',
    variant: 'soft',
    size: 'standard',
  },
});
