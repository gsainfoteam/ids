'use client';

import { DateFormatter } from '@internationalized/date';
import { memoize } from 'es-toolkit';

import { useMessageContext } from './context';
import { DEFAULT_LOCALE } from '../../../internal/messages';
import { useProviderLocale } from '../../../internal/translate';

const clockOf = memoize(
  (locale: string) => new DateFormatter(locale, { hour: 'numeric', minute: '2-digit' }),
);

export function MessageTime({ time }: { time: Date }) {
  const { styles, locale } = useMessageContext('Message');
  const providerLocale = useProviderLocale();

  return (
    <time dateTime={time.toISOString()} suppressHydrationWarning className={styles.time()}>
      {clockOf(locale ?? providerLocale ?? DEFAULT_LOCALE).format(time)}
    </time>
  );
}
