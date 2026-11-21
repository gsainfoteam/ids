import { cn, tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export const documentText = cn(
  '[&>*+*]:mt-3 [&_:is(blockquote,[data-document-blocks],[data-type=detailsContent])>*+*]:mt-2',
  '[&_h1]:text-headline-h4-bold [&_h2]:text-headline-h5-bold [&_h3]:text-headline-h6-bold',
  '[&_h4]:text-body-b1-bold [&_h5]:text-body-b2-bold [&_h6]:text-body-b3-bold',
  '[&>*+:is(h1,h2)]:mt-8 [&>*+:is(h3,h4,h5,h6)]:mt-6',
  '[&_:is(h1,h2,h3,h4,h5,h6)+:not(h1,h2,h3,h4,h5,h6)]:mt-4',
  '[&_ul]:list-disc [&_ol]:list-decimal [&_:is(ul,ol)]:ps-6 [&_li:not([data-checked])>*+*]:mt-1 [&_li+li]:mt-1',
  '[&_blockquote]:border-s-2 [&_blockquote]:border-neutral [&_blockquote]:ps-3 [&_blockquote]:text-neutral',
  '[&_:not(pre)>code]:rounded-indicator [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:font-mono',
  '[&_mark]:bg-warning-soft [&_mark]:text-on-warning-soft',
  '[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:ps-0',
  '[&_ul[data-type=taskList]>li]:flex [&_ul[data-type=taskList]>li]:items-start [&_ul[data-type=taskList]>li]:gap-2',
  '[&_ul[data-type=taskList]>li>div]:min-w-0 [&_ul[data-type=taskList]>li>div]:grow',
  '[&_ul[data-type=taskList]>li[data-checked=true]>div>p]:text-neutral [&_ul[data-type=taskList]>li[data-checked=true]>div>p]:line-through',
);

export const mentionStyle = tv({
  slots: {
    root: [
      'scheme-primary inline rounded-full bg-scheme-soft py-0.5 ps-0.5 pe-1.5 font-medium text-on-scheme-soft',
      'whitespace-nowrap box-decoration-clone',
    ],
    avatar: 'me-1 size-[1.3em]',
    link: 'no-underline state-layer hover:state-hover',
  },
});

export const richTextStyle = tv({
  slots: {
    root: ['min-w-0 break-words text-neutral-strong', documentText, '[&_:not(pre)>code]:bg-block'],
    taskBox: 'mt-[calc((1lh_-_1rem)/2)]',
    figure: 'flex flex-col gap-1',
    caption: 'text-neutral',
    image: 'max-w-full',
  },
  variants: {
    size: {
      standard: { root: 'text-body-b3-regular [&_figcaption]:text-caption-c1-regular' },
      tiny: { root: 'text-caption-c1-regular [&_figcaption]:text-caption-c2-regular' },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { size: 'standard' },
});
