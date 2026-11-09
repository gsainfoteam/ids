import { tv } from '../../../utils';

export const codeBlockStyle = tv({
  slots: {
    root: 'relative flex min-w-0 flex-col rounded-container text-(--ids-color-on-surface)',
    caption: [
      'flex min-h-[calc(var(--ids-size-control-tiny)+--spacing(3))] min-w-0 items-center gap-2',
      'border-b border-(--ids-color-border) ps-4 pe-[calc(var(--ids-size-control-tiny)+--spacing(3))]',
    ],
    title: 'min-w-0 truncate text-body-b3-medium',
    language:
      'ms-auto shrink-0 font-mono text-caption-c1-regular text-(--ids-color-on-muted) first:ms-0',
    copy: 'absolute end-1.5 top-1.5',
    status: 'sr-only',
    scroller: 'min-w-0 rounded-[inherit]',
    pre: 'rounded-[inherit] py-3 font-mono text-body-b3-regular',
    code: [
      'block [--code-block-gutter:0px]',
      '[&_[data-token=comment]]:text-(--ids-color-on-muted) [&_[data-token=comment]]:italic',
      '[&_[data-token=keyword]]:text-(--ids-color-accent)',
      '[&_[data-token=string]]:text-(--ids-color-success-strong)',
      '[&_[data-token=inserted]]:text-(--ids-color-success-strong)',
      '[&_[data-token=number]]:text-(--ids-color-warning-strong)',
      '[&_[data-token=function]]:text-(--ids-color-info-strong)',
      '[&_[data-token=property]]:text-(--ids-color-info-strong)',
      '[&_[data-token=tag]]:text-(--ids-color-danger-strong)',
      '[&_[data-token=deleted]]:text-(--ids-color-danger-strong)',
      '[&_[data-token=punctuation]]:text-(--ids-color-on-muted)',
    ],
    line: [
      'inline-block min-h-lh w-full pe-4 align-top',
      'ps-[calc(--spacing(4)+var(--code-block-gutter))]',
      'data-highlighted:shadow-[inset_2px_0_0_var(--ids-color-primary)]',
    ],
  },
  variants: {
    variant: {
      outline: {
        root: 'bg-(--ids-color-surface) p-px shadow-xs inset-ring-1 inset-ring-(--ids-color-border)',
        line: 'data-highlighted:bg-(--ids-color-muted)',
      },
      soft: {
        root: 'bg-(--ids-color-muted)',
        caption: 'border-(--ids-color-surface)',
        line: 'data-highlighted:bg-(--ids-color-surface)',
      },
    },
    wrap: {
      true: { code: 'w-full wrap-break-word whitespace-pre-wrap' },
      false: { code: 'w-max min-w-full whitespace-pre' },
    },
    lineNumbers: {
      true: {
        code: [
          '[counter-reset:line]',
          '[--code-block-gutter:calc(var(--code-block-digits)*1ch+--spacing(4))]',
        ],
        line: [
          '[counter-increment:line]',
          "before:content-[counter(line)_/_'']",
          'before:-ms-(--code-block-gutter) before:inline-block before:w-[calc(var(--code-block-digits)*1ch)]',
          'before:me-4 before:text-end before:text-(--ids-color-on-muted) before:select-none',
        ],
      },
    },
  },
  defaultVariants: { variant: 'outline', wrap: false, lineNumbers: false },
});
