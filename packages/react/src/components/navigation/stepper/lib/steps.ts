import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { elementTypeOf } from '../../../../utils';

export function sortSteps(nodes: ReactNode[], item: unknown, allowed: readonly unknown[] = []) {
  const isStep = (node: ReactNode): node is ReactElement =>
    isValidElement(node) && elementTypeOf(node) === item;
  const others = nodes.filter((node) => !isStep(node));

  return {
    steps: nodes.filter(isStep),
    others,
    strayCount: others.filter(
      (node) => isValidElement(node) && !allowed.includes(elementTypeOf(node)),
    ).length,
  };
}
