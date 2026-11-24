'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { ChevronLeftIcon } from '@heroicons/react/16/solid';

import { QuestionnaireContext } from './context';
import { useInternalQuestionnaire } from './hooks/use-questionnaire';
import { type QuestionnaireAnswers } from './lib/answers';
import { isSkip, isSubmit, readQuestions } from './lib/questions';
import { QuestionnaireSubmit } from './parts/submit';
import { questionnaireStyle } from './style';
import { useInternalTranslate } from '../../../internal/translate';
import { mergeRefs } from '../../../utils';
import { flattenFragments } from '../../../utils/children';
import { ButtonGroup } from '../../action/button-group';
import { IconButton } from '../../action/icon-button';
import { Progress } from '../../feedback/progress';

import type { IdsSize } from '../../../tokens/types';

export type QuestionnaireProps = Omit<ComponentProps<'form'>, 'defaultValue' | 'children'> & {
  defaultValue?: QuestionnaireAnswers;
  onComplete?: (answers: QuestionnaireAnswers) => void;
  advanceOnSelect?: boolean;
  size?: IdsSize;
  children: ReactNode;
};

export function QuestionnaireRoot({
  defaultValue,
  onComplete,
  advanceOnSelect = false,
  size,
  className,
  children,
  ref,
  onSubmit,
  ...rest
}: QuestionnaireProps) {
  const t = useInternalTranslate();
  const questions = readQuestions(children);
  const {
    formRef,
    drafts,
    total,
    index,
    current,
    last,
    canLeaveCurrent,
    draftOf,
    setDraft,
    goTo,
    advance,
    skip,
    handleSubmit,
  } = useInternalQuestionnaire({
    questions,
    defaultValue,
    onComplete,
    onSubmit,
    action: rest.action,
  });
  const styles = questionnaireStyle({ size });

  const opensTheNextStepOnSelect =
    advanceOnSelect && current?.selectionMode === 'single' && !current.hasOther;
  const showsPrevious = index > 0;
  const showsSkip = current?.optional === true;
  const showsForward = current !== undefined && !opensTheNextStepOnSelect;
  const parts = flattenFragments(children);
  const submit = parts.find(isSubmit) ?? <QuestionnaireSubmit />;
  const skipButton = parts.find(isSkip);

  return (
    <QuestionnaireContext.Provider
      value={{
        activeName: current?.name ?? null,
        drafts,
        size,
        advanceOnSelect,
        draftOf,
        setDraft,
        advance,
        skip,
        last,
        canLeaveCurrent,
      }}
    >
      <form
        {...rest}
        ref={mergeRefs(formRef, ref)}
        data-questionnaire=""
        data-step={index}
        className={styles.root({ className })}
        onSubmit={handleSubmit}
      >
        {total > 1 && (
          <Progress
            value={index + 1}
            max={total}
            size="tiny"
            getValueLabel={(value, max) => t('questionnaire.step', { current: value, total: max })}
            aria-label={t('questionnaire.progress')}
            className={styles.progress()}
          >
            <Progress.Value className={styles.progressValue()} />
            <Progress.Track className={styles.progressTrack()} />
          </Progress>
        )}
        {parts.filter((node) => !isSubmit(node) && !isSkip(node))}
        {(showsPrevious || showsSkip || showsForward) && (
          <ButtonGroup
            size="tiny"
            aria-label={t('questionnaire.navigation')}
            className={styles.navigation()}
          >
            <div className={styles.navigationItems()}>
              {showsPrevious && (
                <IconButton
                  type="button"
                  variant="outline"
                  aria-label={t('common.previous')}
                  icon={<ChevronLeftIcon aria-hidden="true" />}
                  className={styles.previous()}
                  onClick={() => goTo(index - 1)}
                />
              )}
              {showsSkip && skipButton}
              {showsForward && submit}
            </div>
          </ButtonGroup>
        )}
      </form>
    </QuestionnaireContext.Provider>
  );
}
