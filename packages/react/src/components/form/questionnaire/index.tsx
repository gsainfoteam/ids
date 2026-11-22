import {
  type QuestionnaireAnswer,
  type QuestionnaireAnswers,
  type QuestionnaireSelectionMode,
} from './answers';
import { QuestionnaireDescription, type QuestionnaireDescriptionProps } from './description';
import { QuestionnaireOption, type QuestionnaireOptionProps } from './option';
import { QuestionnaireOther, type QuestionnaireOtherProps } from './other';
import { QuestionnaireQuestion, type QuestionnaireQuestionProps } from './question';
import { QuestionnaireRoot, type QuestionnaireProps } from './root';
import {
  questionnaireStyle,
  type QuestionnaireVariant,
  type QuestionnaireOrientation,
} from './style';

export function Questionnaire(props: QuestionnaireProps) {
  return <QuestionnaireRoot {...props} />;
}

export namespace Questionnaire {
  export type Props = QuestionnaireProps;
  export type Answer = QuestionnaireAnswer;
  export type Answers = QuestionnaireAnswers;
  export type SelectionMode = QuestionnaireSelectionMode;
  export type Orientation = QuestionnaireOrientation;
  export type Variant = QuestionnaireVariant;

  export type QuestionProps = QuestionnaireQuestionProps;
  export type OptionProps = QuestionnaireOptionProps;
  export type OtherProps = QuestionnaireOtherProps;
  export type DescriptionProps = QuestionnaireDescriptionProps;

  export const Question = QuestionnaireQuestion;
  export const Option = QuestionnaireOption;
  export const Other = QuestionnaireOther;
  export const Description = QuestionnaireDescription;

  export const Style = questionnaireStyle;
}

export type {
  QuestionnaireAnswer,
  QuestionnaireAnswers,
  QuestionnaireSelectionMode,
} from './answers';
export type { QuestionnaireVariant, QuestionnaireOrientation } from './style';
export type { QuestionnaireProps } from './root';
