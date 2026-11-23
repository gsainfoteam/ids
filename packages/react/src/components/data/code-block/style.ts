import { cn, tv } from '../../../utils';

export const codeTokens = cn(
  '[&_[data-token=comment]]:text-neutral [&_[data-token=comment]]:italic',
  '[&_[data-token=keyword]]:text-primary',
  '[&_[data-token=string]]:text-success',
  '[&_[data-token=inserted]]:text-success',
  '[&_[data-token=number]]:text-warning',
  '[&_[data-token=function]]:text-tertiary',
  '[&_[data-token=property]]:text-secondary',
  '[&_[data-token=tag]]:text-secondary',
  '[&_[data-token=deleted]]:text-danger',
  '[&_[data-token=punctuation]]:text-neutral',
);

export const codeBlockStyle = tv({
  slots: {
    root: 'relative flex w-full min-w-0 flex-col rounded-container whitespace-pre text-neutral-strong',
    caption: [
      'flex min-h-[calc(var(--ids-size-control-tiny)+--spacing(3))] min-w-0 items-center gap-2',
      'ps-4 pe-[calc(var(--ids-size-control-tiny)+--spacing(3))]',
    ],
    divider: '',
    title: 'min-w-0 truncate text-body-b3-medium',
    language: 'ms-auto shrink-0 font-mono text-caption-c1-regular text-neutral first:ms-0',
    copy: 'absolute end-1.5 top-1.5',
    status: 'sr-only',
    scroller: 'min-w-0 rounded-[inherit]',
    pre: 'rounded-[inherit] py-3 font-mono text-body-b3-regular [white-space:inherit]',
    code: ['block w-fit min-w-full wrap-anywhere [--code-block-gutter:0px]', codeTokens],
    line: [
      'inline-block min-h-lh w-full pe-4 align-top',
      'ps-[calc(--spacing(4)+var(--code-block-gutter))]',
      'data-highlighted:shadow-[inset_2px_0_0_var(--ids-color-bg-primary-solid)]',
    ],
    fold: 'flex justify-center px-4 pb-3',
  },
  variants: {
    variant: {
      outline: {
        root: 'p-px shadow-xs inset-ring-1 inset-ring-neutral',
        line: 'data-highlighted:bg-neutral-soft',
      },
      soft: {
        root: 'bg-block',
        divider: 'bg-base',
        line: 'data-highlighted:bg-base',
      },
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
          'before:me-4 before:text-end before:text-neutral before:select-none',
        ],
      },
    },
    captioned: {
      false: { line: 'first:pe-[calc(var(--ids-size-control-tiny)+--spacing(3))]' },
    },
    collapsed: {
      true: {
        pre: [
          'max-h-[calc((var(--code-block-collapsed-lines)+1)*1lh+--spacing(3))]',
          '[mask-image:linear-gradient(to_bottom,#000_calc(100%-1.5lh),transparent)]',
        ],
      },
    },
  },
  defaultVariants: {
    variant: 'outline',
    lineNumbers: false,
    captioned: true,
    collapsed: false,
  },
});
