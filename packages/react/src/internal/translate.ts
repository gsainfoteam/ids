'use client';

import { createContext, use, useCallback } from 'react';

import { formatDefaultMessage, type IdsMessageKey, type IdsMessageValues } from './messages';

export type IdsTranslate = (key: IdsMessageKey, values?: IdsMessageValues) => string | undefined;

export type Translate = (key: IdsMessageKey, values?: IdsMessageValues) => string;

export type LanguageContextValue = { translate?: IdsTranslate; locale?: string };

export const LanguageContext = createContext<LanguageContextValue>({});

export function useTranslate(): Translate {
  const { translate } = use(LanguageContext);

  return useCallback(
    (key, values) => {
      const translated = translate?.(key, values);
      return translated === undefined || translated === key
        ? formatDefaultMessage(key, values)
        : translated;
    },
    [translate],
  );
}

export function useProviderLocale(): string | undefined {
  return use(LanguageContext).locale;
}
