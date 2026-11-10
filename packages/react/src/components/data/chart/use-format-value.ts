'use client';

import { useMemo, type ReactNode } from 'react';

import { NumberFormatter } from '@internationalized/number';

const RANGE_SEPARATOR = ' – ';

export function useFormatValue(locale: string) {
  return useMemo(() => {
    const formatter = new NumberFormatter(locale);
    const formatOne = (value: unknown): string =>
      typeof value === 'number' ? formatter.format(value) : value == null ? '' : String(value);

    return (value: unknown): ReactNode =>
      Array.isArray(value) ? value.map(formatOne).join(RANGE_SEPARATOR) : formatOne(value);
  }, [locale]);
}
