'use client';

import type { ReactNode } from 'react';

import { Button } from '../../../action/button';
import { useInternalQuestionnaireContext } from '../context';

export type QuestionnaireSkipProps = Omit<Button.Props, 'type' | 'asChild' | 'children'> & {
  children?: ReactNode;
};

export function QuestionnaireSkip({ children, onClick, ...props }: QuestionnaireSkipProps) {
  const { skip } = useInternalQuestionnaireContext('Questionnaire.Skip');

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
