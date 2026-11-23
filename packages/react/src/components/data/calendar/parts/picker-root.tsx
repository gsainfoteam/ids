'use client';

import { type RootProps } from 'react-day-picker';

import { useInternalTranslate } from '../../../../internal/translate';
import { mergeRefs } from '../../../../utils';
import { useInternalCalendarContext } from '../context';

export function Root({ rootRef, ...props }: RootProps) {
  const t = useInternalTranslate();

  const c = useInternalCalendarContext('Calendar');
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
