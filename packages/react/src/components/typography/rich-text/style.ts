import { cn, tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export const documentText = cn(
  'document-text',
  '[&_:is([data-document-blocks],[data-type=detailsContent])>*+*]:mt-2',
  '[&_li[data-checked]>*+*]:mt-0',
  '[&_tr>:is(td,th):not(:last-child)]:border-e',
  '[&_:is([data-callout],[data-callout-title])]:text-[length:inherit] [&_:is([data-callout],[data-callout-title])]:leading-[inherit]',
  '[&_mark]:bg-warning-soft [&_mark]:text-on-warning-soft',
  '[&_mark[data-color=primary]]:bg-primary-soft [&_mark[data-color=primary]]:text-on-primary-soft [&_span[data-color=primary]]:text-primary',
  '[&_mark[data-color=secondary]]:bg-secondary-soft [&_mark[data-color=secondary]]:text-on-secondary-soft [&_span[data-color=secondary]]:text-secondary',
  '[&_mark[data-color=tertiary]]:bg-tertiary-soft [&_mark[data-color=tertiary]]:text-on-tertiary-soft [&_span[data-color=tertiary]]:text-tertiary',
  '[&_mark[data-color=info]]:bg-info-soft [&_mark[data-color=info]]:text-on-info-soft [&_span[data-color=info]]:text-info',
  '[&_mark[data-color=success]]:bg-success-soft [&_mark[data-color=success]]:text-on-success-soft [&_span[data-color=success]]:text-success',
  '[&_mark[data-color=warning]]:bg-warning-soft [&_mark[data-color=warning]]:text-on-warning-soft [&_span[data-color=warning]]:text-warning',
  '[&_mark[data-color=danger]]:bg-danger-soft [&_mark[data-color=danger]]:text-on-danger-soft [&_span[data-color=danger]]:text-danger',
  '[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:ps-0',
  '[&_ul[data-type=taskList]>li]:flex [&_ul[data-type=taskList]>li]:items-start [&_ul[data-type=taskList]>li]:gap-2',
  '[&_ul[data-type=taskList]>li>div]:min-w-0 [&_ul[data-type=taskList]>li>div]:grow',
  '[&_ul[data-type=taskList]>li[data-checked=true]>div>p]:text-neutral [&_ul[data-type=taskList]>li[data-checked=true]>div>p]:line-through',
);

export const mentionStyle = tv({
  slots: {
    root: [
      'scheme-primary inline rounded-full bg-scheme-soft py-px ps-0.5 pe-1.5 font-medium text-on-scheme-soft',
      'whitespace-nowrap box-decoration-clone',
    ],
    avatar: 'me-1 size-[1.15em] align-[0.1em]',
    link: 'no-underline state-layer hover:state-hover',
  },
});

export const richTextStyle = tv({
  slots: {
    root: ['min-w-0 break-words text-neutral-strong', documentText],
    taskBox: 'mt-[calc((1lh_-_1rem)/2)]',
    figure: 'flex flex-col gap-1',
    caption: 'text-neutral',
    image: 'max-w-full',
  },
  variants: {
    size: {
      standard: { root: 'text-body-b2-regular leading-prose [&_figcaption]:text-body-b3-regular' },
      tiny: { root: 'text-body-b3-regular [&_figcaption]:text-caption-c1-regular' },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { size: 'standard' },
});
