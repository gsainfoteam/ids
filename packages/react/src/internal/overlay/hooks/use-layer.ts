'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import { registerLayer, type Layer, type LayerOptions } from '../lib/layer-stack';

export function useInternalLayer(active: boolean, options: LayerOptions) {
  const latest = useRef(options);

  useLayoutEffect(() => {
    latest.current = options;
  });

  const [layer] = useState<Layer>(() => ({
    get kind() {
      return latest.current.kind;
    },
    element: () => latest.current.element(),
    anchor: () => latest.current.anchor?.() ?? null,
    dismissible: () => latest.current.dismissible ?? true,
    dismiss: (reason, event) => latest.current.onDismiss(reason, event),
    positionChanged: (position) => latest.current.onPositionChange?.(position),
  }));

  const { kind } = options;

  useLayoutEffect(() => {
    if (!active) return;

    const doc = layer.element()?.ownerDocument ?? document;
    return registerLayer(doc, layer);
  }, [active, kind, layer]);

  return layer;
}
