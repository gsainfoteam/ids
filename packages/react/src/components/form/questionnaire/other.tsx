'use client';

import { useQuestionContext } from './context';
import { questionnaireStyle } from './style';
import { useTranslate } from '../../../internal/translate';
import { TextField } from '../text-field';

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
  const t = useTranslate();
  const { name, orientation, draft, size, setOther } = useQuestionContext('Questionnaire.Other');
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
