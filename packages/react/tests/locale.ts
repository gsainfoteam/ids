import { ko } from '../src/locales/ko';

import type { IdsLocale } from '../src';

const languageOf = (tag: string) => {
  try {
    return new Intl.Locale(tag).language;
  } catch {
    return 'ko';
  }
};

export const koreanTextIn = (tag: string | undefined): IdsLocale | undefined =>
  tag === undefined ? undefined : { language: languageOf(tag), tag, messages: {}, base: ko };
