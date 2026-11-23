import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { focusable } from 'tabbable';

import { containsElementOfType, elementTypeOf, flattenFragments } from '../../../../utils/children';
import { QuestionnaireOption, type QuestionnaireOptionProps } from '../parts/option';
import { QuestionnaireOther } from '../parts/other';
import { QuestionnaireQuestion, type QuestionnaireQuestionProps } from '../parts/question';
import { QuestionnaireSubmit } from '../parts/submit';

import type { QuestionnaireQuestionShape } from './answers';

const QUESTION = new Set<unknown>([QuestionnaireQuestion]);
const OPTION = new Set<unknown>([QuestionnaireOption]);
const OTHER = new Set<unknown>([QuestionnaireOther]);
const SUBMIT = new Set<unknown>([QuestionnaireSubmit]);

function optionValuesIn(children: ReactNode): string[] {
  return flattenFragments(children).flatMap((node) => {
    if (!isValidElement<{ children?: ReactNode }>(node)) return [];
    if (OPTION.has(elementTypeOf(node)))
      return [(node as ReactElement<QuestionnaireOptionProps>).props.value];
    return optionValuesIn(node.props.children);
  });
}

export function readQuestions(children: ReactNode): QuestionnaireQuestionShape[] {
  return flattenFragments(children).flatMap((node) => {
    if (!isValidElement<QuestionnaireQuestionProps>(node) || !QUESTION.has(elementTypeOf(node)))
      return [];

    const { name, selectionMode = 'single', optional = false, children: parts } = node.props;
    return [
      {
        name,
        selectionMode,
        optional,
        hasOther: containsElementOfType(parts, OTHER),
        optionValues: optionValuesIn(parts),
      },
    ];
  });
}

export const isSubmit = (node: ReactNode) =>
  isValidElement(node) && SUBMIT.has(elementTypeOf(node));

const forwardsItsOwnFocus = (element: HTMLElement) => element.hasAttribute('tabindex');

const isChosen = (element: Element) =>
  element.matches('[aria-checked="true"], [aria-pressed="true"]');

export function focusTarget(question: HTMLElement) {
  if (forwardsItsOwnFocus(question)) return question;
  const candidates = focusable(question);
  return candidates.find(isChosen) ?? candidates[0];
}
