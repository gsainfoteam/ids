import { CarouselContent, type CarouselContentProps } from './content';
import {
  CarouselIndicator,
  type CarouselIndicatorProps,
  type CarouselIndicatorState,
} from './indicator';
import { CarouselIndicators, type CarouselIndicatorsProps } from './indicators';
import { CarouselNext, type CarouselNextProps } from './next';
import { CarouselPause, type CarouselPauseProps } from './pause';
import { CarouselPrev, type CarouselPrevProps } from './prev';
import { CarouselRoot, type CarouselProps, type CarouselState } from './root';
import { CarouselSlide, type CarouselSlideProps, type CarouselSlideState } from './slide';
import { carouselStyle } from './style';

import type {
  CarouselAutoplay,
  CarouselAutoScroll,
  CarouselAutoScrollDirection,
} from './use-carousel-motion';
import type {
  SlidesAlign,
  SlidesOrientation,
  SlidesPerScroll,
} from '../../../internal/slides/layout';

export function Carousel(props: Carousel.Props) {
  return <CarouselRoot {...props} />;
}

export namespace Carousel {
  export type Props = CarouselProps;
  export type State = CarouselState;
  export type Orientation = SlidesOrientation;
  export type Align = SlidesAlign;
  export type SlidesToScroll = SlidesPerScroll;
  export type Autoplay = CarouselAutoplay;
  export type AutoScroll = CarouselAutoScroll;
  export type AutoScrollDirection = CarouselAutoScrollDirection;

  export type ContentProps = CarouselContentProps;
  export type SlideProps = CarouselSlideProps;
  export type PrevProps = CarouselPrevProps;
  export type NextProps = CarouselNextProps;
  export type IndicatorsProps = CarouselIndicatorsProps;
  export type IndicatorProps = CarouselIndicatorProps;
  export type PauseProps = CarouselPauseProps;

  export const Content = CarouselContent;
  export namespace Content {
    export type Props = CarouselContentProps;
  }

  export const Slide = CarouselSlide;
  export namespace Slide {
    export type Props = CarouselSlideProps;
    export type State = CarouselSlideState;
  }

  export const Prev = CarouselPrev;
  export namespace Prev {
    export type Props = CarouselPrevProps;
  }

  export const Next = CarouselNext;
  export namespace Next {
    export type Props = CarouselNextProps;
  }

  export const Indicators = CarouselIndicators;
  export namespace Indicators {
    export type Props = CarouselIndicatorsProps;
  }

  export const Indicator = CarouselIndicator;
  export namespace Indicator {
    export type Props = CarouselIndicatorProps;
    export type State = CarouselIndicatorState;
  }

  export const Pause = CarouselPause;
  export namespace Pause {
    export type Props = CarouselPauseProps;
  }

  export const Style = carouselStyle;
}

export type { CarouselProps, CarouselState } from './root';
