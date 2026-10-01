import { slidesLayout } from '../../../internal/slides/layout';
import { cn, tv } from '../../../utils';

import type { ImageGroupLayout } from './group';

const chrome = cn(
  'z-10 opacity-[var(--image-viewer-presence,1)]',
  'transition-opacity duration-(--ids-motion-normal) ease-out motion-reduce:transition-none',
  'starting:opacity-0 group-data-ending-style/viewer:opacity-0',
  'group-data-swiping/viewer:transition-none',
);

const floatingSurface = cn(
  'border border-(--ids-color-border) bg-(--ids-color-surface) text-(--ids-color-on-surface) shadow-md',
);

export const imageStyle = tv({
  slots: {
    root: 'relative block w-full overflow-hidden rounded-standard focus-ring',
    trigger: [
      'relative block size-full cursor-zoom-in outline-none',
      'after:pointer-events-none after:absolute after:inset-0 after:bg-black/0',
      'after:transition-colors after:duration-(--ids-motion-fast) motion-reduce:after:transition-none',
      'hover:after:bg-black/8 active:after:bg-black/16',
    ],
    image: 'relative block size-full object-cover',
    placeholder: 'absolute inset-0 flex items-center justify-center rounded-none',
    fallback: [
      'flex size-full items-center justify-center gap-2 p-2 text-center',
      'bg-(--ids-color-muted) text-body-b3-regular text-(--ids-color-on-muted)',
      '[&_svg]:size-[min(1.5rem,40%)] [&_svg]:shrink-0',
    ],
    group: 'min-w-0',
    groupItem: 'flex min-w-0',
    backdrop: [
      'fixed inset-0 z-50 m-0 size-full max-h-none max-w-none touch-none border-0 p-0',
      'bg-black/50 opacity-[var(--image-viewer-presence,1)]',
      'transition-opacity duration-(--ids-motion-normal) ease-out motion-reduce:transition-none',
      'starting:opacity-0 data-ending-style:opacity-0 data-swiping:transition-none',
    ],
    viewer: [
      'group/viewer fixed inset-0 z-50 m-0 grid size-full max-h-none max-w-none overflow-hidden',
      'grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto_auto]',
      'border-0 bg-transparent p-0 text-(--ids-color-on-surface) outline-none',
    ],
    stage: [slidesLayout.viewport, 'relative col-start-1 row-[1/4] min-h-0'],
    track: slidesLayout.track.horizontal,
    slide: [slidesLayout.slide, 'relative h-full'],
    area: [
      'flex size-full items-center justify-center p-3 [container-type:size]',
      'group-data-ending-style/viewer:pointer-events-none',
    ],
    box: [
      'relative shrink-0 aspect-(--image-aspect)',
      'w-[min(100cqw,calc(100cqh*var(--image-aspect)),var(--image-natural-width,100cqw))]',
    ],
    picture: 'absolute inset-0 size-full object-contain select-none',
    underlay: 'absolute inset-0 size-full object-cover select-none',
    notice: [
      floatingSurface,
      'flex items-center gap-2 concentric-p-3 text-body-b3-regular [&_svg]:size-5 [&_svg]:shrink-0',
    ],
    toolbar: [
      chrome,
      floatingSurface,
      'col-start-1 row-start-1 m-3 flex items-center gap-1 self-start justify-self-end concentric-p-1',
    ],
    counter: 'px-2 text-body-b3-medium tabular-nums',
    prev: [
      chrome,
      'col-start-1 row-start-2 ms-3 self-center justify-self-start rtl:[&_svg]:-scale-x-100',
    ],
    next: [
      chrome,
      'col-start-1 row-start-2 me-3 self-center justify-self-end rtl:[&_svg]:-scale-x-100',
    ],
    caption: [
      chrome,
      floatingSurface,
      'col-start-1 row-start-3 mb-3 max-w-[min(40rem,calc(100%-1.5rem))] justify-self-center',
      'concentric-p-3 text-center text-body-b3-regular',
    ],
    thumbnails: [
      chrome,
      'col-start-1 row-start-4 min-w-0 border-t border-(--ids-color-border) bg-(--ids-color-surface)',
    ],
    thumbnailList: 'flex gap-2 p-2 [justify-content:safe_center]',
    thumbnail: [
      'relative size-12 shrink-0 cursor-pointer overflow-hidden rounded-standard focus-ring',
      'opacity-60 transition-opacity duration-(--ids-motion-fast) motion-reduce:transition-none',
      'hover:opacity-100 data-current:opacity-100 data-current:ring-2 data-current:ring-(--ids-color-on-surface)',
    ],
    thumbnailImage: 'size-full object-cover',
    announcer: 'sr-only',
  },
  variants: {
    layout: {
      row: { group: 'flex flex-row gap-2', groupItem: 'flex-1' },
      column: { group: 'flex flex-col gap-2' },
      grid: { group: 'grid grid-cols-[repeat(var(--image-columns),minmax(0,1fr))] gap-2' },
    } satisfies Record<ImageGroupLayout, object>,
    painted: {
      true: { placeholder: 'bg-(--ids-color-muted)' },
      false: {},
    },
  },
  defaultVariants: { layout: 'row', painted: false },
});
