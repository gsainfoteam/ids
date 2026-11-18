import { tv } from '../../../utils';

import type { Alert } from '.';

export const alertStyle = tv({
  slots: {
    root: [
      'relative grid w-full items-start gap-x-3 concentric-p-3 px-4 text-body-b3-regular',
      'transition-[opacity,translate] duration-(--ids-motion-fast) ease-out motion-reduce:transition-none',
      'data-ending-style:-translate-y-1 data-ending-style:opacity-0',
    ],
    icon: [
      'flex h-[1lh] shrink-0 items-center',
      '[&_svg]:size-(--ids-size-icon-standard)',
    ],
    content: 'flex min-w-0 flex-col gap-0.5',
    title: 'text-body-b3-semibold',
    description: '[&_ul]:list-disc [&_ul]:ps-5 [ul&]:list-disc [ul&]:ps-5',
    actions: 'mt-2 flex flex-wrap items-center gap-2',
    close: '-my-0.5 -me-1.5 size-6 rounded-full',
  },
  variants: {
    colorScheme: {
      neutral: { root: 'scheme-neutral' },
      primary: { root: 'scheme-primary' },
      secondary: { root: 'scheme-secondary' },
      tertiary: { root: 'scheme-tertiary' },
      info: { root: 'scheme-info' },
      success: { root: 'scheme-success' },
      warning: { root: 'scheme-warning' },
      danger: { root: 'scheme-danger' },
    } satisfies Record<Alert.ColorScheme, object>,
    variant: {
      solid: {
        root: 'bg-scheme text-on-scheme',
        close: 'text-on-scheme focus-ring-current',
      },
      soft: { root: 'bg-scheme-subtle text-on-scheme-subtle' },
      outline: {
        root: [
          'bg-neutral-subtlest text-neutral-bold inset-ring-1 inset-ring-neutral',
          'dark:bg-neutral-subtler',
        ],
        icon: 'text-scheme',
        title: 'text-scheme',
        description: 'text-neutral',
      },
      ghost: {
        root: 'bg-transparent text-neutral-bold',
        icon: 'text-scheme',
        title: 'text-scheme',
        description: 'text-neutral',
      },
    } satisfies Record<Alert.Variant, object>,
    icon: { true: {}, false: {} },
    close: { true: {}, false: {} },
  },
  compoundVariants: [
    { icon: false, close: false, class: { root: 'grid-cols-1' } },
    { icon: true, close: false, class: { root: 'grid-cols-[auto_minmax(0,1fr)]' } },
    { icon: false, close: true, class: { root: 'grid-cols-[minmax(0,1fr)_auto]' } },
    { icon: true, close: true, class: { root: 'grid-cols-[auto_minmax(0,1fr)_auto]' } },
  ],
  defaultVariants: { colorScheme: 'info', variant: 'soft', icon: false, close: false },
});
