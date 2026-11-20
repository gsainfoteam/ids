import { overlayStyles } from '../../../internal/overlay/styles';
import { slidesLayout } from '../../../internal/slides/layout';
import { cn, tv } from '../../../utils';

const chrome = cn(
  'z-10 opacity-[var(--image-viewer-presence,1)]',
  'transition-opacity duration-(--ids-motion-normal) ease-out motion-reduce:transition-none',
  'starting:opacity-0 group-data-ending-style/viewer:opacity-0',
  'group-data-swiping/viewer:transition-none',
);

const roomForTwoCaptionLines = cn(
  'text-body-b2-medium pt-[calc(--spacing(6)+2lh)] sm:pt-[calc(--spacing(8)+2lh)]',
);

const floatingSurface = cn('border border-neutral bg-panel text-neutral-bold shadow-md');

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
      'bg-neutral-subtle text-body-b3-regular text-neutral',
      '[&_svg]:size-[min(--spacing(6),40%)] [&_svg]:shrink-0',
    ],
    backdrop: [
      overlayStyles.backdrop,
      'touch-none bg-neutral-subtlest/95 opacity-[var(--image-viewer-presence,1)]',
      'duration-(--ids-motion-normal) ease-out data-swiping:transition-none',
    ],
    viewer: [
      'group/viewer fixed inset-0 z-50 m-0 grid size-full max-h-none max-w-none overflow-hidden',
      'grid-cols-1 grid-rows-[minmax(0,1fr)_auto_auto]',
      'border-0 bg-transparent p-0 text-neutral-bold outline-none',
    ],
    stage: 'relative col-start-1 row-start-1 min-h-0 overflow-x-clip overflow-y-visible',
    track: slidesLayout.track.horizontal,
    slide: [slidesLayout.slide, 'relative h-full'],
    area: [
      'flex size-full items-center justify-center px-3 pb-2 sm:px-6 [container-type:size]',
      roomForTwoCaptionLines,
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
    caption: [
      chrome,
      'col-start-1 row-start-1 mx-4 mt-4 line-clamp-2 max-w-2xl self-start justify-self-start sm:mx-6 sm:mt-6',
      'text-body-b2-medium text-neutral-bold',
      'group-data-zoomed/viewer:pointer-events-none group-data-zoomed/viewer:opacity-0',
    ],
    toolbar: [
      chrome,
      floatingSurface,
      'col-start-1 row-start-2 mx-3 mb-4 flex max-w-[calc(100%-var(--spacing)*6)] items-center gap-1 justify-self-center concentric-p-1 sm:mb-6',
    ],
    separator: 'mx-1 h-5 min-h-0 self-center',
    counter: 'px-1.5 text-body-b3-medium whitespace-nowrap tabular-nums',
    zoomReset: 'min-w-14 px-1.5 tabular-nums',
    prev: 'rtl:[&_svg]:-scale-x-100',
    next: 'rtl:[&_svg]:-scale-x-100',
    thumbnails: [chrome, 'col-start-1 row-start-3 min-w-0 justify-self-center'],
    thumbnailList: 'flex gap-2 px-3 pt-1 pb-4 [justify-content:safe_center] sm:pb-6',
    thumbnail: [
      'relative size-12 shrink-0 cursor-pointer overflow-hidden rounded-standard focus-ring',
      'opacity-50 transition-opacity duration-(--ids-motion-fast) motion-reduce:transition-none',
      'hover:opacity-100 data-current:opacity-100 data-current:ring-2 data-current:ring-(--ids-color-text-neutral-bold)',
    ],
    thumbnailImage: 'size-full object-cover',
    announcer: 'sr-only',
  },
  variants: {
    painted: {
      true: { placeholder: 'bg-neutral-subtle' },
      false: {},
    },
  },
  defaultVariants: { painted: false },
});
