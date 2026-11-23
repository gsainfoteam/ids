'use client';

import { createContext, use, useCallback, useMemo } from 'react';

import { intlWords, type IntlWords } from './intl-words';
import {
  DEFAULT_LOCALE,
  formatDefaultMessage,
  type IdsMessageKey,
  type IdsMessageValues,
  type MessageTree,
} from './messages';

export type IdsTranslate = (key: IdsMessageKey, values?: IdsMessageValues) => string | undefined;

export type Translate = (key: IdsMessageKey, values?: IdsMessageValues) => string;

export type LanguageContextValue = { translate?: IdsTranslate; locale?: string };

export const LanguageContext = createContext<LanguageContextValue>({});

export function useTranslate(ownCatalog?: MessageTree): Translate {
  const { translate } = use(LanguageContext);

  return useCallback(
    (key, values) => {
      const translated = translate?.(key, values);
      return translated === undefined || translated === key
        ? formatDefaultMessage(key, values, ownCatalog)
        : translated;
    },
    [translate, ownCatalog],
  );
}

export function useProviderLocale(): string | undefined {
  return use(LanguageContext).locale;
}

export function useIntlWords(locale?: string): IntlWords {
  const providerLocale = useProviderLocale();
  const tag = locale ?? providerLocale ?? DEFAULT_LOCALE;

  return useMemo(() => intlWords(tag), [tag]);
}
