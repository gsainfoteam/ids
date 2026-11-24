'use client';

import type { ReactNode } from 'react';

import { useQuestionnaireContext } from './context';
import { Button } from '../../action/button';

export type QuestionnaireSkipProps = Omit<Button.Props, 'type' | 'asChild' | 'children'> & {
  children?: ReactNode;
};

export function QuestionnaireSkip({ children, onClick, ...props }: QuestionnaireSkipProps) {
  const { skip } = useQuestionnaireContext('Questionnaire.Skip');

  if (children === undefined || children === null || children === false) return null;

  return (
    <Button
      variant="outline"
      {...props}
      type="button"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) skip();
      }}
    >
      {children}
    </Button>
  );
}

QuestionnaireSkip.displayName = 'Questionnaire.Skip';
