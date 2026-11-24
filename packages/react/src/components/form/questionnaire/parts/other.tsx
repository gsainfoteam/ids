'use client';

import { useInternalRequiredName, type AccessibleName } from '../../../../internal/lib/accessible-name';
import { TextField } from '../../text-field';
import { useInternalQuestionContext } from '../context';
import { questionnaireStyle } from '../style';

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
  useInternalRequiredName('Questionnaire.Other', props);
  const { name, orientation, draft, size, setOther } = useInternalQuestionContext('Questionnaire.Other');
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
