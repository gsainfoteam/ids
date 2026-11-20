import { fieldSurface } from '../../../internal/surfaces/field-surface';
import { cn, tv } from '../../../utils';
import { codeTokens } from '../../data/code-block/style';
import { documentText } from '../../typography/rich-text/style';

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

const editorBlocks = cn(
  '[&_.suggestion]:text-primary',
  '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2',
  '[&_hr:not([data-divider])]:my-3 [&_hr:not([data-divider])]:border-neutral',
  '[&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-standard [&_.ProseMirror-selectednode]:outline-offset-2',
  '[&_table]:my-2 [&_table]:w-full! [&_table]:table-fixed [&_table]:border-collapse',
  '[&_:is(td,th)]:border [&_:is(td,th)]:border-neutral [&_:is(td,th)]:px-2 [&_:is(td,th)]:py-1 [&_:is(td,th)]:align-top [&_:is(td,th)]:break-words',
  '[&_th]:text-start [&_th]:font-semibold [&_.selectedCell]:bg-primary-subtle',
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
      documentText,
      editorBlocks,
      codeTokens,
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
    codeBlock: 'flex flex-col concentric-p-1',
    codeBlockBar: 'flex items-center justify-between gap-1',
    codeLanguage: 'w-auto shrink-0 text-neutral',
    codeCopyStatus: 'sr-only',
    codePre: 'px-2 py-1 font-mono whitespace-pre-wrap',
    glyphButton: [
      '-m-1 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-indicator p-1',
      'focus-ring state-layer data-hovered:state-hover data-active:state-press',
      'transition-[box-shadow,--ids-state-opacity] duration-(--ids-motion-fast) motion-reduce:transition-none',
      'disabled:cursor-default',
    ],
    details: [
      'relative',
      '[&_[data-type=detailsSummary]]:py-2 [&_[data-type=detailsSummary]]:pe-8 [&_[data-type=detailsSummary]]:font-medium',
      '[&_[data-type=detailsContent]]:pb-2',
      '[&:not([data-open])_[data-type=detailsContent]]:hidden',
    ],
    detailsToggle: [
      'absolute end-1 top-[calc(--spacing(2)+(1lh-var(--spacing)*6)/2)] m-0 size-6 text-neutral [&_svg]:size-4',
      '[&_svg]:transition-transform [&_svg]:duration-(--ids-motion-normal) motion-reduce:[&_svg]:transition-none',
      'data-open:[&_svg]:rotate-180',
    ],
    suggestion: 'w-64 concentric-p-1 p-0',
    suggestionScroll: 'max-h-72 rounded-[inherit]',
    suggestionList: 'flex flex-col p-1 outline-none',
    suggestionOption: 'pe-2.5 [&_svg]:size-(--ids-size-icon-standard)',
    mentionText: 'flex min-w-0 flex-col',
    mentionLabel: 'truncate',
    mentionDescription: 'truncate text-caption-c1-regular text-neutral',
    blockHandle:
      'absolute start-1.5 z-10 m-0 cursor-grab text-neutral active:cursor-grabbing [&_svg]:size-4 data-hidden:pointer-events-none data-hidden:invisible',
    detailsPlaceholder: 'pointer-events-none absolute start-0 top-2 font-medium text-neutral',
  },
  variants: {
    variant: {
      outline: {
        root: fieldSurface.variant.outline,
        bar: 'border-field-bar',
        content:
          '[&_:is([data-code-block],th)]:bg-field-code-outline [&_:not(pre)>code]:bg-field-code-outline',
      },
      soft: {
        root: fieldSurface.variant.soft,
        bar: 'border-field-bar',
        content:
          '[&_:is([data-code-block],th)]:bg-neutral-subtler [&_:not(pre)>code]:bg-neutral-subtler',
      },
    } satisfies Record<EditorVariant, object>,
    size: {
      standard: {
        root: 'text-body-b3-regular',
        barItems: 'p-1',
        content: 'px-3 py-2',
        blockHandle: 'size-6',
        count: 'px-2 text-caption-c1-regular',
      },
      tiny: {
        root: 'text-caption-c1-regular',
        barItems: 'p-0.5',
        content: 'px-2 py-1.5',
        blockHandle: 'size-5 p-0.5',
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
  compoundVariants: [
    { editable: true, size: 'standard', class: { content: 'ps-9' } },
    { editable: true, size: 'tiny', class: { content: 'ps-8' } },
  ],
  defaultVariants: {
    variant: 'outline',
    size: 'standard',
    editable: true,
  },
});
