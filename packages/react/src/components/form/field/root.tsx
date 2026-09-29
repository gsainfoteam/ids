'use client';

import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { isString, uniq } from 'es-toolkit';

import {
  FieldContext,
  FieldNotifyContext,
  FieldSizeContext,
  FieldStateContext,
  type FieldContextValue,
  type FieldOrientation,
  type FieldState,
} from './context';
import { FieldDescription } from './description';
import { FieldError } from './error';
import { errorShown } from './error-shown';
import { FieldHint } from './hint';
import { FieldLabel } from './label';
import { resolve, stateAttributes, type StateValue } from './state-value';
import { fieldStyle } from './style';
import { useField } from './use-field';
import { elementTypeOf } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

import type { FieldValidity, FieldValidityKey } from './control-state';
import type { IdsSize } from '../../../tokens/types';

export type FieldProps = Omit<ComponentProps<'div'>, 'children' | 'className' | 'style'> & {
  children: ReactNode;
  orientation?: FieldOrientation;
  /** @deprecated Use `orientation`. */
  variant?: FieldOrientation;
  size?: IdsSize;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  dirty?: boolean;
  touched?: boolean;
  name?: string;
  className?: StateValue<FieldState, string | undefined>;
  style?: StateValue<FieldState, CSSProperties | undefined>;
};

export type FieldErrorState = FieldState & {
  message: ReactNode;
  validity: FieldValidity['flags'] | null;
};

type ControlProps = Record<string, unknown>;
type PartName = 'label' | 'description' | 'hint' | 'error';

function flatten(children: ReactNode): ReactElement<ControlProps>[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<ControlProps>(child)) return [];
    return child.type === Fragment ? flatten(child.props.children as ReactNode) : [child];
  });
}

function joinIds(...values: unknown[]) {
  const ids = values.filter(isString).flatMap((value) => value.split(/\s+/));
  return uniq(ids.filter(Boolean)).join(' ') || undefined;
}

type FormLibraryBridge = {
  bindControl?: (props: ControlProps, control: ReactElement<ControlProps>) => ControlProps;
  errorMessage?: ReactNode;
};

export function FieldRoot({
  children,
  id,
  name,
  size = 'standard',
  orientation: orientationProp,
  variant: deprecatedOrientation,
  invalid: invalidProp,
  disabled: disabledProp,
  required: requiredProp,
  dirty,
  touched,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  bindControl,
  errorMessage,
  ...rest
}: FieldProps & FormLibraryBridge) {
  const orientation = orientationProp ?? deprecatedOrientation ?? 'vertical';
  const generatedId = useId();
  const field = useField({ dirty, touched });
  const nodes = flatten(children);
  const controls = nodes.filter(
    (node) =>
      !parts.has(elementTypeOf(node)) &&
      (typeof node.type !== 'string' || ['input', 'select', 'textarea'].includes(node.type)),
  );
  const control = controls[0];
  const original = control?.props ?? {};
  const bound = control && bindControl ? bindControl(original, control) : original;
  const controlId =
    typeof original.id === 'string' ? original.id : (id ?? `ids-field-${generatedId}`);
  const ariaInvalid = original['aria-invalid'] === true || original['aria-invalid'] === 'true';
  const invalid = invalidProp ?? (ariaInvalid || field.validity !== null);
  const disabled = disabledProp ?? Boolean(bound.disabled);
  const required = requiredProp ?? Boolean(original.required);
  const state: FieldState = { orientation, size, invalid, disabled, required, ...field.state };

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

  const context: FieldContextValue = {
    controlId,
    state,
    errorMessage,
    validity: field.validity,
    styles: fieldStyle({
      size,
      orientation,
      disabled,
      described: counts.description > 0,
    }),
  };
  const idsOf = (
    part: PartName,
    shown: (node: ReactElement<ControlProps>) => boolean = () => true,
  ) =>
    nodes
      .filter((node) => parts.get(elementTypeOf(node)) === part && shown(node))
      .map((node) => partIds.get(node));
  const labelIds = idsOf('label');
  const statusIds = invalid
    ? idsOf('error', (node) =>
        errorShown(node.props as { match?: FieldValidityKey; children?: unknown }, context),
      )
    : idsOf('hint');
  const duplicated = (['label', 'description', 'hint'] as const)
    .filter((part) => counts[part] > 1)
    .join(', ');
  const accessibleName =
    labelIds.length > 0 ||
    Boolean(original['aria-label'] || original['aria-labelledby'] || ariaLabel || ariaLabelledby);
  useEffect(() => {
    if (!isDevelopment) return;
    if (controls.length !== 1)
      console.warn('[IDS] Field: exactly one direct child control is required.');
    if (!accessibleName) console.warn('[IDS] Field: Field.Label or aria-label is required.');
    if (duplicated) console.warn(`[IDS] Field: only one ${duplicated} part is supported.`);
  }, [controls.length, accessibleName, duplicated]);

  const controlProps = {
    ...bound,
    id: controlId,
    name: name ?? bound.name,
    disabled,
    required,
    'aria-label': original['aria-label'] ?? ariaLabel,
    'aria-labelledby': joinIds(original['aria-labelledby'], ariaLabelledby, ...labelIds),
    'aria-describedby': joinIds(
      original['aria-describedby'],
      ariaDescribedby,
      ...idsOf('description'),
      ...statusIds,
    ),
    'aria-invalid': invalidProp !== undefined || invalid ? invalid : original['aria-invalid'],
    'aria-required': requiredProp !== undefined || required ? required : original['aria-required'],
  };

  return (
    <FieldContext value={context}>
      <FieldStateContext value={state}>
        <FieldSizeContext value={size}>
          <div
            {...rest}
            id={id ? `${id}-root` : undefined}
            data-field=""
            {...stateAttributes(state)}
            className={context.styles.root({ className: resolve(className, state) })}
            style={resolve(style, state)}
          >
            {nodes.map((node, index) =>
              parts.has(elementTypeOf(node)) ? (
                cloneElement(node, { key: node.key ?? index, id: partIds.get(node) })
              ) : node === control ? (
                <div
                  key={node.key ?? index}
                  ref={field.controlRef}
                  {...field.rereadInOnChangeBatch}
                  className={context.styles.control()}
                  data-field-control=""
                >
                  <FieldNotifyContext value={field.notify}>
                    {cloneElement(node, controlProps)}
                  </FieldNotifyContext>
                </div>
              ) : (
                node
              ),
            )}
          </div>
        </FieldSizeContext>
      </FieldStateContext>
    </FieldContext>
  );
}

const parts = new Map<unknown, PartName>([
  [FieldLabel, 'label'],
  [FieldDescription, 'description'],
  [FieldHint, 'hint'],
  [FieldError, 'error'],
]);
