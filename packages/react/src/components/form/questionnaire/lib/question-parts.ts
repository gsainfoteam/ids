import { isValidElement, type ReactNode } from 'react';

import { elementTypeOf, flattenFragments } from '../../../../utils/children';
import { QuestionnaireDescription } from '../parts/description';
import { QuestionnaireOption } from '../parts/option';
import { QuestionnaireOther } from '../parts/other';

const ANSWER_PARTS = new Set<unknown>([
  QuestionnaireOption,
  QuestionnaireOther,
  QuestionnaireDescription,
]);

const isPart = (node: ReactNode, parts: ReadonlySet<unknown>) =>
  isValidElement(node) && parts.has(elementTypeOf(node));

const DESCRIPTION = new Set<unknown>([QuestionnaireDescription]);
const OPTION = new Set<unknown>([QuestionnaireOption]);

export function splitQuestion(children: ReactNode) {
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
