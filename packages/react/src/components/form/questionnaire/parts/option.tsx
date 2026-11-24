'use client';

import { type ReactNode } from 'react';

import { Toggle } from '../../../action/toggle';
import { Item } from '../../../data/item';
import { Checkbox } from '../../checkbox';
import { Radio } from '../../radio';
import { useInternalQuestionContext } from '../context';
import { questionnaireStyle } from '../style';

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
  const { selectionMode, orientation, variant, size } = useInternalQuestionContext('Questionnaire.Option');
  const styles = questionnaireStyle({ orientation, size });
  const Control = selectionMode === 'single' ? Radio : Checkbox;

  if (variant === 'toggle')
    return (
      <Toggle
        value={value}
        disabled={disabled}
        size={size}
        className={styles.toggle({ className })}
        data-questionnaire-option=""
      >
        {children ?? value}
      </Toggle>
    );

  return (
    <Item
      variant="outline"
      size={size}
      asChild
      className={styles.option({ className })}
      data-questionnaire-option=""
    >
      <label>
        <span className={styles.indicator()}>
          <Control value={value} disabled={disabled} />
        </span>
        <Item.Content>
          <Item.Title>{children ?? value}</Item.Title>
          {description !== undefined && (
            <Item.Description asChild>
              <span>{description}</span>
            </Item.Description>
          )}
        </Item.Content>
      </label>
    </Item>
  );
}

QuestionnaireOption.displayName = 'Questionnaire.Option';
