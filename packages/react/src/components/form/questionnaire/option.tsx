'use client';

import { type ReactNode } from 'react';

import { useQuestionContext } from './context';
import { questionnaireStyle } from './style';
import { Item } from '../../data/item';
import { Checkbox } from '../checkbox';
import { Radio } from '../radio';

export type QuestionnaireOptionProps = {
  value: string;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
};

export function QuestionnaireOption({
  value,
  description,
  disabled,
  className,
  children,
}: QuestionnaireOptionProps) {
  const { selectionMode, orientation, draft, size } = useQuestionContext('Questionnaire.Option');
  const checked = draft.choices.includes(value);
  const Control = selectionMode === 'single' ? Radio : Checkbox;

  return (
    <Item
      variant="outline"
      size={size}
      asChild
      selected={checked}
      disabled={disabled}
      className={questionnaireStyle({ orientation }).option({ className })}
      data-questionnaire-option=""
    >
      <label>
        <Item.Content>
          <Item.Title>{children ?? value}</Item.Title>
          {description !== undefined && (
            <Item.Description asChild>
              <span>{description}</span>
            </Item.Description>
          )}
        </Item.Content>
        <Item.Actions>
          <Control value={value} disabled={disabled} />
        </Item.Actions>
      </label>
    </Item>
  );
}

QuestionnaireOption.displayName = 'Questionnaire.Option';
