'use client';

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
  type Ref,
} from 'react';

import {
  FloatingFocusManager,
  useFloatingRootContext,
  type FloatingRootContext,
} from '@floating-ui/react';
import { noop } from 'es-toolkit';
import { RemoveScroll } from 'react-remove-scroll';

import { elementsAbove, type Layer } from './layer-stack';
import { raiseInTopLayer, raiseWhatStaysAboveLayers, showInTopLayer } from './top-layer';
import { mergeRefs } from '../../utils';

const SCROLLABLE_LAYERS_ABOVE = 8;

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
  const backdropRef = useRef<HTMLDivElement>(null);
  const givenBackdropRef = backdrop === false ? undefined : backdrop.ref;
  const setBackdrop = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(backdropRef, givenBackdropRef)(node),
    [givenBackdropRef],
  );

  const ownContext = useFloatingRootContext({
    open,
    onOpenChange: noop,
    elements: { reference: null, floating: element },
  });

  const [layersAboveScroll] = useState(() =>
    Array.from({ length: SCROLLABLE_LAYERS_ABOVE }, (_, index) => ({
      get current() {
        return elementsAbove(layer)[index] ?? null;
      },
    })),
  );

  const hasBackdrop = backdrop !== false;

  useLayoutEffect(() => {
    if (!open || !element) return;

    if (hasBackdrop && backdropRef.current) showInTopLayer(backdropRef.current);
    raiseInTopLayer(element);
    raiseWhatStaysAboveLayers();
  }, [open, element, hasBackdrop]);

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
        context={givenContext ?? ownContext}
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
