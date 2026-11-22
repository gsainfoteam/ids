import { dragSurface } from '../../../internal/drag-surface';
import { fieldSurface } from '../../../internal/surfaces/field-surface';
import { cn, tv } from '../../../utils';
import { documentText } from '../../typography/rich-text/style';

import type { EditorVariant } from './root';
import type { IdsSize } from '../../../tokens/types';
import type { CalloutKind } from '../../typography/rich-text/schema/callout';

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
  '[&_.ProseMirror-selectednode:not(:has(>[data-node-view-wrapper]))]:relative',
  '[&_.ProseMirror-selectednode:not(:has(>[data-node-view-wrapper]))]:after:pointer-events-none [&_.ProseMirror-selectednode:not(:has(>[data-node-view-wrapper]))]:after:absolute [&_.ProseMirror-selectednode:not(:has(>[data-node-view-wrapper]))]:after:-inset-x-1.5 [&_.ProseMirror-selectednode:not(:has(>[data-node-view-wrapper]))]:after:-inset-y-0.5 [&_.ProseMirror-selectednode:not(:has(>[data-node-view-wrapper]))]:after:rounded-standard [&_.ProseMirror-selectednode:not(:has(>[data-node-view-wrapper]))]:after:bg-primary-solid/15',
  '[&_.ProseMirror-selectednode>[data-node-view-wrapper]:not([data-image])]:relative',
  '[&_.ProseMirror-selectednode>[data-node-view-wrapper]:not([data-image])]:after:pointer-events-none [&_.ProseMirror-selectednode>[data-node-view-wrapper]:not([data-image])]:after:absolute [&_.ProseMirror-selectednode>[data-node-view-wrapper]:not([data-image])]:after:inset-0 [&_.ProseMirror-selectednode>[data-node-view-wrapper]:not([data-image])]:after:rounded-[inherit] [&_.ProseMirror-selectednode>[data-node-view-wrapper]:not([data-image])]:after:bg-primary-solid/15',
  '[&_.ProseMirror-selectednode>[data-mention]]:after:rounded-full',
  '[&_[data-block-dragging]]:opacity-40',
);

const editorBlocks = cn(
  '[&_.suggestion]:text-primary',
  '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2',
  '[&_hr:not([data-divider])]:my-3 [&_hr:not([data-divider])]:border-neutral',
  '[&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-standard',
  '[&_table]:w-full! [&_:is(td,th)]:break-words [&_.selectedCell]:bg-primary-soft',
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
    scrollArea: 'min-h-0 grow',
    document: 'relative',
    content: [
      'min-h-24 outline-none text-neutral-strong',
      'selection:bg-primary-solid/30 selection:text-neutral-strong',
      proseMirrorBaseline,
      documentText,
      editorBlocks,
      placeholder,
    ],
    count: ['ms-auto shrink-0 text-neutral tabular-nums', 'data-near-limit:text-neutral-strong'],
    bubble: 'w-auto concentric-p-1 p-0 [&>[data-scroll-area]>[data-scroll-area-viewport]]:p-0',
    bubbleBar: 'flex items-center gap-0.5 p-1',
    bubbleAnchor: 'pointer-events-none absolute',
    linkForm: 'flex flex-col gap-2',
    linkActions: 'flex justify-end gap-2',
    imageInput: 'hidden',
    imageFrame: [
      'block w-full',
      '[&_[data-resizable-handle]]:transition-opacity [&_[data-resizable-handle]]:duration-(--ids-motion-fast)',
      '[&:not(:hover,:focus-within,[data-selected])_[data-resizable-handle]]:opacity-0',
    ],
    imageResizable: 'w-fit max-w-full rounded-standard',
    resizedImage: [
      'block h-auto w-full rounded-standard',
      'in-data-selected:outline-2 in-data-selected:-outline-offset-2 in-data-selected:outline-primary-strong',
    ],
    uploadPlaceholder: 'inline-block h-24 w-40 max-w-full align-middle before:hidden',
    taskBox: 'mt-[calc((1lh_-_1rem)/2)]',
    textAlign: 'flex items-center gap-0.5',
    codeLanguage: '-ms-2.5 w-auto shrink-0 font-mono text-neutral',
    codePre: 'px-4',
    glyphButton: [
      '-m-1 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-standard p-1',
      'focus-ring state-layer data-hovered:state-hover data-active:state-press',
      'transition-[box-shadow,--ids-state-opacity] duration-(--ids-motion-fast) motion-reduce:transition-none',
      'disabled:cursor-default',
    ],
    details: ['relative', '[&:not([data-open])_[data-type=detailsContent]]:hidden'],
    detailsToggle: [
      'absolute end-1 m-0 size-6 text-neutral [&_svg]:size-4',
      '[&_svg]:transition-transform [&_svg]:duration-(--ids-motion-normal) motion-reduce:[&_svg]:transition-none',
      'data-open:[&_svg]:rotate-180',
    ],
    suggestion: 'w-64 concentric-p-1 p-0 [&>[data-scroll-area]>[data-scroll-area-viewport]]:p-0',
    suggestionScroll: 'max-h-72 rounded-[inherit]',
    suggestionList: 'flex flex-col p-1 outline-none',
    suggestionOption: 'pe-2.5 [&_svg]:size-(--ids-size-icon-standard)',
    calloutKindIcon: 'text-scheme',
    destructiveItem: 'text-danger',
    mentionText: 'flex min-w-0 flex-col',
    mentionLabel: 'truncate',
    mentionDescription: 'truncate text-caption-c1-regular text-neutral',
    blockHandle: [
      'absolute z-10 m-0',
      'cursor-grab text-neutral active:cursor-grabbing [&_svg]:size-4',
      'transition-[opacity,visibility,--ids-state-opacity] transition-discrete duration-(--ids-motion-fast) motion-reduce:transition-none',
      'data-hidden:pointer-events-none data-hidden:invisible data-hidden:opacity-0',
    ],
    dropLine: dragSurface.dropLine,
    dropCursor: cn(dragSurface.dropLine, 'translate-y-0'),
    dragPreview: cn('pointer-events-none concentric-p-2', dragSurface.preview),
    imageUrlError: 'text-caption-c1-regular text-danger',
    tableSizePicker: 'flex flex-col gap-2',
    tableSizeGrid: 'grid grid-cols-10 gap-1',
    tableSizeCell: [
      'size-4 cursor-pointer rounded-indicator bg-field-outline inset-ring-1 inset-ring-neutral',
      'focus-ring focus-ring-visible:z-10',
      'data-covered:bg-primary-soft data-covered:inset-ring-primary-strong',
    ],
    tableSizeLabel: 'text-center text-caption-c1-regular text-neutral tabular-nums',
    detailsPlaceholder: 'pointer-events-none absolute start-0 text-neutral',
  },
  variants: {
    variant: {
      outline: {
        root: fieldSurface.variant.outline,
        content: '[&_:not(pre)>code]:bg-field-code-outline',
      },
      soft: {
        root: fieldSurface.variant.soft,
        content: '[&_:not(pre)>code]:bg-block',
      },
    } satisfies Record<EditorVariant, object>,
    size: {
      standard: {
        root: 'text-body-b3-regular',
        barItems: 'p-1',
        content: 'px-3 py-2',
        blockHandle: 'size-6',
        detailsToggle: 'top-[calc(--spacing(4)+(1lh-var(--spacing)*6)/2)]',
        detailsPlaceholder: 'top-4 text-body-b3-medium',
        count: 'px-2 text-caption-c1-regular',
      },
      tiny: {
        root: 'text-caption-c1-regular',
        barItems: 'p-0.5',
        content: 'px-2 py-1.5',
        blockHandle: 'size-5 rounded-indicator p-0.5',
        detailsToggle: 'top-[calc(--spacing(3)+(1lh-var(--spacing)*6)/2)]',
        detailsPlaceholder: 'top-3 text-caption-c1-medium',
        count: 'px-1.5 text-caption-c2-regular',
      },
    } satisfies Record<IdsSize, object>,
    framed: {
      true: { root: 'concentric-p-1', scrollArea: 'rounded-standard' },
      false: { scrollArea: 'rounded-[inherit]' },
    },
    calloutKind: {
      info: { calloutKindIcon: 'scheme-info' },
      success: { calloutKindIcon: 'scheme-success' },
      warning: { calloutKindIcon: 'scheme-warning' },
      danger: { calloutKindIcon: 'scheme-danger' },
    } satisfies Record<CalloutKind, object>,
    blockEditor: {
      true: {},
      false: {},
    },
    editable: {
      true: {},
      false: { content: 'cursor-default' },
    },
  },
  compoundVariants: [
    {
      blockEditor: true,
      size: 'standard',
      class: { content: 'ps-10', blockHandle: 'start-2' },
    },
    {
      blockEditor: true,
      size: 'tiny',
      class: { content: 'ps-8', blockHandle: 'start-1.5' },
    },
    {
      framed: true,
      variant: 'outline',
      class: {
        root: 'bg-neutral-soft shadow-none inset-ring-transparent',
        scrollArea: 'bg-field-outline shadow-xs inset-ring-1 inset-ring-field-outline',
      },
    },
    {
      framed: true,
      variant: 'soft',
      class: { scrollArea: 'bg-surface' },
    },
  ],
  defaultVariants: {
    variant: 'outline',
    size: 'standard',
    editable: true,
    framed: false,
    blockEditor: false,
  },
});
