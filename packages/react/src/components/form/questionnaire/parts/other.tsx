'use client';

import { useInternalTranslate } from '../../../../internal/translate';
import { TextField } from '../../text-field';
import { useInternalQuestionContext } from '../context';
import { questionnaireStyle } from '../style';

export type QuestionnaireOtherProps = Omit<
  TextField.Props,
  'value' | 'defaultValue' | 'onValueChange' | 'name' | 'size' | 'className'
> & { className?: string };

export function QuestionnaireOther({
  className,
  placeholder,
  'aria-label': ariaLabel,
  ...props
}: QuestionnaireOtherProps) {
  const t = useInternalTranslate();
  const { name, orientation, draft, size, setOther } =
    useInternalQuestionContext('Questionnaire.Other');
  const filled = draft.other.trim() !== '';

  return (
    <TextField
      {...props}
      name={filled ? name : undefined}
      value={draft.other}
      onValueChange={setOther}
      size={size}
      placeholder={placeholder ?? t('questionnaire.otherPlaceholder')}
      aria-label={ariaLabel ?? t('questionnaire.other')}
      className={questionnaireStyle({ orientation, size }).other({ className })}
    />
  );
}

QuestionnaireOther.displayName = 'Questionnaire.Other';
