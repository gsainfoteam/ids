import { enUS } from 'date-fns/locale/en-US';
import { ko } from 'date-fns/locale/ko';

import { messages } from './messages';
import { invariant } from '../utils';

import type { Locale } from 'date-fns';

export type { Locale } from 'date-fns';

export type DateLocale = string | Locale;
export type HourCycle = '12h' | '24h';

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

// Quoted text in a pattern is literal, and French writes "HH 'h' mm", so it is dropped before
// the pattern is read for tokens.
export const tokensOf = (pattern: string) => pattern.replace(/'[^']*'/g, '');

const timeTokens = (locale: Locale, width: 'short' | 'long' | 'full') =>
  tokensOf(locale.formatLong?.time({ width }) ?? '');

export function hourCycleOf(locale: Locale): HourCycle {
  return /[ahK]/.test(timeTokens(locale, 'short')) ? '12h' : '24h';
}

// Korean and Chinese write the day period before the hour. A 24-hour locale shown on a 12-hour
// clock takes the order from the first of its time patterns that has a period at all.
export function periodFirst(locale: Locale): boolean {
  const tokens = (['short', 'long', 'full'] as const)
    .map((width) => timeTokens(locale, width))
    .find((pattern) => pattern.includes('a'));
  return !!tokens && tokens.indexOf('a') < tokens.search(/[hHkK]/);
}

// The locale's numeric date: y.MM.dd in ko, MM/dd/yyyy in en-US, dd.MM.y in de.
export const shortDatePattern = (locale: Locale) =>
  locale.formatLong?.date({ width: 'short' }) ?? 'yyyy-MM-dd';
