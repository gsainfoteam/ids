'use client';

import { useId, useRef, type KeyboardEvent, type MouseEvent } from 'react';

import { uniq } from 'es-toolkit';

import { keyHandler } from '../../../../internal/lib/keys';
import { useInternalQuestionnaireContext } from '../context';
import { EMPTY_DRAFT, type QuestionnaireSelectionMode } from '../lib/answers';

const isChoiceInput = (target: EventTarget): target is HTMLInputElement =>
  target instanceof HTMLInputElement && (target.type === 'radio' || target.type === 'checkbox');

export function useInternalQuestionnaireQuestion({
  name,
  selectionMode,
  onKeyDown,
  onKeyDownCapture,
  onKeyUp,
  onClick,
}: {
  name: string;
  selectionMode: QuestionnaireSelectionMode;
  onKeyDown: ((event: KeyboardEvent<HTMLFieldSetElement>) => void) | undefined;
  onKeyDownCapture: ((event: KeyboardEvent<HTMLFieldSetElement>) => void) | undefined;
  onKeyUp: ((event: KeyboardEvent<HTMLFieldSetElement>) => void) | undefined;
  onClick: ((event: MouseEvent<HTMLFieldSetElement>) => void) | undefined;
}) {
  const questionnaire = useInternalQuestionnaireContext('Questionnaire.Question');
  const legendId = useId();
  const descriptionId = useId();
  const choosingWithArrows = useRef(false);

  const draft = questionnaire.drafts[name] ?? EMPTY_DRAFT;
  const active = questionnaire.activeName === name;

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

  const setChoices = (choices: string[]) =>
    questionnaire.setDraft(name, { choices, other: questionnaire.draftOf(name).other });

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

  const handleKeyUp = (event: KeyboardEvent<HTMLFieldSetElement>) => {
    onKeyUp?.(event);
    choosingWithArrows.current = false;
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

  return {
    size: questionnaire.size,
    legendId,
    descriptionId,
    draft,
    active,
    choose,
    setChoices,
    setOther,
    toggleSingle,
    handlers: {
      onKeyDownCapture: handleKeyDownCapture,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
      onClick: handleClick,
    },
  };
}
