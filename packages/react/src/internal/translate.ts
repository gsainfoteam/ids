'use client';

import { createContext, use, useCallback } from 'react';

import {
  formatDefaultMessage,
  type IdsMessageKey,
  type IdsMessageValues,
  type MessageTree,
} from './messages';

export type IdsTranslate = (key: IdsMessageKey, values?: IdsMessageValues) => string | undefined;

export type Translate = (key: IdsMessageKey, values?: IdsMessageValues) => string;

export type LanguageContextValue = { translate?: IdsTranslate; locale?: string };

export const LanguageContext = createContext<LanguageContextValue>({});

export function useInternalTranslate(ownCatalog?: MessageTree): Translate {
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

export function useInternalProviderLocale(): string | undefined {
  return use(LanguageContext).locale;
}
