'use client';

import {
  cloneElement,
  use,
  useId,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import {
  FieldContext,
  FieldGroupContext,
  FieldNotifyContext,
  FieldSizeContext,
  FieldStateContext,
  type FieldContextValue,
  type FieldOrientation,
  type FieldState,
} from './context';
import { useInternalField } from './hooks/use-field';
import { useInternalFieldWarnings } from './hooks/use-field-warnings';
import { errorShown } from './lib/error-shown';
import {
  controlsIn,
  duplicatedParts,
  flatten,
  idsOfPart,
  isFieldPart,
  joinIds,
  partIdsIn,
  type ControlProps,
  type PartName,
} from './lib/field-children';
import { resolve, stateAttributes, type StateValue } from './lib/state-value';
import { fieldStyle } from './style';

import type { FieldValidity, FieldValidityKey } from './lib/control-state';
import type { IdsSize } from '../../../tokens/types';

export type FieldProps = Omit<ComponentProps<'div'>, 'children' | 'className' | 'style'> & {
  children: ReactNode;
  orientation?: FieldOrientation;
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
  const groupOrientation = use(FieldGroupContext);
  const orientation = orientationProp ?? groupOrientation ?? 'vertical';
  const generatedId = useId();
  const field = useInternalField({ dirty, touched });
  const nodes = flatten(children);
  const controls = controlsIn(nodes);
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

  const { partIds, counts } = partIdsIn(nodes, controlId);

  const context: FieldContextValue = {
    controlId,
    state,
    errorMessage,
    validity: field.validity,
    styles: fieldStyle({
      size,
      orientation,
      described: counts.description > 0,
    }),
  };
  const idsOf = (part: PartName, shown?: (node: ReactElement<ControlProps>) => boolean) =>
    idsOfPart(nodes, partIds, part, shown);
  const labelIds = idsOf('label');
  const statusIds = invalid
    ? idsOf('error', (node) =>
        errorShown(node.props as { match?: FieldValidityKey; children?: unknown }, context),
      )
    : idsOf('hint');
  const duplicated = duplicatedParts(counts);
  const accessibleName =
    labelIds.length > 0 ||
    Boolean(original['aria-label'] || original['aria-labelledby'] || ariaLabel || ariaLabelledby);
  useInternalFieldWarnings({ controls: controls.length, accessibleName, duplicated });

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
              isFieldPart(node) ? (
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
