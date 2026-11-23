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
import { QuestionnaireSkip, type QuestionnaireSkipProps } from './skip';
import {
  questionnaireStyle,
  type QuestionnaireVariant,
  type QuestionnaireOrientation,
} from './style';
import {
  QuestionnaireSubmit,
  type QuestionnaireSubmitProps,
  type QuestionnaireSubmitState,
} from './submit';

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
  export type SubmitProps = QuestionnaireSubmitProps;
  export type SubmitState = QuestionnaireSubmitState;
  export type SkipProps = QuestionnaireSkipProps;

  export const Question = QuestionnaireQuestion;
  export namespace Question {
    export type Props = QuestionProps;
  }

  export const Option = QuestionnaireOption;
  export namespace Option {
    export type Props = OptionProps;
  }

  export const Other = QuestionnaireOther;
  export namespace Other {
    export type Props = OtherProps;
  }

  export const Description = QuestionnaireDescription;
  export namespace Description {
    export type Props = DescriptionProps;
  }

  export const Submit = QuestionnaireSubmit;
  export namespace Submit {
    export type Props = SubmitProps;
    export type State = SubmitState;
  }

  export const Skip = QuestionnaireSkip;
  export namespace Skip {
    export type Props = SkipProps;
  }

  export const Style = questionnaireStyle;
}

export type {
  QuestionnaireAnswer,
  QuestionnaireAnswers,
  QuestionnaireSelectionMode,
} from './answers';
export type { QuestionnaireVariant, QuestionnaireOrientation } from './style';
export type { QuestionnaireProps } from './root';
