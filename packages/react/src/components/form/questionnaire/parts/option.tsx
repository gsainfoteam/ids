'use client';

import { isValidElement, type ReactNode } from 'react';

import { QuestionnaireOptionDescription } from './option-description';
import { elementTypeOf, flattenFragments } from '../../../../utils/children';
import { Toggle } from '../../../action/toggle';
import { Item } from '../../../data/item';
import { Checkbox } from '../../checkbox';
import { Radio } from '../../radio';
import { useInternalQuestionContext } from '../context';
import { questionnaireStyle } from '../style';

export type QuestionnaireOptionProps = {
  value: string;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
};

const isDescription = (node: ReactNode) =>
  isValidElement(node) && elementTypeOf(node) === QuestionnaireOptionDescription;

export function QuestionnaireOption({
  value,
  disabled,
  className,
  children,
}: QuestionnaireOptionProps) {
  const { selectionMode, orientation, variant, size } =
    useInternalQuestionContext('Questionnaire.Option');
  const styles = questionnaireStyle({ orientation, size });
  const Control = selectionMode === 'single' ? Radio : Checkbox;
  const nodes = flattenFragments(children);
  const descriptions = nodes.filter(isDescription);
  const label = nodes.filter((node) => !isDescription(node));
  const title = label.length > 0 ? label : value;

  if (variant === 'toggle')
    return (
      <Toggle
        value={value}
        disabled={disabled}
        size={size}
        className={styles.toggle({ className })}
        data-questionnaire-option=""
      >
        {title}
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
          <Item.Title>{title}</Item.Title>
          {descriptions}
        </Item.Content>
      </label>
    </Item>
  );
}

QuestionnaireOption.displayName = 'Questionnaire.Option';
