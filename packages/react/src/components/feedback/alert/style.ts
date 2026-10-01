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
    description: 'text-(--alert-body) [&_ul]:list-disc [&_ul]:ps-5',
    actions: 'mt-2 flex flex-wrap items-center gap-2',
    close: '-my-0.5 -me-1.5 size-6 rounded-full',
  },
  variants: {
    colorScheme: {
      neutral: {
        root: '[--alert-tint:var(--ids-color-on-surface)] [--alert-strong:var(--ids-color-on-surface)] [--alert-on:var(--ids-color-surface)]',
      },
      info: {
        root: '[--alert-tint:var(--ids-color-info)] [--alert-strong:var(--ids-color-info-strong)] [--alert-on:var(--ids-color-on-info)]',
      },
      success: {
        root: '[--alert-tint:var(--ids-color-success)] [--alert-strong:var(--ids-color-success-strong)] [--alert-on:var(--ids-color-on-success)]',
      },
      warning: {
        root: '[--alert-tint:var(--ids-color-warning)] [--alert-strong:var(--ids-color-warning-strong)] [--alert-on:var(--ids-color-on-warning)]',
      },
      danger: {
        root: '[--alert-tint:var(--ids-color-danger)] [--alert-strong:var(--ids-color-danger-strong)] [--alert-on:var(--ids-color-on-danger)]',
      },
    } satisfies Record<Alert.ColorScheme, object>,
    variant: {
      solid: {
        root: [
          'bg-(--alert-tint) text-(--alert-on)',
          '[--alert-accent:var(--alert-on)] [--alert-title:var(--alert-on)] [--alert-body:var(--alert-on)]',
        ],
        close: [
          '[--control-quiet:var(--alert-on)] [--control-ring:var(--alert-on)]',
          '[--control-hover:color-mix(in_oklab,var(--alert-on)_15%,transparent)]',
        ],
      },
      soft: {
        root: [
          'bg-(--alert-tint)/10 text-(--ids-color-on-surface)',
          '[--alert-accent:var(--alert-strong)] [--alert-title:var(--alert-strong)] [--alert-body:var(--ids-color-on-surface)]',
        ],
      },
      outline: {
        root: [
          'bg-(--ids-color-surface) text-(--ids-color-on-surface) inset-ring-1 inset-ring-(--ids-color-border)',
          'dark:bg-(--ids-color-muted)/30',
          '[--alert-accent:var(--alert-strong)] [--alert-title:var(--alert-strong)] [--alert-body:var(--ids-color-on-muted)]',
        ],
      },
      ghost: {
        root: [
          'bg-transparent text-(--ids-color-on-surface)',
          '[--alert-accent:var(--alert-strong)] [--alert-title:var(--alert-strong)] [--alert-body:var(--ids-color-on-muted)]',
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
