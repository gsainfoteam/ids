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
      'flex h-[1lh] shrink-0 items-center text-(--alert-accent)',
      '[&_svg]:size-(--ids-size-icon-standard)',
    ],
    content: 'flex min-w-0 flex-col gap-0.5',
    title: 'text-body-b3-semibold text-(--alert-title)',
    description: 'text-(--alert-body) [&_ul]:list-disc [&_ul]:ps-5 [ul&]:list-disc [ul&]:ps-5',
    actions: 'mt-2 flex flex-wrap items-center gap-2',
    close: '-my-0.5 -me-1.5 size-6 rounded-full',
  },
  variants: {
    colorScheme: {
      neutral: {
        root: [
          '[--alert-tint:var(--ids-color-bg-neutral-bold)] [--alert-on:var(--ids-color-text-on-neutral-bold)]',
          '[--alert-soft:var(--ids-color-bg-neutral-subtle)] [--alert-on-soft:var(--ids-color-text-on-neutral-subtle)]',
          '[--alert-strong:var(--ids-color-text-neutral-bold)]',
        ],
      },
      primary: {
        root: [
          '[--alert-tint:var(--ids-color-bg-primary)] [--alert-on:var(--ids-color-text-on-primary)]',
          '[--alert-soft:var(--ids-color-bg-primary-subtle)] [--alert-on-soft:var(--ids-color-text-on-primary-subtle)]',
          '[--alert-strong:var(--ids-color-text-primary)]',
        ],
      },
      secondary: {
        root: [
          '[--alert-tint:var(--ids-color-bg-secondary)] [--alert-on:var(--ids-color-text-on-secondary)]',
          '[--alert-soft:var(--ids-color-bg-secondary-subtle)] [--alert-on-soft:var(--ids-color-text-on-secondary-subtle)]',
          '[--alert-strong:var(--ids-color-text-secondary)]',
        ],
      },
      tertiary: {
        root: [
          '[--alert-tint:var(--ids-color-bg-tertiary)] [--alert-on:var(--ids-color-text-on-tertiary)]',
          '[--alert-soft:var(--ids-color-bg-tertiary-subtle)] [--alert-on-soft:var(--ids-color-text-on-tertiary-subtle)]',
          '[--alert-strong:var(--ids-color-text-tertiary)]',
        ],
      },
      info: {
        root: [
          '[--alert-tint:var(--ids-color-bg-info)] [--alert-on:var(--ids-color-text-on-info)]',
          '[--alert-soft:var(--ids-color-bg-info-subtle)] [--alert-on-soft:var(--ids-color-text-on-info-subtle)]',
          '[--alert-strong:var(--ids-color-text-info)]',
        ],
      },
      success: {
        root: [
          '[--alert-tint:var(--ids-color-bg-success)] [--alert-on:var(--ids-color-text-on-success)]',
          '[--alert-soft:var(--ids-color-bg-success-subtle)] [--alert-on-soft:var(--ids-color-text-on-success-subtle)]',
          '[--alert-strong:var(--ids-color-text-success)]',
        ],
      },
      warning: {
        root: [
          '[--alert-tint:var(--ids-color-bg-warning)] [--alert-on:var(--ids-color-text-on-warning)]',
          '[--alert-soft:var(--ids-color-bg-warning-subtle)] [--alert-on-soft:var(--ids-color-text-on-warning-subtle)]',
          '[--alert-strong:var(--ids-color-text-warning)]',
        ],
      },
      danger: {
        root: [
          '[--alert-tint:var(--ids-color-bg-danger)] [--alert-on:var(--ids-color-text-on-danger)]',
          '[--alert-soft:var(--ids-color-bg-danger-subtle)] [--alert-on-soft:var(--ids-color-text-on-danger-subtle)]',
          '[--alert-strong:var(--ids-color-text-danger)]',
        ],
      },
    } satisfies Record<Alert.ColorScheme, object>,
    variant: {
      solid: {
        root: [
          'bg-(--alert-tint) text-(--alert-on)',
          '[--alert-accent:var(--alert-on)] [--alert-title:var(--alert-on)] [--alert-body:var(--alert-on)]',
        ],
        close: '[--control-quiet:var(--alert-on)] [--control-ring:var(--alert-on)]',
      },
      soft: {
        root: [
          'bg-(--alert-soft) text-(--alert-on-soft)',
          '[--alert-accent:var(--alert-on-soft)] [--alert-title:var(--alert-on-soft)] [--alert-body:var(--alert-on-soft)]',
        ],
      },
      outline: {
        root: [
          'bg-neutral-subtlest text-neutral-bold inset-ring-1 inset-ring-neutral',
          'dark:bg-neutral-subtler',
          '[--alert-accent:var(--alert-strong)] [--alert-title:var(--alert-strong)] [--alert-body:var(--ids-color-text-neutral)]',
        ],
      },
      ghost: {
        root: [
          'bg-transparent text-neutral-bold',
          '[--alert-accent:var(--alert-strong)] [--alert-title:var(--alert-strong)] [--alert-body:var(--ids-color-text-neutral)]',
        ],
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
