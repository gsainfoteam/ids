import { tv } from '../../../utils';

import type { MessageAlign, MessageStatus } from '.';

export const messageStyle = tv({
  slots: {
    root: 'flex w-full min-w-0 items-start gap-3 text-on-surface',
    avatar: 'flex shrink-0',
    column: 'flex min-w-0 flex-1 flex-col gap-1.5',
    header: 'flex max-w-full min-w-0 items-baseline gap-2',
    name: 'min-w-0 text-body-b3-medium wrap-break-word',
    time: 'shrink-0 text-caption-c1-regular text-neutral tabular-nums',
    body: 'flex w-full min-w-0 items-end gap-1.5',
    content: [
      'flex min-w-0 flex-col gap-2 text-body-b2-regular wrap-break-word',
      '[&>[data-bubble]]:transition-[background-color,color,box-shadow,border-radius]',
      'motion-reduce:[&>[data-bubble]]:transition-none',
    ],
    side: 'flex shrink-0 flex-col gap-0.5 empty:hidden',
    unread: [
      'flex h-[1lh] items-center text-caption-c1-medium text-primary tabular-nums',
      'transition-[opacity,scale] duration-200 starting:scale-50 starting:opacity-0',
      'data-ending-style:scale-50 data-ending-style:opacity-0 motion-reduce:transition-none',
    ],
    hint: 'sr-only',
    failure: 'flex flex-wrap items-center gap-2',
    failureText: 'w-auto text-danger',
    actions: '',
    footer: 'flex items-center gap-1 text-caption-c1-regular text-neutral',
  },
  variants: {
    align: {
      start: { column: 'items-stretch', content: 'items-stretch', side: 'items-start' },
      end: {
        root: 'flex-row-reverse',
        column: 'items-end',
        body: 'flex-row-reverse',
        content: 'items-end',
        side: 'items-end',
      },
    } satisfies Record<MessageAlign, object>,
    first: {
      true: {},
      false: {
        header: 'sr-only',
        avatar: 'invisible',
        content: [
          '[&>[data-bubble][data-align=start]]:rounded-ss-indicator',
          '[&>[data-bubble][data-align=end]]:rounded-se-indicator',
        ],
      },
    },
    bubbled: {
      true: { content: 'max-w-[80%] [--bubble-max-width:100%]' },
      false: { content: 'flex-1' },
    },
    status: {
      sent: {},
      pending: {
        content: [
          '[&>[data-bubble]]:isolate',
          '[&>[data-bubble][data-variant=soft]]:bg-neutral-soft/50',
          '[&>[data-bubble][data-variant=soft]]:text-neutral',
          '[&>[data-bubble][data-variant=outline]]:text-neutral',
          '[&>[data-bubble][data-variant=solid]]:bg-primary-soft',
          '[&>[data-bubble][data-variant=solid]]:text-on-primary-soft',
          '[&>[data-bubble]]:after:pointer-events-none [&>[data-bubble]]:after:absolute',
          '[&>[data-bubble]]:after:inset-0 [&>[data-bubble]]:after:-z-10',
          '[&>[data-bubble]]:after:rounded-[inherit] [&>[data-bubble]]:after:bg-linear-to-r',
          '[&>[data-bubble]]:after:from-transparent [&>[data-bubble]]:after:to-transparent',
          '[&>[data-bubble][data-variant=soft]]:after:via-neutral-soft-hover',
          '[&>[data-bubble][data-variant=solid]]:after:via-primary-soft-hover',
          '[&>[data-bubble][data-variant=outline]]:after:via-neutral-soft',
          '[&>[data-bubble]]:after:bg-[length:50%_100%] [&>[data-bubble]]:after:bg-no-repeat',
          '[&>[data-bubble]]:after:animate-skeleton-wave',
          'rtl:[&>[data-bubble]]:after:[animation-direction:reverse]',
          'motion-reduce:[&>[data-bubble]]:after:hidden',
        ],
      },
      error: {
        content: '[&>[data-bubble]]:inset-ring-1 [&>[data-bubble]]:inset-ring-danger',
      },
    } satisfies Record<MessageStatus, object>,
  },
  defaultVariants: { align: 'start', first: true, bubbled: false, status: 'sent' },
});
