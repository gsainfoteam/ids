'use client';

import { createContext, use, useCallback, useMemo } from 'react';

import { intlWords, type IntlWords } from './intl-words';
import {
  DEFAULT_LOCALE,
  formatDefaultMessage,
  formatLocaleMessage,
  type IdsMessageKey,
  type IdsMessageValues,
  type MessageTree,
} from './messages';
import { isDevelopment } from '../utils/dev';

import type { IdsLocale } from './locale';

export type Translate = (key: IdsMessageKey, values?: IdsMessageValues) => string;

export type LanguageContextValue = { locale?: IdsLocale; tag?: string };

export const LanguageContext = createContext<LanguageContextValue>({});

const reportedMissing = new Set<string>();

function reportMissing(locale: IdsLocale, key: IdsMessageKey) {
  const id = `${locale.language}:${key}`;
  if (!isDevelopment || reportedMissing.has(id)) return;
  reportedMissing.add(id);
  console.error(
    `[IDS] The "${locale.language}" locale has no message "${key}". Give it every message, or a base locale with defineIdsLocale({ ..., base }).`,
  );
}

export function useTranslate(ownCatalog?: MessageTree): Translate {
  const { locale, tag } = use(LanguageContext);

  return useCallback(
    (key, values) => {
      if (!locale) return formatDefaultMessage(key, values, ownCatalog);
      const message = formatLocaleMessage(locale, key, values, tag);
      if (message !== undefined) return message;
      reportMissing(locale, key);
      return formatDefaultMessage(key, values, ownCatalog);
    },
    [locale, tag, ownCatalog],
  );
}

export function useProviderLocale(): string {
  const { locale, tag } = use(LanguageContext);
  return tag ?? locale?.tag ?? DEFAULT_LOCALE;
}

export function useIntlWords(locale?: string): IntlWords {
  const providerLocale = useProviderLocale();
  const tag = locale ?? providerLocale;

  return useMemo(() => intlWords(tag), [tag]);
}
