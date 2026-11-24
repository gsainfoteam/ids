'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { QuestionnaireDraft, QuestionnaireSelectionMode } from './answers';
import type { QuestionnaireVariant, QuestionnaireOrientation } from './style';
import type { IdsSize } from '../../../tokens/types';

export type QuestionnaireContextValue = {
  activeName: string | null;
  size: IdsSize | undefined;
  advanceOnSelect: boolean;
  drafts: Readonly<Record<string, QuestionnaireDraft>>;
  draftOf: (name: string) => QuestionnaireDraft;
  setDraft: (name: string, draft: QuestionnaireDraft) => void;
  advance: () => void;
  skip: () => void;
  last: boolean;
  canLeaveCurrent: boolean;
};

export const QuestionnaireContext = createContext<QuestionnaireContextValue | null>(null);

export function useQuestionnaireContext(part: string) {
  const context = use(QuestionnaireContext);
  invariant(context, `${part} must be rendered inside Questionnaire.`);
  return context;
}

export type QuestionContextValue = {
  name: string;
  selectionMode: QuestionnaireSelectionMode;
  orientation: QuestionnaireOrientation;
  variant: QuestionnaireVariant;
  draft: QuestionnaireDraft;
  descriptionId: string;
  size: IdsSize | undefined;
  setOther: (text: string) => void;
};

export const QuestionContext = createContext<QuestionContextValue | null>(null);

export function useQuestionContext(part: string) {
  const context = use(QuestionContext);
  invariant(context, `${part} must be rendered inside Questionnaire.Question.`);
  return context;
}
