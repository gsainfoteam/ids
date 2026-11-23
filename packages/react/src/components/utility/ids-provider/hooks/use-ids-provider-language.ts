'use client';

import { use, useMemo } from 'react';

import { LanguageContext, type IdsTranslate } from '../../../../internal/translate';

export function useInternalIdsProviderLanguage(
  translate: IdsTranslate | undefined,
  locale: string | undefined,
) {
  const inherited = use(LanguageContext);

  return useMemo(
    () => ({
      translate: translate ?? inherited.translate,
      locale: locale ?? inherited.locale,
    }),
    [translate, locale, inherited.translate, inherited.locale],
  );
}
