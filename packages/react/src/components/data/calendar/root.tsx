import { type RootProps } from 'react-day-picker';

import { useCalendarContext } from './context';
import { messages } from '../../../internal/messages';
import { mergeRefs } from '../../../utils';

export function Root({ rootRef, ...props }: RootProps) {
  const c = useCalendarContext('Calendar');
  const { native, state } = c;
  return (
    <div
      {...props}
      {...native}
      ref={mergeRefs(rootRef, c.rootRef)}
      role={native.role ?? 'group'}
      aria-label={
        native['aria-label'] ?? (native['aria-labelledby'] ? undefined : messages.calendar.label)
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
