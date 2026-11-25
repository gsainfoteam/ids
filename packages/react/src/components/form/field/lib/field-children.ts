import { Children, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react';

import { isString, uniq } from 'es-toolkit';

import { elementTypeOf } from '../../../../utils';
import { FieldDescription } from '../parts/description';
import { FieldError } from '../parts/error';
import { FieldHint } from '../parts/hint';
import { FieldLabel } from '../parts/label';

export type ControlProps = Record<string, unknown>;
export type PartName = 'label' | 'description' | 'hint' | 'error';

const parts = new Map<unknown, PartName>([
  [FieldLabel, 'label'],
  [FieldDescription, 'description'],
  [FieldHint, 'hint'],
  [FieldError, 'error'],
]);

export const isFieldPart = (node: ReactElement) => parts.has(elementTypeOf(node));

export function flatten(children: ReactNode): ReactElement<ControlProps>[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<ControlProps>(child)) return [];
    return child.type === Fragment ? flatten(child.props.children as ReactNode) : [child];
  });
}

export function joinIds(...values: unknown[]) {
  const ids = values.filter(isString).flatMap((value) => value.split(/\s+/));
  return uniq(ids.filter(Boolean)).join(' ') || undefined;
}

export const controlsIn = (nodes: ReactElement<ControlProps>[]) =>
  nodes.filter(
    (node) =>
      !isFieldPart(node) &&
      (typeof node.type !== 'string' || ['input', 'select', 'textarea'].includes(node.type)),
  );

export function partIdsIn(nodes: ReactElement<ControlProps>[], controlId: string) {
  const partIds = new Map<ReactElement, string>();
  const counts: Record<PartName, number> = { label: 0, description: 0, hint: 0, error: 0 };
  for (const node of nodes) {
    const part = parts.get(elementTypeOf(node));
    if (!part) continue;
    const index = counts[part]++;
    const childId = isValidElement<ControlProps>(node.props.children)
      ? node.props.children.props.id
      : undefined;
    partIds.set(
      node,
      String(
        node.props.id ??
          (node.props.asChild ? childId : undefined) ??
          `${controlId}-${part}${index ? `-${index + 1}` : ''}`,
      ),
    );
  }
  return { partIds, counts };
}

export const idsOfPart = (
  nodes: ReactElement<ControlProps>[],
  partIds: Map<ReactElement, string>,
  part: PartName,
  shown: (node: ReactElement<ControlProps>) => boolean = () => true,
) =>
  nodes
    .filter((node) => parts.get(elementTypeOf(node)) === part && shown(node))
    .map((node) => partIds.get(node));

export const duplicatedParts = (counts: Record<PartName, number>) =>
  (['label', 'description', 'hint'] as const).filter((part) => counts[part] > 1).join(', ');
