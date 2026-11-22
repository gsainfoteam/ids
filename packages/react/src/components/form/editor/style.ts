import { fieldSurface } from '../../../internal/surfaces/field-surface';
import { cn, tv } from '../../../utils';

import type { EditorVariant } from './root';
import type { IdsSize } from '../../../tokens/types';

const placeholder = cn(
  '[&_.is-editor-empty:first-child]:before:pointer-events-none',
  '[&_.is-editor-empty:first-child]:before:float-start',
  '[&_.is-editor-empty:first-child]:before:h-0',
  '[&_.is-editor-empty:first-child]:before:text-neutral',
  '[&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]',
);

const proseMirrorBaseline = cn(
  'whitespace-pre-wrap break-words [font-variant-ligatures:none]',
  '[&_[contenteditable=false]]:whitespace-normal',
  '[&_img.ProseMirror-separator]:m-0! [&_img.ProseMirror-separator]:inline! [&_img.ProseMirror-separator]:size-0! [&_img.ProseMirror-separator]:border-0!',
  '[&.ProseMirror-hideselection]:caret-transparent',
  '[&_.ProseMirror-selectednode]:outline-2 [&_.ProseMirror-selectednode]:outline-primary-strong',
);

const documentBlocks = cn(
  'flex flex-col gap-2',
  '[&_h1]:text-headline-h5-semibold [&_h2]:text-headline-h6-semibold [&_h3]:text-body-b1-semibold [&_h4]:text-body-b2-semibold',
  '[&_:is(ul,ol)]:ps-6 [&_ul]:list-disc [&_ol]:list-decimal',
  '[&_blockquote]:flex [&_blockquote]:flex-col [&_blockquote]:gap-2 [&_blockquote]:border-s-2 [&_blockquote]:border-neutral [&_blockquote]:ps-3 [&_blockquote]:text-neutral',
  '[&_pre]:rounded-standard [&_pre]:px-3 [&_pre]:py-2 [&_pre]:font-mono [&_pre]:leading-b2 [&_pre]:whitespace-pre-wrap',
  '[&_:not(pre)>code]:rounded-indicator [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:font-mono',
  '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2',
  '[&_hr]:border-neutral',
);

export const editorStyle = tv({
  slots: {
    root: [
      'relative flex w-full min-w-0 cursor-text flex-col overflow-hidden rounded-standard',
      fieldSurface.base,
    ],
    bar: 'mx-px shrink-0 text-neutral',
    barItems: 'flex items-center gap-0.5',
    separator: 'mx-0.5 h-5 self-center',
    blockType: [
      'w-auto shrink-0 rounded-standard text-neutral-strong',
      'transition-[color,background-color,box-shadow,--ids-state-opacity]',
      'state-layer hover:state-hover active:state-press ring-0! inset-ring-transparent!',
    ],
    scrollArea: [
      'min-h-0 grow rounded-[inherit]',
      '[:not(:empty)+&]:rounded-t-none [&:has(+:not(:empty))]:rounded-b-none',
    ],
    document: 'relative',
    content: [
      'min-h-24 outline-none text-neutral-strong',
      'selection:bg-primary-solid/30 selection:text-neutral-strong',
      proseMirrorBaseline,
      documentBlocks,
      placeholder,
    ],
    count: ['ms-auto shrink-0 text-neutral tabular-nums', 'data-near-limit:text-neutral-strong'],
    bubble: 'w-auto concentric-p-1 p-0 [&>[data-scroll-area]>[data-scroll-area-viewport]]:p-0',
    bubbleBar: 'flex items-center gap-0.5 p-1',
    bubbleAnchor: 'pointer-events-none absolute',
    linkForm: 'flex flex-col gap-2',
    linkActions: 'flex justify-end gap-2',
  },
  variants: {
    variant: {
      outline: {
        root: fieldSurface.variant.outline,
        bar: 'border-field-bar',
        content: '[&_pre]:bg-field-code-outline [&_:not(pre)>code]:bg-field-code-outline',
      },
      soft: {
        root: fieldSurface.variant.soft,
        bar: 'border-field-bar',
        content: '[&_pre]:bg-block [&_:not(pre)>code]:bg-block',
      },
    } satisfies Record<EditorVariant, object>,
    size: {
      standard: {
        root: 'text-body-b3-regular',
        barItems: 'p-1',
        content: 'px-3 py-2 text-body-b2-regular leading-prose',
        count: 'px-2 text-caption-c1-regular',
      },
      tiny: {
        root: 'text-caption-c1-regular',
        barItems: 'p-0.5',
        content: 'px-2 py-1.5 text-body-b3-regular',
        count: 'px-1.5 text-caption-c2-regular',
      },
    } satisfies Record<IdsSize, object>,
    position: {
      top: { bar: 'border-b' },
      bottom: { bar: 'border-t' },
    },
    editable: {
      true: {},
      false: { content: 'cursor-default' },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'standard',
    editable: true,
  },
});
