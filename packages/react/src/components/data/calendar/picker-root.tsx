'use client';

import { type RootProps } from 'react-day-picker';

import { useCalendarContext } from './context';
import { useTranslate } from '../../../internal/translate';
import { mergeRefs } from '../../../utils';

export function Root({ rootRef, ...props }: RootProps) {
  const t = useTranslate();

  const c = useCalendarContext('Calendar');
  const { native, state } = c;
  return (
    <div
      {...props}
      {...native}
      ref={mergeRefs(rootRef, c.rootRef)}
      role={native.role ?? 'group'}
      aria-label={
        native['aria-label'] ?? (native['aria-labelledby'] ? undefined : t('calendar.label'))
      }
      aria-disabled={state.disabled || undefined}
      data-calendar=""
      data-size={c.size}
      data-selection-mode={state.selectionMode}
      data-disabled={state.disabled ? '' : undefined}
      data-readonly={state.readOnly ? '' : undefined}
    />
  );
}
