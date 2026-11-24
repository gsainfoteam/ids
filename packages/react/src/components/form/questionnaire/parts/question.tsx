'use client';

import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { ToggleGroup } from '../../../action/toggle-group';
import { CheckboxGroup } from '../../checkbox-group';
import { RadioGroup } from '../../radio-group';
import { QuestionContext } from '../context';
import { useInternalQuestionnaireQuestion } from '../hooks/use-questionnaire-question';
import { type QuestionnaireSelectionMode } from '../lib/answers';
import { splitQuestion } from '../lib/question-parts';
import {
  questionnaireStyle,
  type QuestionnaireVariant,
  type QuestionnaireOrientation,
} from '../style';

export type QuestionnaireQuestionProps = Omit<
  ComponentProps<'fieldset'>,
  'children' | 'name' | 'defaultValue' | 'onChange' | 'className' | 'style' | 'role'
> & {
  name: string;
  selectionMode?: QuestionnaireSelectionMode;
  optional?: boolean;
  orientation?: QuestionnaireOrientation;
  variant?: QuestionnaireVariant;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function QuestionnaireQuestion({
  name,
  selectionMode = 'single',
  optional: _readByTheRoot,
  orientation = 'vertical',
  variant = 'card',
  hidden,
  className,
  style,
  children,
  onKeyDown,
  onKeyDownCapture,
  onKeyUp,
  onClick,
  ...rest
}: QuestionnaireQuestionProps) {
  const {
    size,
    legendId,
    descriptionId,
    draft,
    active,
    choose,
    setChoices,
    setOther,
    toggleSingle,
    handlers,
  } = useInternalQuestionnaireQuestion({
    name,
    selectionMode,
    onKeyDown,
    onKeyDownCapture,
    onKeyUp,
    onClick,
  });
  const { text, descriptions, answers, options, rest: others } = splitQuestion(children);
  const styles = questionnaireStyle({ orientation, size });

  const questionProps = {
    ...rest,
    hidden: hidden || !active,
    'aria-labelledby': legendId,
    'aria-describedby': descriptions.length > 0 ? descriptionId : undefined,
    'data-questionnaire-question': '',
    'data-active': active ? '' : undefined,
    className: styles.question({ className }),
    style,
    ...handlers,
  };

  const groupProps = { ...questionProps, name, size, orientation };

  const content = (
    <>
      <legend id={legendId} className={styles.legend()}>
        {text}
      </legend>
      {descriptions}
      <div className={styles.options()}>{answers}</div>
    </>
  );

  return (
    <QuestionContext.Provider
      value={{
        name,
        selectionMode,
        orientation,
        variant,
        draft,
        descriptionId,
        size,
        setOther,
      }}
    >
      {variant === 'toggle' ? (
        <fieldset {...questionProps}>
          <legend id={legendId} className={styles.legend()}>
            {text}
          </legend>
          {descriptions}
          <div className={styles.options()}>
            {selectionMode === 'single' ? (
              <ToggleGroup<string>
                name={name}
                size={size}
                orientation={orientation}
                aria-labelledby={legendId}
                value={draft.choices[0] ?? null}
                onValueChange={toggleSingle}
              >
                <div className={styles.toggles()}>{options}</div>
              </ToggleGroup>
            ) : (
              <ToggleGroup<string>
                selectionMode="multiple"
                name={name}
                size={size}
                orientation={orientation}
                aria-labelledby={legendId}
                value={draft.choices}
                onValueChange={setChoices}
              >
                <div className={styles.toggles()}>{options}</div>
              </ToggleGroup>
            )}
            {others}
          </div>
        </fieldset>
      ) : selectionMode === 'single' ? (
        <RadioGroup<string>
          {...groupProps}
          value={draft.choices[0] ?? null}
          onValueChange={(value) => choose(value, true)}
        >
          {content}
        </RadioGroup>
      ) : (
        <CheckboxGroup<string> {...groupProps} value={draft.choices} onValueChange={setChoices}>
          {content}
        </CheckboxGroup>
      )}
    </QuestionContext.Provider>
  );
}

QuestionnaireQuestion.displayName = 'Questionnaire.Question';
