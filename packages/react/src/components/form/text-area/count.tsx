import { type ComponentProps, type ReactNode } from 'react';

import { useTextAreaContext } from './context';
import { resolve, type StateValue } from './state-value';
import { countState, useCountAnnouncement, type CountState } from './use-text-area';
import { messages } from '../../../internal/messages';

export type TextAreaCountProps = Omit<ComponentProps<'span'>, 'children' | 'className'> & {
  threshold?: number;
  announce?: (state: CountState) => string;
  className?: StateValue<CountState, string | undefined>;
  children?: StateValue<CountState, ReactNode>;
};

function defaultAnnouncement(state: CountState) {
  if (state.remaining === undefined) return '';
  return state.atLimit
    ? messages.textArea.limitReached
    : messages.textArea.remaining(state.remaining);
}

export function TextAreaCount({
  threshold,
  announce = defaultAnnouncement,
  className,
  children,
  id: _id,
  ...props
}: TextAreaCountProps) {
  const { count, countId, styles } = useTextAreaContext('TextArea.Count');

  const state = countState(count.length, count.maxLength, threshold);
  const spoken = useCountAnnouncement(state.nearLimit ? announce(state) : '');

  return (
    <>
      <span
        {...props}
        id={countId}
        data-text-area-count=""
        data-near-limit={state.nearLimit ? '' : undefined}
        data-at-limit={state.atLimit ? '' : undefined}
        className={styles.count({ className: resolve(className, state) })}
      >
        {children === undefined
          ? messages.textArea.count(state.count, state.maxLength)
          : resolve(children, state)}
      </span>
      <span role="status" className="sr-only">
        {spoken}
      </span>
    </>
  );
}

TextAreaCount.displayName = 'TextArea.Count';
