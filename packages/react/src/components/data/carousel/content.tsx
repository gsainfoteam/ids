'use client';

import {
  cloneElement,
  isValidElement,
  useCallback,
  type ComponentProps,
  type PointerEvent,
  type ReactNode,
} from 'react';

import { SlideIndexContext, useCarouselContext } from './context';
import { CarouselNext } from './next';
import { CarouselPrev } from './prev';
import {
  flattenFragments,
  invariant,
  mergeEventHandlers,
  mergeProps,
  mergeRefs,
} from '../../../utils';

export type CarouselContentProps = Omit<ComponentProps<'div'>, 'children'> & {
  asChild?: boolean;
  children?: ReactNode;
};

const holderOf = (children: ReactNode, asChild: boolean | undefined) =>
  asChild && isValidElement<{ children?: ReactNode }>(children) ? children : undefined;

export function slidesOf(children: ReactNode, asChild: boolean | undefined) {
  const holder = holderOf(children, asChild);
  return flattenFragments(holder ? holder.props.children : children).filter(isValidElement);
}

export function CarouselContent({
  asChild = false,
  className,
  children,
  ref,
  onPointerEnter,
  onPointerLeave,
  ...rest
}: CarouselContentProps) {
  const carousel = useCarouselContext('Carousel.Content');
  const { slides, styles, onContentHover } = carousel;
  const { viewportRef } = slides;
  const holder = holderOf(children, asChild);
  invariant(
    !asChild || holder,
    'Carousel.Content: asChild needs one element whose children are the slides.',
  );

  const attachViewport = useCallback(
    (node: HTMLDivElement | null) => mergeRefs<HTMLDivElement>(viewportRef, ref)(node),
    [viewportRef, ref],
  );

  const hoverWith = (hovered: boolean) => (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') onContentHover(hovered);
  };

  const viewport = {
    ...rest,
    ref: attachViewport,
    'data-carousel-content': '',
    className: styles.content({ className }),
    onPointerEnter: mergeEventHandlers(onPointerEnter, hoverWith(true)),
    onPointerLeave: mergeEventHandlers(onPointerLeave, hoverWith(false)),
    children: (
      <>
        {carousel.edgeControls && <CarouselPrev className={styles.edgePrev()} />}
        {carousel.edgeControls && <CarouselNext className={styles.edgeNext()} />}
        <div {...slides.trackProps} className={styles.track()}>
          {slidesOf(children, asChild).map((slide, index) => (
            <SlideIndexContext key={slide.key} value={index}>
              {slide}
            </SlideIndexContext>
          ))}
        </div>
      </>
    ),
  };

  // eslint-disable-next-line react-hooks/refs
  if (holder) return cloneElement(holder, mergeProps(holder.props, viewport));
  return <div {...viewport} />;
}

CarouselContent.displayName = 'Carousel.Content';
