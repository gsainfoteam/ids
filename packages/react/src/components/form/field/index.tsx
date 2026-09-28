import {
  Children,
  Fragment,
  cloneElement,
  createContext,
  createElement,
  isValidElement,
  use,
  useEffect,
  useId,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { isString, uniq } from 'es-toolkit';

import {
  FieldLabelContext,
  FieldNotifyContext,
  FieldSizeContext,
  FieldStateContext,
  type FieldOrientation,
  type FieldState,
} from './context';
import { useField } from './use-field';
import { invariant, mergeProps, tv } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { Label as BaseLabel } from '../../typography/label';

import type { FieldValidity, FieldValidityKey } from './control-state';
import type { IdsSize } from '../../../tokens/types';

export type { FieldOrientation, FieldState } from './context';
export type { FieldValidity, FieldValidityKey } from './control-state';

type StateValue<S, T> = T | ((state: S) => T);

type PartOwnProps<S> = {
  asChild?: boolean;
  className?: StateValue<S, string | undefined>;
  style?: StateValue<S, CSSProperties | undefined>;
  children?: StateValue<S, ReactNode>;
};
type PartProps<Tag extends 'label' | 'div', S> = Omit<ComponentProps<Tag>, keyof PartOwnProps<S>> &
  PartOwnProps<S>;

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

type FieldContextValue = {
  controlId: string;
  state: FieldState;
  errorMessage: ReactNode;
  validity: FieldValidity | null;
  styles: ReturnType<typeof Field.Style>;
};

const FieldContext = createContext<FieldContextValue | null>(null);

function usePart(name: string) {
  const context = use(FieldContext);
  invariant(context, `Field.${name} must be inside Field.`);
  return context;
}

function resolve<S, T>(value: StateValue<S, T>, state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}

function present(value: ReactNode) {
  return value != null && value !== false && value !== '';
}

function stateAttributes(state: FieldState) {
  return {
    'data-orientation': state.orientation,
    'data-size': state.size,
    'data-invalid': state.invalid ? '' : undefined,
    'data-disabled': state.disabled ? '' : undefined,
    'data-required': state.required ? '' : undefined,
    'data-filled': state.filled ? '' : undefined,
    'data-focused': state.focused ? '' : undefined,
    'data-touched': state.touched ? '' : undefined,
    'data-dirty': state.dirty ? '' : undefined,
  };
}

function errorShown(
  { match, children }: { match?: FieldValidityKey; children?: unknown },
  { state, errorMessage, validity }: Pick<FieldContextValue, 'state' | 'errorMessage' | 'validity'>,
) {
  if (!state.invalid) return false;
  if (match !== undefined) return validity?.flags[match] === true;
  return (
    typeof children === 'function' ||
    present(children as ReactNode) ||
    present(errorMessage) ||
    present(validity?.message)
  );
}

function renderPart(
  name: string,
  asChild: boolean | undefined,
  props: Record<string, unknown>,
  content: ReactNode,
) {
  if (asChild) {
    invariant(isValidElement(content), `Field.${name} asChild requires one element.`);
    return cloneElement(content, mergeProps(content.props as Record<string, unknown>, props));
  }
  return createElement('div', props, content);
}

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
      !parts.has(node.type) &&
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
    const part = parts.get(node.type);
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
    styles: Field.Style({
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
      .filter((node) => parts.get(node.type) === part && shown(node))
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
              parts.has(node.type) ? (
                cloneElement(node, { key: node.key ?? index, id: partIds.get(node) })
              ) : node === control ? (
                <div
                  key={node.key ?? index}
                  ref={field.controlRef}
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

export function Field(props: FieldProps) {
  return <FieldRoot {...props} />;
}

export namespace Field {
  export type Props = FieldProps;
  export type State = FieldState;
  export type Orientation = FieldOrientation;
  export type ErrorState = FieldErrorState;
  export type ValidityKey = FieldValidityKey;

  export type LabelProps = PartProps<'label', FieldState>;
  export type DescriptionProps = PartProps<'div', FieldState>;
  export type HintProps = PartProps<'div', FieldState>;
  export type ErrorProps = PartProps<'div', FieldErrorState> & { match?: FieldValidityKey };

  export function Label({ className, style, children, ...rest }: LabelProps) {
    const { controlId, state } = usePart('Label');
    return (
      <FieldLabelContext value>
        <BaseLabel
          {...rest}
          htmlFor={controlId}
          size={state.size}
          required={state.required}
          disabled={state.disabled}
          invalid={state.invalid}
          data-field-part="label"
          {...stateAttributes(state)}
          className={resolve(className, state)}
          style={resolve(style, state)}
        >
          {resolve(children, state)}
        </BaseLabel>
      </FieldLabelContext>
    );
  }

  export function Description({ asChild, className, style, children, ...rest }: DescriptionProps) {
    const { state, styles } = usePart('Description');
    return renderPart(
      'Description',
      asChild,
      {
        ...rest,
        'data-field-part': 'description',
        ...stateAttributes(state),
        className: styles.description({ className: resolve(className, state) }),
        style: resolve(style, state),
      },
      resolve(children, state),
    );
  }

  export function Hint({ asChild, className, style, children, ...rest }: HintProps) {
    const { state, styles } = usePart('Hint');
    if (state.invalid) return null;
    return renderPart(
      'Hint',
      asChild,
      {
        ...rest,
        'data-field-part': 'hint',
        ...stateAttributes(state),
        className: styles.hint({ className: resolve(className, state) }),
        style: resolve(style, state),
      },
      resolve(children, state),
    );
  }

  export function Error({ asChild, match, className, style, children, ...rest }: ErrorProps) {
    const context = usePart('Error');
    if (!errorShown({ match, children }, context)) return null;
    const { state, errorMessage, validity, styles } = context;
    const fallback = match === undefined ? (errorMessage ?? validity?.message) : validity?.message;
    const errorState: FieldErrorState = {
      ...state,
      message: present(fallback) ? fallback : undefined,
      validity: validity?.flags ?? null,
    };
    return renderPart(
      'Error',
      asChild,
      {
        ...rest,
        'data-field-part': 'error',
        'data-match': match,
        ...stateAttributes(state),
        className: styles.error({ className: resolve(className, errorState) }),
        style: resolve(style, errorState),
      },
      typeof children === 'function' ? children(errorState) : (children ?? errorState.message),
    );
  }

  export const Style = tv({
    slots: {
      root: 'grid min-w-0 gap-x-3 gap-y-2',
      description: 'text-(--ids-color-on-muted)',
      hint: 'text-(--ids-color-on-muted)',
      error: 'text-(--ids-color-danger)',
      control:
        'min-w-0 [&>input:not([type=checkbox]):not([type=radio])]:w-full [&>textarea]:w-full',
    },
    variants: {
      size: {
        standard: { root: 'text-body-b3-regular' },
        tiny: { root: 'text-caption-c1-regular' },
      } satisfies Record<IdsSize, object>,
      orientation: {
        vertical: {},
        horizontal: {
          root: 'grid-cols-[auto_minmax(0,1fr)] [&>:not([data-field-part=label])]:col-start-2 [&>[data-field-part=label]]:col-start-1 [&>[data-field-part=label]]:self-center',
        },
      } satisfies Record<FieldOrientation, object>,
      described: { true: {}, false: {} },
      disabled: {
        true: {
          description: 'opacity-50',
          hint: 'opacity-50',
          error: 'opacity-50',
        },
      },
    },
    compoundVariants: [
      {
        orientation: 'horizontal',
        described: true,
        class: { root: '[&>[data-field-part=label]]:row-start-2' },
      },
      {
        orientation: 'horizontal',
        described: false,
        class: { root: '[&>[data-field-part=label]]:row-start-1' },
      },
    ],
    defaultVariants: { size: 'standard', orientation: 'vertical' },
  });
}

const parts = new Map<unknown, PartName>([
  [Field.Label, 'label'],
  [Field.Description, 'description'],
  [Field.Hint, 'hint'],
  [Field.Error, 'error'],
]);
