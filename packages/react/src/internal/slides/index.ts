export {
  useInternalSlides,
  type SlideProps,
  type Slides,
  type SlidesDirection,
  type SlidesDragEvent,
  type SlideState,
  type SlidesOptions,
  type SlidesWatchDrag,
} from './hooks/use-slides';
export { SlidesAnnouncer, type SlidesAnnouncerProps } from './parts/announcer';
export { moveWithKeys } from './lib/slide-keys';
export {
  estimateSlides,
  slidesLayout,
  type SlidesAlign,
  type SlidesEstimate,
  type SlidesOrientation,
  type SlidesPerScroll,
} from './lib/layout';
