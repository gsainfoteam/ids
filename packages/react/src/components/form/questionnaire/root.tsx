'use client';

import {
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type SubmitEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { flushSync } from 'react-dom';
import { focusable } from 'tabbable';

import { QuestionnaireContext } from './context';
import {
  EMPTY_DRAFT,
  answerOf,
  answersOf,
  draftsFrom,
  type QuestionnaireAnswers,
  type QuestionnaireDraft,
  type QuestionnaireQuestionShape,
} from './lib/answers';
import { QuestionnaireOption, type QuestionnaireOptionProps } from './parts/option';
import { QuestionnaireOther } from './parts/other';
import { QuestionnaireQuestion, type QuestionnaireQuestionProps } from './parts/question';
import { QuestionnaireSubmit } from './parts/submit';
import { questionnaireStyle } from './style';
import { useInternalFormReset } from '../../../hooks/use-form-reset';
import { useInternalTranslate } from '../../../internal/translate';
import { mergeRefs } from '../../../utils';
import { containsElementOfType, elementTypeOf, flattenFragments } from '../../../utils/children';
import { Button } from '../../action/button';
import { ButtonGroup } from '../../action/button-group';
import { Progress } from '../../feedback/progress';

import type { IdsSize } from '../../../tokens/types';

const forwardsItsOwnFocus = (element: HTMLElement) => element.hasAttribute('tabindex');

const isChosen = (element: Element) =>
  element.matches('[aria-checked="true"], [aria-pressed="true"]');

function focusTarget(question: HTMLElement) {
  if (forwardsItsOwnFocus(question)) return question;
  const candidates = focusable(question);
  return candidates.find(isChosen) ?? candidates[0];
}

export type QuestionnaireProps = Omit<ComponentProps<'form'>, 'defaultValue' | 'children'> & {
  defaultValue?: QuestionnaireAnswers;
  onComplete?: (answers: QuestionnaireAnswers) => void;
  advanceOnSelect?: boolean;
  size?: IdsSize;
  children: ReactNode;
};

const QUESTION = new Set<unknown>([QuestionnaireQuestion]);
const OPTION = new Set<unknown>([QuestionnaireOption]);
const OTHER = new Set<unknown>([QuestionnaireOther]);
const SUBMIT = new Set<unknown>([QuestionnaireSubmit]);

function optionValuesIn(children: ReactNode): string[] {
  return flattenFragments(children).flatMap((node) => {
    if (!isValidElement<{ children?: ReactNode }>(node)) return [];
    if (OPTION.has(elementTypeOf(node)))
      return [(node as ReactElement<QuestionnaireOptionProps>).props.value];
    return optionValuesIn(node.props.children);
  });
}

function readQuestions(children: ReactNode): QuestionnaireQuestionShape[] {
  return flattenFragments(children).flatMap((node) => {
    if (!isValidElement<QuestionnaireQuestionProps>(node) || !QUESTION.has(elementTypeOf(node)))
      return [];

    const { name, selectionMode = 'single', optional = false, children: parts } = node.props;
    return [
      {
        name,
        selectionMode,
        optional,
        hasOther: containsElementOfType(parts, OTHER),
        optionValues: optionValuesIn(parts),
      },
    ];
  });
}

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
  const [drafts, setDrafts] = useState(() => draftsFrom(questions, defaultValue));
  const draftsRef = useRef<Record<string, QuestionnaireDraft>>(drafts);
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const focusTheNewStep = useRef(false);

  const total = questions.length;
  const index = Math.min(step, Math.max(total - 1, 0));
  const current = questions.at(index);
  const last = index === total - 1;
  const styles = questionnaireStyle({ size });

  const draftOf = (name: string) => draftsRef.current[name] ?? EMPTY_DRAFT;

  const setDraft = (name: string, draft: QuestionnaireDraft) => {
    draftsRef.current = { ...draftsRef.current, [name]: draft };
    setDrafts(draftsRef.current);
  };

  const canLeave = (
    question: QuestionnaireQuestionShape,
    from: Readonly<Record<string, QuestionnaireDraft>>,
  ) =>
    question.optional ||
    answerOf(from[question.name] ?? EMPTY_DRAFT, question.selectionMode) !== undefined;

  const goTo = (next: number) => {
    focusTheNewStep.current = true;
    setStep(next);
  };

  const advance = () => {
    flushSync(() => setDrafts(draftsRef.current));
    formRef.current?.requestSubmit();
  };

  const skip = () => {
    if (current === undefined) return;
    setDraft(current.name, EMPTY_DRAFT);
    advance();
  };

  useEffect(() => {
    if (!focusTheNewStep.current) return;
    focusTheNewStep.current = false;
    const question = formRef.current?.querySelector<HTMLElement>(
      '[data-questionnaire-question][data-active]',
    );
    if (!question) return;
    focusTarget(question)?.focus();
  }, [index]);

  useInternalFormReset(formRef, () => {
    draftsRef.current = draftsFrom(questions, defaultValue);
    setDrafts(draftsRef.current);
    setStep(0);
  });

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    if (current === undefined || !canLeave(current, draftsRef.current)) {
      event.preventDefault();
      return;
    }

    if (!last) {
      event.preventDefault();
      goTo(index + 1);
      return;
    }

    onComplete?.(answersOf(questions, draftsRef.current));
    onSubmit?.(event);
    if (rest.action === undefined) event.preventDefault();
  };

  const opensTheNextStepOnSelect =
    advanceOnSelect && current?.selectionMode === 'single' && !current.hasOther;
  const showsPrevious = index > 0;
  const showsSkip = current?.optional === true;
  const showsForward = current !== undefined && !opensTheNextStepOnSelect;
  const parts = flattenFragments(children);
  const isSubmit = (node: ReactNode) => isValidElement(node) && SUBMIT.has(elementTypeOf(node));
  const submit = parts.find(isSubmit) ?? <QuestionnaireSubmit />;

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
        last,
        canLeaveCurrent: current !== undefined && canLeave(current, drafts),
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
        {parts.filter((node) => !isSubmit(node))}
        {(showsPrevious || showsSkip || showsForward) && (
          <ButtonGroup
            size="tiny"
            aria-label={t('questionnaire.navigation')}
            className={styles.navigation()}
          >
            <div className={styles.navigationItems()}>
              {showsPrevious && (
                <Button
                  type="button"
                  variant="outline"
                  className={styles.previous()}
                  onClick={() => goTo(index - 1)}
                >
                  {t('questionnaire.previous')}
                </Button>
              )}
              {showsSkip && (
                <Button type="button" variant="outline" onClick={skip}>
                  {t('questionnaire.skip')}
                </Button>
              )}
              {showsForward && submit}
            </div>
          </ButtonGroup>
        )}
      </form>
    </QuestionnaireContext.Provider>
  );
}
