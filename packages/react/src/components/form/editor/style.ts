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
  '[&_.ProseMirror-selectednode]:outline-2 [&_.ProseMirror-selectednode]:outline-primary',
);

const documentBlocks = cn(
  '[&>*+*]:mt-2',
  '[&_h1]:text-headline-h4-bold [&_h2]:text-headline-h5-bold [&_h3]:text-headline-h6-bold [&_h4]:text-body-b1-bold',
  '[&_:is(h1,h2,h3,h4)+*]:mt-1',
  '[&_ul]:list-disc [&_ol]:list-decimal [&_:is(ul,ol)]:ps-6 [&_li>*+*]:mt-1 [&_li+li]:mt-1',
  '[&_blockquote]:border-s-2 [&_blockquote]:border-neutral [&_blockquote]:ps-3 [&_blockquote]:text-neutral',
  '[&_pre]:rounded-standard [&_pre]:px-3 [&_pre]:py-2 [&_pre]:font-mono [&_pre]:whitespace-pre-wrap',
  '[&_:not(pre)>code]:rounded-indicator [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:font-mono',
  '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2',
  '[&_hr]:my-3 [&_hr]:border-neutral',
  '[&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-standard [&_.ProseMirror-selectednode]:outline-offset-2',
  '[&_mark]:bg-warning-subtle [&_mark]:text-on-warning-subtle',
  '[&_table]:my-2 [&_table]:w-full! [&_table]:table-fixed [&_table]:border-collapse',
  '[&_:is(td,th)]:border [&_:is(td,th)]:border-neutral [&_:is(td,th)]:px-2 [&_:is(td,th)]:py-1 [&_:is(td,th)]:align-top [&_:is(td,th)]:break-words',
  '[&_th]:text-start [&_th]:font-semibold [&_.selectedCell]:bg-primary-subtle',
);

const taskList = cn(
  '[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:ps-0',
  '[&_ul[data-type=taskList]>li]:flex [&_ul[data-type=taskList]>li]:items-start [&_ul[data-type=taskList]>li]:gap-2',
  '[&_ul[data-type=taskList]>li>div]:min-w-0 [&_ul[data-type=taskList]>li>div]:grow',
  '[&_ul[data-type=taskList]>li[data-checked=true]>div>p]:text-neutral [&_ul[data-type=taskList]>li[data-checked=true]>div>p]:line-through',
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
      'w-auto shrink-0 rounded-standard text-neutral-bold',
      'transition-[color,background-color,box-shadow,--ids-state-opacity]',
      'state-layer hover:state-hover active:state-press ring-0! inset-ring-transparent!',
    ],
    scrollArea: [
      'min-h-0 grow rounded-[inherit]',
      '[:not(:empty)+&]:rounded-t-none [&:has(+:not(:empty))]:rounded-b-none',
    ],
    document: 'relative',
    content: [
      'min-h-24 outline-none text-neutral-bold',
      'selection:bg-primary/30 selection:text-neutral-bold',
      proseMirrorBaseline,
      documentBlocks,
      taskList,
      placeholder,
    ],
    count: ['ms-auto shrink-0 text-neutral tabular-nums', 'data-near-limit:text-neutral-bold'],
    bubble: 'w-auto concentric-p-1 p-0 [&>[data-scroll-area]>[data-scroll-area-viewport]]:p-0',
    bubbleBar: 'flex items-center gap-0.5 p-1',
    bubbleAnchor: 'pointer-events-none absolute',
    linkForm: 'flex flex-col gap-2',
    linkActions: 'flex justify-end gap-2',
    imageInput: 'hidden',
    uploadPlaceholder: 'inline-block h-24 w-40 max-w-full align-middle before:hidden',
    taskBox: 'mt-[calc((1lh_-_1rem)/2)]',
    textAlign: 'flex items-center gap-0.5',
  },
  variants: {
    variant: {
      outline: {
        root: fieldSurface.variant.outline,
        bar: 'border-field-bar',
        content: '[&_:is(pre,th)]:bg-field-code-outline [&_:not(pre)>code]:bg-field-code-outline',
      },
      soft: {
        root: fieldSurface.variant.soft,
        bar: 'border-field-bar',
        content: '[&_:is(pre,th)]:bg-neutral-subtler [&_:not(pre)>code]:bg-neutral-subtler',
      },
    } satisfies Record<EditorVariant, object>,
    size: {
      standard: {
        root: 'text-body-b3-regular',
        barItems: 'p-1',
        content: 'px-3 py-2',
        count: 'px-2 text-caption-c1-regular',
      },
      tiny: {
        root: 'text-caption-c1-regular',
        barItems: 'p-0.5',
        content: 'px-2 py-1.5',
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
