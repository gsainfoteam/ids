'use client';

import { useQuestionContext } from './context';
import { questionnaireStyle } from './style';
import { useRequiredName, type AccessibleName } from '../../../internal/accessible-name';
import { TextField } from '../text-field';

export type QuestionnaireOtherProps = Omit<
  TextField.Props,
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'name'
  | 'size'
  | 'className'
  | 'aria-label'
  | 'aria-labelledby'
> &
  AccessibleName & { className?: string };

export function QuestionnaireOther({ className, ...props }: QuestionnaireOtherProps) {
  useRequiredName('Questionnaire.Other', props);
  const { name, orientation, draft, size, setOther } = useQuestionContext('Questionnaire.Other');
  const filled = draft.other.trim() !== '';

  return (
    <TextField
      {...props}
      name={filled ? name : undefined}
      value={draft.other}
      onValueChange={setOther}
      size={size}
      className={questionnaireStyle({ orientation, size }).other({ className })}
    />
  );
}

QuestionnaireOther.displayName = 'Questionnaire.Other';
