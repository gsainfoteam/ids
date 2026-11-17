'use client';

import { type ComponentProps } from 'react';

import { useQuestionContext } from './context';
import { questionnaireStyle } from './style';
import { useParagraphRef } from '../../../internal/paragraph';
import { Slot } from '../../utility/slot';

export type QuestionnaireDescriptionProps = ComponentProps<'p'> & { asChild?: boolean };

export function QuestionnaireDescription({
  asChild,
  className,
  ref,
  ...props
}: QuestionnaireDescriptionProps) {
  const { descriptionId, size } = useQuestionContext('Questionnaire.Description');
  const paragraphRef = useParagraphRef('Questionnaire.Description', ref);
  const Root = asChild === true ? Slot : 'p';

  return (
    <Root
      id={descriptionId}
      {...props}
      ref={paragraphRef}
      className={questionnaireStyle({ size }).description({ className })}
    />
  );
}

QuestionnaireDescription.displayName = 'Questionnaire.Description';
