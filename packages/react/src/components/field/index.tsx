import {
  Children,
  Fragment,
  cloneElement,
  createElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  type ComponentProps,
  type HTMLAttributes,
  type Ref,
  type ReactElement,
  type ReactNode,
} from 'react';

import { FieldSizeContext } from './context';
import { cn, invariant, mergeProps } from '../../utils';

import type { IdsSize } from '../../tokens/types';

export type FieldProps = Omit<ComponentProps<'div'>, 'children'> & {
  children: ReactNode;
  variant?: 'vertical' | 'horizontal';
  size?: IdsSize;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  /** Forwarded to the control. For automatic registration use /react-hook-form. */
  name?: string;
};

type PartName = 'label' | 'description' | 'hint' | 'error';
type PartProps = HTMLAttributes<HTMLElement> & {
  asChild?: boolean;
  ref?: Ref<HTMLElement>;
  htmlFor?: string;
};
type ControlProps = Record<string, unknown>;
type FieldContextValue = {
  controlId: string;
  ids: Partial<Record<PartName, string>>;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
  errorMessage?: ReactNode;
};
const FieldContext = createContext<FieldContextValue | null>(null);

function FieldPart({
  part,
  asChild,
  children,
  className,
  ...rest
}: PartProps & { part: PartName }) {
  const context = useContext(FieldContext);
  invariant(context, `[IDS] Field.${part} must be inside Field.`);
  if ((part === 'hint' && context.invalid) || (part === 'error' && !context.invalid)) return null;
  const content = part === 'error' ? (children ?? context.errorMessage) : children;
  const props = {
    ...rest,
    id: context.ids[part],
    htmlFor: part === 'label' ? context.controlId : undefined,
    'data-field-part': part,
    className: cn(
      part === 'label'
        ? 'font-medium text-(--ids-color-on-surface)'
        : 'text-(--ids-color-on-muted)',
      (part === 'error' || (part === 'label' && context.invalid)) && 'text-(--ids-field-danger)',
      context.disabled && 'opacity-50',
      className,
    ),
  };
  const marker =
    part === 'label' && context.required ? (
      <span aria-hidden="true" className="ml-1 text-(--ids-field-danger)">
        *
      </span>
    ) : null;
  if (asChild) {
    invariant(
      isValidElement<PartProps>(content),
      `[IDS] Field.${part} asChild requires one element.`,
    );
    const merged = mergeProps(content.props as unknown as Record<string, unknown>, props);
    return cloneElement(
      content,
      merged,
      marker ? (
        <>
          {content.props.children}
          {marker}
        </>
      ) : (
        content.props.children
      ),
    );
  }
  return createElement(part === 'label' ? 'label' : 'div', props, content, marker);
}

function FieldLabel(props: ComponentProps<'label'> & { asChild?: boolean }) {
  return <FieldPart {...props} part="label" />;
}
function FieldDescription(props: ComponentProps<'div'> & { asChild?: boolean }) {
  return <FieldPart {...props} part="description" />;
}
function FieldHint(props: ComponentProps<'div'> & { asChild?: boolean }) {
  return <FieldPart {...props} part="hint" />;
}
function FieldError(props: ComponentProps<'div'> & { asChild?: boolean }) {
  return <FieldPart {...props} part="error" />;
}
const parts = new Map<unknown, PartName>([
  [FieldLabel, 'label'],
  [FieldDescription, 'description'],
  [FieldHint, 'hint'],
  [FieldError, 'error'],
]);

function flatten(children: ReactNode): ReactElement<ControlProps>[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<ControlProps>(child)) return [];
    return child.type === Fragment ? flatten(child.props.children as ReactNode) : [child];
  });
}
function joinIds(...values: unknown[]) {
  return (
    [
      ...new Set(
        values
          .filter((value) => typeof value === 'string')
          .flatMap((value) => (value as string).split(/\s+/))
          .filter(Boolean),
      ),
    ].join(' ') || undefined
  );
}

/** Internal bridge shared with the optional RHF entry point. */
export function FieldRoot({
  children,
  id,
  name,
  size = 'standard',
  variant = 'vertical',
  invalid: invalidProp,
  disabled: disabledProp,
  required: requiredProp,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  bindControl,
  errorMessage,
  ...rest
}: FieldProps & {
  bindControl?: (props: ControlProps) => ControlProps;
  errorMessage?: ReactNode;
}) {
  const generatedId = useId();
  const nodes = flatten(children);
  const controls = nodes.filter(
    (node) =>
      !parts.has(node.type) &&
      (typeof node.type !== 'string' || ['input', 'select', 'textarea'].includes(node.type)),
  );
  const control = controls[0];
  const original = control?.props ?? {};
  const bound = bindControl ? bindControl(original) : original;
  const controlId =
    typeof original.id === 'string' ? original.id : (id ?? `ids-field-${generatedId}`);
  const invalid =
    invalidProp ?? (original['aria-invalid'] === true || original['aria-invalid'] === 'true');
  const disabled = disabledProp ?? Boolean(bound.disabled);
  const required = requiredProp ?? Boolean(original.required);
  const ids: FieldContextValue['ids'] = {};
  const duplicates: string[] = [];
  for (const node of nodes) {
    const part = parts.get(node.type);
    if (!part) continue;
    if (ids[part]) duplicates.push(part);
    const childId = isValidElement<ControlProps>(node.props.children)
      ? node.props.children.props.id
      : undefined;
    ids[part] = String(
      node.props.id ?? (node.props.asChild ? childId : undefined) ?? `${controlId}-${part}`,
    );
  }
  const accessibleName =
    ids.label ||
    original['aria-label'] ||
    original['aria-labelledby'] ||
    ariaLabel ||
    ariaLabelledby;
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (controls.length !== 1)
      console.warn('[IDS] Field: exactly one direct child control is required.');
    if (!accessibleName) console.warn('[IDS] Field: Field.Label or aria-label is required.');
    if (duplicates.length) console.warn('[IDS] Field: duplicate anatomy parts are not supported.');
  }, [controls.length, accessibleName, duplicates.length]);

  const controlProps = {
    ...bound,
    id: controlId,
    name: name ?? bound.name,
    disabled,
    required,
    'aria-label': original['aria-label'] ?? ariaLabel,
    'aria-labelledby': joinIds(original['aria-labelledby'], ariaLabelledby, ids.label),
    'aria-describedby': joinIds(
      original['aria-describedby'],
      ariaDescribedby,
      ids.description,
      invalid ? ids.error : ids.hint,
    ),
    'aria-invalid': invalidProp !== undefined || invalid ? invalid : original['aria-invalid'],
    'aria-required': requiredProp !== undefined || required ? required : original['aria-required'],
  };
  return (
    <FieldContext.Provider value={{ controlId, ids, invalid, disabled, required, errorMessage }}>
      <FieldSizeContext.Provider value={size}>
        <div
          {...rest}
          id={id ? `${id}-root` : undefined}
          data-field=""
          data-size={size}
          data-variant={variant}
          data-invalid={invalid ? '' : undefined}
          data-disabled={disabled ? '' : undefined}
          data-required={required ? '' : undefined}
          className={cn(
            'grid min-w-0 gap-x-3 gap-y-1.5 [--ids-field-danger:var(--ids-color-danger,#b42318)] [[data-mode=dark]_&]:[--ids-field-danger:var(--ids-color-danger,#fda29b)]',
            size === 'tiny' ? 'text-body-b3-regular' : 'text-body-b2-regular',
            variant === 'horizontal' &&
              'grid-cols-[auto_minmax(0,1fr)] [&>:not([data-field-part=label])]:col-start-2 [&>[data-field-part=label]]:col-start-1 [&>[data-field-part=label]]:self-center',
            variant === 'horizontal' &&
              (ids.description
                ? '[&>[data-field-part=label]]:row-start-2'
                : '[&>[data-field-part=label]]:row-start-1'),
            className,
          )}
          style={style}
        >
          {nodes.map((node, index) =>
            parts.has(node.type) ? (
              cloneElement(node, { key: node.key ?? index })
            ) : node === control ? (
              <div
                key={node.key ?? index}
                className="min-w-0 [&>input:not([type=checkbox]):not([type=radio])]:w-full [&>textarea]:w-full"
                data-field-control=""
              >
                {cloneElement(node, controlProps)}
              </div>
            ) : (
              node
            ),
          )}
        </div>
      </FieldSizeContext.Provider>
    </FieldContext.Provider>
  );
}

export const Field = Object.assign(
  function Field(props: FieldProps) {
    return <FieldRoot {...props} />;
  },
  {
    Label: FieldLabel,
    Description: FieldDescription,
    Hint: FieldHint,
    Error: FieldError,
  },
);
