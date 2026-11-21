import { overlayStyles } from '../../../internal/overlay/styles';
import { footerBand } from '../../../internal/surfaces/footer-band';
import { cn, tv } from '../../../utils';

const cornerOfThePaddedViewport = cn('concentric-p-6 p-0');

export const dialogStyle = tv({
  slots: {
    backdrop: [overlayStyles.backdrop, 'duration-(--ids-motion-normal) ease-out'],
    content: [
      'fixed inset-0 z-50 m-auto flex h-fit max-h-[calc(100dvh-var(--spacing)*8)] w-[calc(100%-var(--spacing)*8)] max-w-sm flex-col overflow-hidden outline-none',
      cornerOfThePaddedViewport,
      'border border-neutral bg-surface text-neutral-strong shadow-lg',
      'transition-[opacity,scale] duration-(--ids-motion-normal) ease-out',
      'starting:scale-95 starting:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0',
      'data-nested-open:scale-[0.96] motion-reduce:transition-none',
    ],
    body: 'relative flex min-h-0 flex-col',
    viewport: 'relative flex flex-col gap-4 p-6',
    header: 'flex flex-col gap-1.5 pe-8 text-start',
    title: 'text-subtitle-s1-semibold [overflow-wrap:anywhere]',
    description: 'text-body-b3-regular text-neutral',
    footer: [
      'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
      footerBand,
      'shrink-0 px-6 py-4',
    ],
    close: 'absolute end-4 top-4',
  },
  variants: {
    footed: {
      true: { body: 'rounded-t-[inherit]' },
      false: { body: 'rounded-[inherit]' },
    },
  },
  defaultVariants: { footed: false },
});
