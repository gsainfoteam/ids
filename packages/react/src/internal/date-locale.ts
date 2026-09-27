import { enUS } from 'date-fns/locale/en-US';
import { ko } from 'date-fns/locale/ko';

import { messages } from './messages';
import { invariant } from '../utils';

import type { Locale } from 'date-fns';

export type { Locale } from 'date-fns';

export type DateLocale = string | Locale;
export type HourCycle = '12h' | '24h';

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

export const tokensOf = (pattern: string) => pattern.replace(/'[^']*'/g, '');

const timeTokens = (locale: Locale, width: 'short' | 'long' | 'full') =>
  tokensOf(locale.formatLong?.time({ width }) ?? '');

export function patternHourCycle(locale: Locale): HourCycle {
  return /[ahK]/.test(timeTokens(locale, 'short')) ? '12h' : '24h';
}

function intlHourCycle(code: string) {
  try {
    return new Intl.DateTimeFormat(code, { hour: 'numeric' }).resolvedOptions().hourCycle;
  } catch {
    return undefined;
  }
}

export function hourCycleOf(locale: Locale): HourCycle {
  const cycle = locale.code ? intlHourCycle(locale.code) : undefined;
  if (!cycle) return patternHourCycle(locale);
  return cycle === 'h11' || cycle === 'h12' ? '12h' : '24h';
}

export function periodFirst(locale: Locale): boolean {
  const tokens = (['short', 'long', 'full'] as const)
    .map((width) => timeTokens(locale, width))
    .find((pattern) => pattern.includes('a'));
  return !!tokens && tokens.indexOf('a') < tokens.search(/[hHkK]/);
}

export const shortDatePattern = (locale: Locale) =>
  locale.formatLong?.date({ width: 'short' }) ?? 'yyyy-MM-dd';
