'use client';

import { type ComponentProps } from 'react';

import { useInternalParagraphRef } from '../../../../internal/lib/paragraph';
import { Slot } from '../../../utility/slot';
import { useInternalQuestionContext } from '../context';
import { questionnaireStyle } from '../style';

export type QuestionnaireDescriptionProps = ComponentProps<'p'> & { asChild?: boolean };

export function QuestionnaireDescription({
  asChild,
  className,
  ref,
  ...props
}: QuestionnaireDescriptionProps) {
  const { descriptionId, size } = useInternalQuestionContext('Questionnaire.Description');
  const paragraphRef = useInternalParagraphRef('Questionnaire.Description', ref);
  const Root = asChild === true ? Slot : 'p';

  return (
    <Root
      id={descriptionId}
      {...props}
      ref={paragraphRef}
      data-questionnaire-description=""
      className={questionnaireStyle({ size }).description({ className })}
    />
  );
}

QuestionnaireDescription.displayName = 'Questionnaire.Description';
