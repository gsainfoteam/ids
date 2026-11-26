'use client';

import { useEffect, useLayoutEffect, useRef, useState, type SubmitEvent } from 'react';

import { isEqual } from 'es-toolkit';
import { flushSync } from 'react-dom';

import { useInternalFormReset } from '../../../../hooks/use-form-reset';
import {
  EMPTY_DRAFT,
  answerOf,
  answersOf,
  draftsFrom,
  draftsFollowing,
  type QuestionnaireAnswers,
  type QuestionnaireDraft,
  type QuestionnaireQuestionShape,
} from '../lib/answers';
import { focusTarget } from '../lib/questions';

const canLeave = (
  question: QuestionnaireQuestionShape,
  from: Readonly<Record<string, QuestionnaireDraft>>,
) =>
  !question.required ||
  answerOf(from[question.name] ?? EMPTY_DRAFT, question.selectionMode) !== undefined;

export function useInternalQuestionnaire({
  questions,
  value,
  defaultValue,
  onValueChange,
  onComplete,
  onSubmit,
  action,
}: {
  questions: QuestionnaireQuestionShape[];
  value: QuestionnaireAnswers | undefined;
  defaultValue: QuestionnaireAnswers | undefined;
  onValueChange: ((answers: QuestionnaireAnswers) => void) | undefined;
  onComplete: ((answers: QuestionnaireAnswers) => void) | undefined;
  onSubmit: ((event: SubmitEvent<HTMLFormElement>) => void) | undefined;
  action: unknown;
}) {
  const [typed, setTyped] = useState(() => draftsFrom(questions, value ?? defaultValue));
  const drafts = value === undefined ? typed : draftsFollowing(questions, value, typed);
  if (drafts !== typed) setTyped(drafts);
  const draftsRef = useRef<Record<string, QuestionnaireDraft>>(drafts);
  useLayoutEffect(() => {
    draftsRef.current = drafts;
  });
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const focusTheNewStep = useRef(false);

  const total = questions.length;
  const index = Math.min(step, Math.max(total - 1, 0));
  const current = questions.at(index);
  const last = index === total - 1;

  const draftOf = (name: string) => draftsRef.current[name] ?? EMPTY_DRAFT;

  const setDraft = (name: string, draft: QuestionnaireDraft) => {
    const before = answersOf(questions, draftsRef.current);
    draftsRef.current = { ...draftsRef.current, [name]: draft };
    setTyped(draftsRef.current);
    const after = answersOf(questions, draftsRef.current);
    if (!isEqual(before, after)) onValueChange?.(after);
  };

  const goTo = (next: number) => {
    focusTheNewStep.current = true;
    setStep(next);
  };

  const advance = () => {
    flushSync(() => setTyped(draftsRef.current));
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
    setTyped(draftsRef.current);
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
    if (action === undefined) event.preventDefault();
  };

  return {
    formRef,
    drafts,
    total,
    index,
    current,
    last,
    canLeaveCurrent: current !== undefined && canLeave(current, drafts),
    draftOf,
    setDraft,
    goTo,
    advance,
    skip,
    handleSubmit,
  };
}
