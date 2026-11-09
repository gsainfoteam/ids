'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';

import {
  highlightLines,
  isBuiltIn,
  isPlainText,
  lazyLanguagesLoaded,
  loadLazyLanguages,
  subscribeToLazyLanguages,
} from './highlight';

const NOT_ON_THE_SERVER = () => false;

export function useHighlightedLines(code: string, language: string) {
  const lazyLoaded = useSyncExternalStore(
    subscribeToLazyLanguages,
    lazyLanguagesLoaded,
    NOT_ON_THE_SERVER,
  );
  const needsLazyLanguages = !lazyLoaded && !isPlainText(language) && !isBuiltIn(language);

  useEffect(() => {
    if (needsLazyLanguages) loadLazyLanguages();
  }, [needsLazyLanguages]);

  return useMemo(() => highlightLines(code, language, lazyLoaded), [code, language, lazyLoaded]);
}
