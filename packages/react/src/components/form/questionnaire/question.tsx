'use client';

import {
  isValidElement,
  useId,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';

import { uniq } from 'es-toolkit';

import { QuestionContext, useQuestionnaireContext } from './context';
import { QuestionnaireDescription } from './description';
import { QuestionnaireOption } from './option';
import { QuestionnaireOther } from './other';
import {
  questionnaireStyle,
  type QuestionnaireVariant,
  type QuestionnaireOrientation,
} from './style';
import { keyHandler } from '../../../internal/keys';
import { elementTypeOf, flattenFragments } from '../../../utils/children';
import { ToggleGroup } from '../../action/toggle-group';
import { CheckboxGroup } from '../checkbox-group';
import { RadioGroup } from '../radio-group';
import { EMPTY_DRAFT, type QuestionnaireSelectionMode } from './answers';

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

const ANSWER_PARTS = new Set<unknown>([
  QuestionnaireOption,
  QuestionnaireOther,
  QuestionnaireDescription,
]);

const isPart = (node: ReactNode, parts: ReadonlySet<unknown>) =>
  isValidElement(node) && parts.has(elementTypeOf(node));

const DESCRIPTION = new Set<unknown>([QuestionnaireDescription]);
const OPTION = new Set<unknown>([QuestionnaireOption]);

function splitQuestion(children: ReactNode) {
  const nodes = flattenFragments(children);
  const firstPart = nodes.findIndex((node) => isPart(node, ANSWER_PARTS));
  const answerNodes = firstPart < 0 ? [] : nodes.slice(firstPart);

  return {
    text: firstPart < 0 ? nodes : nodes.slice(0, firstPart),
    descriptions: answerNodes.filter((node) => isPart(node, DESCRIPTION)),
    answers: answerNodes.filter((node) => !isPart(node, DESCRIPTION)),
    options: answerNodes.filter((node) => isPart(node, OPTION)),
    rest: answerNodes.filter((node) => !isPart(node, DESCRIPTION) && !isPart(node, OPTION)),
  };
}

const isChoiceInput = (target: EventTarget): target is HTMLInputElement =>
  target instanceof HTMLInputElement && (target.type === 'radio' || target.type === 'checkbox');

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
  const questionnaire = useQuestionnaireContext('Questionnaire.Question');
  const legendId = useId();
  const descriptionId = useId();
  const choosingWithArrows = useRef(false);

  const draft = questionnaire.drafts[name] ?? EMPTY_DRAFT;
  const active = questionnaire.activeName === name;
  const { text, descriptions, answers, options, rest: others } = splitQuestion(children);
  const styles = questionnaireStyle({ orientation, size: questionnaire.size });

  const choose = (value: string, checked: boolean) => {
    const current = questionnaire.draftOf(name);

    if (selectionMode === 'single') {
      questionnaire.setDraft(name, checked ? { choices: [value], other: '' } : current);
      return;
    }

    questionnaire.setDraft(name, {
      choices: checked
        ? uniq([...current.choices, value])
        : current.choices.filter((choice) => choice !== value),
      other: current.other,
    });
  };

  const setOther = (other: string) => {
    const current = questionnaire.draftOf(name);
    const clearsTheChoice = selectionMode === 'single' && other.trim() !== '';
    questionnaire.setDraft(name, { choices: clearsTheChoice ? [] : current.choices, other });
  };

  const markArrowChoice = () => {
    choosingWithArrows.current = true;
    return false;
  };

  const handleKeyDownCapture = (event: KeyboardEvent<HTMLFieldSetElement>) => {
    onKeyDownCapture?.(event);

    keyHandler<HTMLFieldSetElement>(
      {
        ArrowUp: markArrowChoice,
        ArrowDown: markArrowChoice,
        ArrowLeft: markArrowChoice,
        ArrowRight: markArrowChoice,
        Home: markArrowChoice,
        End: markArrowChoice,
      },
      { evenIfPrevented: true },
    )(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLFieldSetElement>) => {
    onKeyDown?.(event);

    keyHandler<HTMLFieldSetElement>({
      Enter: () => {
        if (!isChoiceInput(event.target)) return false;
        questionnaire.advance();
      },
    })(event);
  };

  const toggleSingle = (value: string | null) => {
    const current = questionnaire.draftOf(name);
    const pressedTheChosenAgain = value === null && questionnaire.advanceOnSelect;
    const chosen = pressedTheChosenAgain ? (current.choices[0] ?? null) : value;

    questionnaire.setDraft(
      name,
      chosen === null ? { choices: [], other: current.other } : { choices: [chosen], other: '' },
    );

    if (chosen !== null && questionnaire.advanceOnSelect && !choosingWithArrows.current)
      questionnaire.advance();
  };

  const handleClick = (event: MouseEvent<HTMLFieldSetElement>) => {
    onClick?.(event);

    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.type !== 'radio') return;

    if (choosingWithArrows.current) {
      choosingWithArrows.current = false;
      return;
    }

    if (event.defaultPrevented || !questionnaire.advanceOnSelect || target.disabled) return;
    choose(target.value, true);
    questionnaire.advance();
  };

  const questionProps = {
    ...rest,
    hidden: hidden || !active,
    'aria-labelledby': legendId,
    'aria-describedby': descriptions.length > 0 ? descriptionId : undefined,
    'data-questionnaire-question': '',
    'data-active': active ? '' : undefined,
    className: styles.question({ className }),
    style,
    onKeyDownCapture: handleKeyDownCapture,
    onKeyDown: handleKeyDown,
    onKeyUp: (event: KeyboardEvent<HTMLFieldSetElement>) => {
      onKeyUp?.(event);
      choosingWithArrows.current = false;
    },
    onClick: handleClick,
  };

  const groupProps = { ...questionProps, name, size: questionnaire.size, orientation };

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
        size: questionnaire.size,
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
                size={questionnaire.size}
                orientation={orientation}
                aria-labelledby={legendId}
                className={styles.toggles()}
                value={draft.choices[0] ?? null}
                onValueChange={toggleSingle}
              >
                {options}
              </ToggleGroup>
            ) : (
              <ToggleGroup<string>
                selectionMode="multiple"
                name={name}
                size={questionnaire.size}
                orientation={orientation}
                aria-labelledby={legendId}
                className={styles.toggles()}
                value={draft.choices}
                onValueChange={(choices) =>
                  questionnaire.setDraft(name, {
                    choices,
                    other: questionnaire.draftOf(name).other,
                  })
                }
              >
                {options}
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
        <CheckboxGroup<string>
          {...groupProps}
          value={draft.choices}
          onValueChange={(choices) =>
            questionnaire.setDraft(name, { choices, other: questionnaire.draftOf(name).other })
          }
        >
          {content}
        </CheckboxGroup>
      )}
    </QuestionContext.Provider>
  );
}

QuestionnaireQuestion.displayName = 'Questionnaire.Question';
