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
import { questionnaireStyle, type QuestionnaireOrientation } from './style';
import { keyHandler } from '../../../internal/keys';
import { elementTypeOf, flattenFragments } from '../../../utils/children';
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

function splitQuestion(children: ReactNode) {
  const nodes = flattenFragments(children);
  const firstPart = nodes.findIndex((node) => isPart(node, ANSWER_PARTS));
  const answerNodes = firstPart < 0 ? [] : nodes.slice(firstPart);

  return {
    text: firstPart < 0 ? nodes : nodes.slice(0, firstPart),
    descriptions: answerNodes.filter((node) => isPart(node, DESCRIPTION)),
    answers: answerNodes.filter((node) => !isPart(node, DESCRIPTION)),
  };
}

const isChoiceInput = (target: EventTarget): target is HTMLInputElement =>
  target instanceof HTMLInputElement && (target.type === 'radio' || target.type === 'checkbox');

export function QuestionnaireQuestion({
  name,
  selectionMode = 'single',
  optional: _readByTheRoot,
  orientation = 'vertical',
  hidden,
  className,
  style,
  children,
  onKeyDown,
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
  const { text, descriptions, answers } = splitQuestion(children);
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

  const handleKeyDown = (event: KeyboardEvent<HTMLFieldSetElement>) => {
    onKeyDown?.(event);

    keyHandler<HTMLFieldSetElement>({
      ArrowUp: markArrowChoice,
      ArrowDown: markArrowChoice,
      ArrowLeft: markArrowChoice,
      ArrowRight: markArrowChoice,
      Home: markArrowChoice,
      End: markArrowChoice,
      Enter: () => {
        if (!isChoiceInput(event.target)) return false;
        questionnaire.advance();
      },
    })(event);
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

  const groupProps = {
    ...rest,
    name,
    size: questionnaire.size,
    orientation,
    hidden: hidden || !active,
    'aria-labelledby': legendId,
    'aria-describedby': descriptions.length > 0 ? descriptionId : undefined,
    'data-questionnaire-question': '',
    'data-active': active ? '' : undefined,
    className: styles.question({ className }),
    style,
    onKeyDown: handleKeyDown,
    onKeyUp: (event: KeyboardEvent<HTMLFieldSetElement>) => {
      onKeyUp?.(event);
      choosingWithArrows.current = false;
    },
    onClick: handleClick,
  };

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
        draft,
        descriptionId,
        size: questionnaire.size,
        setOther,
      }}
    >
      {selectionMode === 'single' ? (
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
