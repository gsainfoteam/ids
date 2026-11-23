'use client';

import type { ReactNode } from 'react';

import { useQuestionnaireContext } from './context';
import { useTranslate } from '../../../internal/translate';
import { Button } from '../../action/button';

export type QuestionnaireSubmitProps = Omit<Button.Props, 'type' | 'asChild' | 'children'> & {
  children?: ReactNode;
};

export function QuestionnaireSubmit({ children, disabled, ...props }: QuestionnaireSubmitProps) {
  const t = useTranslate();
  const { last, canLeaveCurrent } = useQuestionnaireContext('Questionnaire.Submit');

  return (
    <Button {...props} type="submit" focusableWhenDisabled disabled={disabled || !canLeaveCurrent}>
      {last ? (children ?? t('questionnaire.submit')) : t('questionnaire.next')}
    </Button>
  );
}

QuestionnaireSubmit.displayName = 'Questionnaire.Submit';
