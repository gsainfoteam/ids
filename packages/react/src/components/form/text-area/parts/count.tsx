'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { useInternalTranslate, type Translate } from '../../../../internal/translate';
import { useInternalTextAreaContext } from '../context';
import { useInternalTextAreaCountAnnouncement } from '../hooks/use-count-announcement';
import { countState, type CountState } from '../lib/count-state';
import { resolve, type StateValue } from '../lib/state-value';

export type TextAreaCountProps = Omit<ComponentProps<'span'>, 'children' | 'className'> & {
  threshold?: number;
  announce?: (state: CountState) => string;
  className?: StateValue<CountState, string | undefined>;
  children?: StateValue<CountState, ReactNode>;
};

function defaultAnnouncement(state: CountState, t: Translate) {
  if (state.remaining === undefined) return '';
  return state.atLimit
    ? t('textArea.limitReached')
    : t('textArea.remaining', { remaining: state.remaining });
}

export function TextAreaCount({
  threshold,
  announce,
  className,
  children,
  id: _id,
  ...props
}: TextAreaCountProps) {
  const t = useInternalTranslate();
  const { count, countId, styles } = useInternalTextAreaContext('TextArea.Count');

  const state = countState(count.length, count.maxLength, threshold);
  const spoken = useInternalTextAreaCountAnnouncement(
    state.nearLimit ? (announce?.(state) ?? defaultAnnouncement(state, t)) : '',
  );

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
          ? state.maxLength === undefined
            ? t('textArea.count', { count: state.count })
            : t('textArea.countOfMax', { count: state.count, maxLength: state.maxLength })
          : resolve(children, state)}
      </span>
      <span role="status" className="sr-only">
        {spoken}
      </span>
    </>
  );
}

TextAreaCount.displayName = 'TextArea.Count';
