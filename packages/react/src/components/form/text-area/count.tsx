'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { useTextAreaContext } from './context';
import { resolve, type StateValue } from './state-value';
import { countState, useCountAnnouncement, type CountState } from './use-text-area';
import { useTranslate, type Translate } from '../../../internal/translate';

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
  const t = useTranslate();
  const { count, countId, styles } = useTextAreaContext('TextArea.Count');

  const state = countState(count.length, count.maxLength, threshold);
  const spoken = useCountAnnouncement(
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
