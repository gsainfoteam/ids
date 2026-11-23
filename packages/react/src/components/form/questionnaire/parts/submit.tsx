'use client';

import type { ReactNode } from 'react';

import { useInternalTranslate } from '../../../../internal/translate';
import { Button } from '../../../action/button';
import { useInternalQuestionnaireContext } from '../context';

export type QuestionnaireSubmitProps = Omit<Button.Props, 'type' | 'asChild' | 'children'> & {
  children?: ReactNode;
};

export function QuestionnaireSubmit({ children, disabled, ...props }: QuestionnaireSubmitProps) {
  const t = useInternalTranslate();
  const { last, canLeaveCurrent } = useInternalQuestionnaireContext('Questionnaire.Submit');

  return (
    <Button {...props} type="submit" focusableWhenDisabled disabled={disabled || !canLeaveCurrent}>
      {last ? (children ?? t('questionnaire.submit')) : t('questionnaire.next')}
    </Button>
  );
}

QuestionnaireSubmit.displayName = 'Questionnaire.Submit';
