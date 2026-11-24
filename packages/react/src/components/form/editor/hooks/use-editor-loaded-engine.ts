'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { engineKey, loadEngine, type EditorFeature, type LoadedEngine } from '../lib/load-engine';

import type { EditorFormat } from '../lib/value';

export function useInternalEditorLoadedEngine(
  format: EditorFormat,
  features: readonly EditorFeature[],
) {
  const key = engineKey(format, features);
  const [loaded, setLoaded] = useState<LoadedEngine | null>(null);
  const requested = useRef({ format, features });
  useLayoutEffect(() => {
    requested.current = { format, features };
  });

  useEffect(() => {
    let mounted = true;
    void loadEngine(requested.current.format, requested.current.features).then((next) => {
      if (mounted) setLoaded(next);
    });
    return () => {
      mounted = false;
    };
  }, [key]);

  return loaded?.key === key ? loaded : null;
}
