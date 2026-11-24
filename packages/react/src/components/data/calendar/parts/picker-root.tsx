'use client';

import { type RootProps } from 'react-day-picker';

import { useInternalRequiredName } from '../../../../internal/lib/accessible-name';
import { mergeRefs } from '../../../../utils';
import { useInternalCalendarContext } from '../context';

export function Root({ rootRef, ...props }: RootProps) {
  const c = useInternalCalendarContext('Calendar');
  const { native, state } = c;
  useInternalRequiredName('Calendar', native);

  return (
    <div
      {...props}
      {...native}
      ref={mergeRefs(rootRef, c.rootRef)}
      role={native.role ?? 'group'}
      aria-disabled={state.disabled || undefined}
      data-calendar=""
      data-size={c.size}
      data-selection-mode={state.selectionMode}
      data-disabled={state.disabled ? '' : undefined}
      data-readonly={state.readOnly ? '' : undefined}
    />
  );
}
