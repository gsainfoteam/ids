import { isValidElement, type ReactElement } from 'react';

import { elementTypeOf } from '../../../../utils';
import { StepperContent } from '../parts/content';
import { StepperItem } from '../parts/item';

export const isStep = (node: unknown): node is ReactElement =>
  isValidElement(node) && elementTypeOf(node) === StepperItem;

export const isStray = (node: unknown) =>
  isValidElement(node) && !isStep(node) && elementTypeOf(node) !== StepperContent;
