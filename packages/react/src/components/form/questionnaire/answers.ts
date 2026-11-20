export type QuestionnaireSelectionMode = 'single' | 'multiple';

export type QuestionnaireAnswer = string | string[];

export type QuestionnaireAnswers = Record<string, QuestionnaireAnswer>;

export type QuestionnaireDraft = { choices: readonly string[]; other: string };

export const EMPTY_DRAFT: QuestionnaireDraft = { choices: [], other: '' };

export type QuestionnaireQuestionShape = {
  name: string;
  selectionMode: QuestionnaireSelectionMode;
  optional: boolean;
  hasOther: boolean;
  optionValues: readonly string[];
};

export function answerOf(
  draft: QuestionnaireDraft,
  selectionMode: QuestionnaireSelectionMode,
): QuestionnaireAnswer | undefined {
  const other = draft.other.trim();

  if (selectionMode === 'single') return other !== '' ? other : draft.choices[0];

  const answer = other !== '' ? [...draft.choices, other] : [...draft.choices];
  return answer.length > 0 ? answer : undefined;
}

export function answersOf(
  questions: readonly QuestionnaireQuestionShape[],
  drafts: Readonly<Record<string, QuestionnaireDraft>>,
): QuestionnaireAnswers {
  const answers: QuestionnaireAnswers = {};

  for (const question of questions) {
    const answer = answerOf(drafts[question.name] ?? EMPTY_DRAFT, question.selectionMode);
    if (answer !== undefined) answers[question.name] = answer;
  }

  return answers;
}

export function draftFrom(
  answer: QuestionnaireAnswer | undefined,
  question: QuestionnaireQuestionShape,
): QuestionnaireDraft {
  if (answer === undefined) return EMPTY_DRAFT;

  const values = typeof answer === 'string' ? [answer] : answer;
  const choices = values.filter((value) => question.optionValues.includes(value));
  const typed = values.find((value) => !question.optionValues.includes(value)) ?? '';
  const other = question.hasOther ? typed : '';

  if (question.selectionMode === 'multiple') return { choices, other };
  return other !== '' ? { choices: [], other } : { choices: choices.slice(0, 1), other };
}

export function draftsFrom(
  questions: readonly QuestionnaireQuestionShape[],
  answers: QuestionnaireAnswers | undefined,
): Record<string, QuestionnaireDraft> {
  return Object.fromEntries(
    questions.map((question) => [question.name, draftFrom(answers?.[question.name], question)]),
  );
}
