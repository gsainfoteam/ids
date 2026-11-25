'use client';

import { type ComponentProps, type ReactElement, type Ref } from 'react';

import { FloatingFocusManager, type FloatingRootContext } from '@floating-ui/react';
import { RemoveScroll } from 'react-remove-scroll';

import { useInternalModalLayer } from '../hooks/use-modal-layer';
import { elementsAbove, type Layer } from '../lib/layer-stack';

export type ModalLayerProps = {
  open: boolean;
  layer: Layer;
  element: HTMLElement | null;
  contentRef: Ref<HTMLElement>;
  context?: FloatingRootContext;
  backdrop?: (ComponentProps<'div'> & { [data: `data-${string}`]: string | undefined }) | false;
  onBackdropClick?: () => void;
  children: ReactElement;
};

export function ModalLayer({
  open,
  layer,
  element,
  contentRef,
  context: givenContext,
  backdrop = {},
  onBackdropClick,
  children,
}: ModalLayerProps) {
  const hasBackdrop = backdrop !== false;
  const { setBackdrop, context, layersAboveScroll } = useInternalModalLayer({
    open,
    layer,
    element,
    hasBackdrop,
    backdropRef: backdrop === false ? undefined : backdrop.ref,
  });

  return (
    <>
      {hasBackdrop && (
        <div
          {...backdrop}
          ref={setBackdrop}
          popover="manual"
          aria-hidden="true"
          onClick={(event) => {
            backdrop.onClick?.(event);
            if (!event.defaultPrevented) onBackdropClick?.();
          }}
        />
      )}
      <FloatingFocusManager
        context={givenContext ?? context}
        disabled={!open}
        modal
        closeOnFocusOut={false}
        initialFocus={-1}
        returnFocus={false}
        getInsideElements={() => elementsAbove(layer)}
      >
        <RemoveScroll
          ref={contentRef}
          enabled={open}
          allowPinchZoom
          forwardProps
          shards={layersAboveScroll}
        >
          {children}
        </RemoveScroll>
      </FloatingFocusManager>
    </>
  );
}
