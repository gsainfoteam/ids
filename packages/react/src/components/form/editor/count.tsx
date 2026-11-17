'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { useEditorContext } from './context';
import { useEditorSelector } from './use-editor-selector';
import { useTranslate, type Translate } from '../../../internal/translate';
import { resolve, type StateValue } from '../text-area/state-value';
import { countState, useCountAnnouncement, type CountState } from '../text-area/use-text-area';

export type EditorCountState = CountState;

export type EditorCountProps = Omit<
  ComponentProps<'output'>,
  'children' | 'className' | 'id' | 'htmlFor'
> & {
  threshold?: number;
  announce?: (state: EditorCountState) => string;
  className?: StateValue<EditorCountState, string | undefined>;
  children?: StateValue<EditorCountState, ReactNode>;
};

function defaultAnnouncement(state: EditorCountState, t: Translate) {
  if (state.remaining === undefined) return '';
  return state.atLimit
    ? t('textArea.limitReached')
    : t('textArea.remaining', { remaining: state.remaining });
}

export function EditorCount({
  threshold,
  announce,
  className,
  children,
  ...props
}: EditorCountProps) {
  const t = useTranslate();
  const { editor, contentId, countId, maxLength, styles } = useEditorContext('Editor.Count');
  const characters = useEditorSelector(
    editor,
    (current) => current.storage.characterCount.characters(),
    0,
  );

  const state = countState(characters, maxLength, threshold);
  const spoken = useCountAnnouncement(
    state.nearLimit ? (announce?.(state) ?? defaultAnnouncement(state, t)) : '',
  );

  return (
    <>
      <output
        aria-live="off"
        {...props}
        id={countId}
        htmlFor={contentId}
        data-editor-count=""
        data-near-limit={state.nearLimit ? '' : undefined}
        data-at-limit={state.atLimit ? '' : undefined}
        className={styles.count({ className: resolve(className, state) })}
      >
        {children === undefined
          ? state.maxLength === undefined
            ? t('textArea.count', { count: state.count })
            : t('textArea.countOfMax', { count: state.count, maxLength: state.maxLength })
          : resolve(children, state)}
      </output>
      <span role="status" className="sr-only">
        {spoken}
      </span>
    </>
  );
}

EditorCount.displayName = 'Editor.Count';
