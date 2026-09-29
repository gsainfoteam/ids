import { tv } from '../../../utils';

import type { Toaster } from '.';

export const toasterStyle = tv({
  slots: {
    region: [
      'fixed inset-x-4 z-50 m-0 h-(--front-toast-height) w-auto overflow-visible border-0 bg-transparent p-0',
      'text-(--ids-color-on-surface) outline-none sm:w-[356px]',
    ],
    toast: [
      'absolute inset-x-0 z-(--toast-z) touch-none concentric-p-3 px-4',
      'bg-(--ids-color-surface) text-body-b3-regular text-(--ids-color-on-surface)',
      'shadow-lg inset-ring-1 inset-ring-(--ids-color-border)',
      'after:absolute after:inset-x-0 after:h-(--gap)',
      'h-(--front-toast-height) [scale:calc(1-0.05*var(--toasts-before))]',
      '[--toast-y:calc(var(--lift)*var(--gap)*var(--toasts-before))]',
      '[translate:var(--swipe-x,0px)_calc(var(--toast-y)+var(--swipe-y,0px))]',
      'data-front:h-(--initial-height) data-front:[scale:1] data-front:[--toast-y:0px]',
      'data-expanded:h-(--initial-height) data-expanded:[scale:1]',
      'data-expanded:[--toast-y:calc(var(--lift)*var(--offset))]',
      '[&:not([data-front],[data-expanded])>*]:opacity-0',
      'transition-[translate,scale,opacity,height] duration-(--ids-motion-slow) ease-out',
      'starting:[translate:0_calc(var(--lift)*-100%)] starting:opacity-0',
      'not-data-visible:pointer-events-none not-data-visible:opacity-0',
      'data-ending-style:pointer-events-none data-ending-style:opacity-0',
      'data-front:data-ending-style:[--toast-y:calc(var(--lift)*-100%)]',
      'data-swiping:transition-none data-swiping:select-none motion-reduce:transition-none',
    ],
    body: [
      'flex items-center gap-3 transition-opacity duration-(--ids-motion-fast) ease-out',
      'motion-reduce:transition-none',
    ],
    icon: [
      'flex shrink-0 items-center text-(--toast-accent)',
      '[&_svg]:size-(--ids-size-icon-standard)',
    ],
    content: 'flex min-w-0 flex-1 flex-col gap-0.5',
    title: 'text-body-b3-semibold [overflow-wrap:anywhere]',
    description: 'text-(--ids-color-on-muted) [overflow-wrap:anywhere]',
    action: 'shrink-0',
    close: '-me-1.5 size-6 shrink-0 rounded-full',
  },
  variants: {
    placement: {
      'top-left': {
        region:
          'top-4 bottom-auto [--lift:1] sm:top-(--toaster-offset) sm:right-auto sm:left-(--toaster-offset)',
        toast: 'top-0 origin-bottom after:top-full',
      },
      'top-center': {
        region:
          'top-4 bottom-auto [--lift:1] sm:top-(--toaster-offset) sm:right-auto sm:left-1/2 sm:-translate-x-1/2',
        toast: 'top-0 origin-bottom after:top-full',
      },
      'top-right': {
        region:
          'top-4 bottom-auto [--lift:1] sm:top-(--toaster-offset) sm:right-(--toaster-offset) sm:left-auto',
        toast: 'top-0 origin-bottom after:top-full',
      },
      'bottom-left': {
        region:
          'top-auto bottom-4 [--lift:-1] sm:bottom-(--toaster-offset) sm:right-auto sm:left-(--toaster-offset)',
        toast: 'bottom-0 origin-top after:bottom-full',
      },
      'bottom-center': {
        region:
          'top-auto bottom-4 [--lift:-1] sm:bottom-(--toaster-offset) sm:right-auto sm:left-1/2 sm:-translate-x-1/2',
        toast: 'bottom-0 origin-top after:bottom-full',
      },
      'bottom-right': {
        region:
          'top-auto bottom-4 [--lift:-1] sm:right-(--toaster-offset) sm:bottom-(--toaster-offset) sm:left-auto',
        toast: 'bottom-0 origin-top after:bottom-full',
      },
    } satisfies Record<Toaster.Placement, object>,
    colorScheme: {
      neutral: { toast: '[--toast-accent:var(--ids-color-on-surface)]' },
      info: { toast: '[--toast-accent:var(--ids-color-info-strong)]' },
      success: { toast: '[--toast-accent:var(--ids-color-success-strong)]' },
      warning: { toast: '[--toast-accent:var(--ids-color-warning-strong)]' },
      danger: { toast: '[--toast-accent:var(--ids-color-danger-strong)]' },
    } satisfies Record<Toaster.ColorScheme, object>,
  },
  defaultVariants: { placement: 'bottom-right', colorScheme: 'neutral' },
});
