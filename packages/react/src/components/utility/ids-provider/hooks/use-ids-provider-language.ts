'use client';

import { use, useEffect, useMemo } from 'react';

import { warnWhenTagLeavesLanguage } from '../../../../internal/date-locale';
import { LanguageContext } from '../../../../internal/translate';

import type { IdsLocale } from '../../../../internal/locale';

export function useInternalIdsProviderLanguage(locale: IdsLocale | undefined) {
  const inherited = use(LanguageContext);
  const language = useMemo(() => (locale ? { locale } : inherited), [locale, inherited]);

  useEffect(() => {
    if (locale) warnWhenTagLeavesLanguage(locale);
  }, [locale]);

  return language;
}
