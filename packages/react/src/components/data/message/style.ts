import { tv } from '../../../utils';

import type { MessageAlign } from '.';

export const messageStyle = tv({
  slots: {
    root: 'flex w-full min-w-0 items-start gap-3 text-on-surface',
    avatar: 'flex shrink-0',
    column: 'flex min-w-0 flex-1 flex-col gap-1.5',
    header: 'flex max-w-full min-w-0 items-baseline gap-2',
    name: 'min-w-0 text-body-b3-medium wrap-break-word',
    time: 'shrink-0 text-caption-c1-regular text-neutral tabular-nums',
    content: 'flex w-full min-w-0 flex-col gap-2 text-body-b2-regular wrap-break-word',
    failure: 'flex flex-wrap items-center gap-2',
    failureText: 'w-auto text-danger',
    actions: '',
    copyStatus: 'sr-only',
    footer: 'flex items-center gap-1 text-caption-c1-regular text-neutral',
    group: 'flex w-full min-w-0 flex-col gap-1',
  },
  variants: {
    align: {
      start: { column: 'items-stretch', content: 'items-stretch' },
      end: { root: 'flex-row-reverse', column: 'items-end', content: 'items-end' },
    } satisfies Record<MessageAlign, object>,
    first: {
      true: {},
      false: { header: 'sr-only', avatar: 'invisible' },
    },
  },
  defaultVariants: { align: 'start', first: true },
});
