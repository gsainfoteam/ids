'use client';

import { DateFormatter } from '@internationalized/date';
import { memoize } from 'es-toolkit';

import { DEFAULT_LOCALE } from '../../../../internal/messages';
import { useInternalProviderLocale } from '../../../../internal/translate';
import { useInternalMessageContext } from '../context';

const clockOf = memoize(
  (locale: string) => new DateFormatter(locale, { hour: 'numeric', minute: '2-digit' }),
);

export function MessageTime({ time }: { time: Date }) {
  const { styles, locale } = useInternalMessageContext('Message');
  const providerLocale = useInternalProviderLocale();

  return (
    <time dateTime={time.toISOString()} suppressHydrationWarning className={styles.time()}>
      {clockOf(locale ?? providerLocale ?? DEFAULT_LOCALE).format(time)}
    </time>
  );
}
