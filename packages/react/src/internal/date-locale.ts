import { enUS } from 'date-fns/locale/en-US';
import { ko } from 'date-fns/locale/ko';

import { messages } from './messages';
import { invariant } from '../utils';

import type { Locale } from 'date-fns';

export type { Locale } from 'date-fns';

export type DateLocale = string | Locale;

// Only the languages IDS has messages for are looked up by tag. A table of every date-fns locale
// would land in each app's bundle whether it is used or not, so other languages come in as a
// Locale object the app imports itself.
const builtIn: Record<string, Locale> = { ko, 'ko-KR': ko, en: enUS, 'en-US': enUS };

export function resolveLocale(locale: DateLocale = messages.locale): Locale {
  if (typeof locale !== 'string') return locale;
  const resolved = builtIn[locale];
  invariant(
    resolved,
    `locale "${locale}" has no built-in date-fns locale. Pass a Locale object instead, e.g. import { de } from 'date-fns/locale'.`,
  );
  return resolved;
}
