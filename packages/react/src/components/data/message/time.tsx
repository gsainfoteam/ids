'use client';

import { DateFormatter } from '@internationalized/date';
import { memoize } from 'es-toolkit';

import { useMessageContext } from './context';
import { useProviderLocale } from '../../../internal/translate';

const clockOf = memoize(
  (locale: string) => new DateFormatter(locale, { hour: 'numeric', minute: '2-digit' }),
);

export function MessageTime({ time }: { time: Date }) {
  const { styles } = useMessageContext('Message');
  const locale = useProviderLocale();

  return (
    <time dateTime={time.toISOString()} suppressHydrationWarning className={styles.time()}>
      {clockOf(locale).format(time)}
    </time>
  );
}
