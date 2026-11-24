'use client';

import type { ReactNode } from 'react';

import { ChevronRightIcon } from '@heroicons/react/16/solid';

import { useQuestionnaireContext } from './context';
import { useTranslate } from '../../../internal/translate';
import { Button } from '../../action/button';
import { IconButton } from '../../action/icon-button';

export type QuestionnaireSubmitState = { last: boolean };

export type QuestionnaireSubmitProps = Omit<Button.Props, 'type' | 'asChild' | 'children'> & {
  children?: ReactNode | ((state: QuestionnaireSubmitState) => ReactNode);
};

export function QuestionnaireSubmit({ children, disabled, ...props }: QuestionnaireSubmitProps) {
  const t = useTranslate();
  const { last, canLeaveCurrent } = useQuestionnaireContext('Questionnaire.Submit');

  const label = typeof children === 'function' ? children({ last }) : last ? children : undefined;
  const blocked = disabled || !canLeaveCurrent;

  if (label !== undefined && label !== null && label !== false)
    return (
      <Button {...props} type="submit" focusableWhenDisabled disabled={blocked}>
        {label}
      </Button>
    );
  return (
    <IconButton
      {...props}
      type="submit"
      aria-label={props['aria-label'] ?? t('common.next')}
      icon={<ChevronRightIcon aria-hidden="true" />}
      focusableWhenDisabled
      disabled={blocked}
    />
  );
}

QuestionnaireSubmit.displayName = 'Questionnaire.Submit';
