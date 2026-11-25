'use client';

import { useCallback, useLayoutEffect, useRef, useState, type Ref, type RefCallback } from 'react';

import { useFloatingRootContext } from '@floating-ui/react';
import { noop } from 'es-toolkit';

import { mergeRefs } from '../../../utils';
import { elementsAbove, type Layer } from '../lib/layer-stack';
import { raiseInTopLayer, raiseWhatStaysAboveLayers, showInTopLayer } from '../lib/top-layer';

const SCROLLABLE_LAYERS_ABOVE = 8;

export type UseModalLayerOptions = {
  open: boolean;
  layer: Layer;
  element: HTMLElement | null;
  hasBackdrop: boolean;
  backdropRef: Ref<HTMLDivElement> | undefined;
};

export function useInternalModalLayer({
  open,
  layer,
  element,
  hasBackdrop,
  backdropRef: givenBackdropRef,
}: UseModalLayerOptions) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const setBackdrop: RefCallback<HTMLDivElement> = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(backdropRef, givenBackdropRef)(node),
    [givenBackdropRef],
  );

  const context = useFloatingRootContext({
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

  useLayoutEffect(() => {
    if (!open || !element) return;

    if (hasBackdrop && backdropRef.current) showInTopLayer(backdropRef.current);
    raiseInTopLayer(element);
    raiseWhatStaysAboveLayers();
  }, [open, element, hasBackdrop]);

  return { setBackdrop, context, layersAboveScroll };
}
