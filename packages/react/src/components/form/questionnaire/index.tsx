import {
  type QuestionnaireAnswer,
  type QuestionnaireAnswers,
  type QuestionnaireSelectionMode,
} from './lib/answers';
import { QuestionnaireDescription, type QuestionnaireDescriptionProps } from './parts/description';
import { QuestionnaireOption, type QuestionnaireOptionProps } from './parts/option';
import {
  QuestionnaireOptionDescription,
  type QuestionnaireOptionDescriptionProps,
} from './parts/option-description';
import { QuestionnaireOther, type QuestionnaireOtherProps } from './parts/other';
import { QuestionnaireQuestion, type QuestionnaireQuestionProps } from './parts/question';
import { QuestionnaireSkip, type QuestionnaireSkipProps } from './parts/skip';
import {
  QuestionnaireSubmit,
  type QuestionnaireSubmitProps,
  type QuestionnaireSubmitState,
} from './parts/submit';
import { QuestionnaireRoot, type QuestionnaireAdvance, type QuestionnaireProps } from './root';
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
  export type Advance = QuestionnaireAdvance;

  export type QuestionProps = QuestionnaireQuestionProps;
  export type OptionProps = QuestionnaireOptionProps;
  export type OptionDescriptionProps = QuestionnaireOptionDescriptionProps;
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

  export const OptionDescription = QuestionnaireOptionDescription;
  export namespace OptionDescription {
    export type Props = OptionDescriptionProps;
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
} from './lib/answers';
export type { QuestionnaireVariant, QuestionnaireOrientation } from './style';
export type { QuestionnaireAdvance, QuestionnaireProps } from './root';
