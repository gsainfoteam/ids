'use client';

import { type ComponentProps } from 'react';

import { Item } from '../../../data/item';
import { Slot } from '../../../utility/slot';

export type QuestionnaireOptionDescriptionProps = ComponentProps<'span'> & { asChild?: boolean };

export function QuestionnaireOptionDescription({
  asChild,
  ...props
}: QuestionnaireOptionDescriptionProps) {
  const Root = asChild === true ? Slot : 'span';

  return (
    <Item.Description asChild>
      <Root {...props} data-questionnaire-option-description="" />
    </Item.Description>
  );
}

QuestionnaireOptionDescription.displayName = 'Questionnaire.OptionDescription';
