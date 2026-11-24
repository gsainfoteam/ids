import { isValidElement, type ReactNode } from 'react';

import { elementTypeOf } from '../../../../utils';
import { BreadcrumbEllipsis } from '../parts/ellipsis';
import { BreadcrumbItem } from '../parts/item';
import { BreadcrumbSeparator } from '../parts/separator';

const isOfType = (node: ReactNode, type: unknown) =>
  isValidElement(node) && elementTypeOf(node) === type;

export const isItem = (node: ReactNode) => isOfType(node, BreadcrumbItem);
export const isEllipsis = (node: ReactNode) => isOfType(node, BreadcrumbEllipsis);
export const isCrumb = (node: ReactNode) => isItem(node) || isEllipsis(node);
export const isSeparator = (node: ReactNode) => isOfType(node, BreadcrumbSeparator);
