import {
  createContext,
  isValidElement,
  use,
  useId,
  type ComponentProps,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import { XMarkIcon } from '@heroicons/react/16/solid';

import { useColorField } from './use-color-field';
import {
  FieldPopup,
  FieldPopupHeader,
  fieldTrigger,
  flattenParts,
  part,
  resolveState,
  useDrawerPresentation,
  type FieldTriggerVariant,
} from '../../../internal/field-popup';
import { FormValue } from '../../../internal/form-value';
import { messages } from '../../../internal/messages';
import { invariant, mergeProps, mergeRefs, tv } from '../../../utils';
import { ColorPicker, type ColorPickerSwatchOption } from '../../data/color-picker';
import { cssColor, type ColorFormat } from '../../data/color-picker/color';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

export type { ColorFormat } from '../../data/color-picker/color';
export type ColorFieldVariant = FieldTriggerVariant;

export type ColorFieldState = {
  open: boolean;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  empty: boolean;
};

export type ColorFieldProps = Omit<
  ComponentProps<'button'>,
  'value' | 'defaultValue' | 'onChange' | 'className' | 'style' | 'children' | 'type'
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  format?: ColorFormat;
  alpha?: boolean;
  swatches?: ColorPickerSwatchOption[];
  variant?: ColorFieldVariant;
  size?: IdsSize;
  invalid?: boolean;
  readOnly?: boolean;
  required?: boolean;
  placeholder?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  mobileVariant?: 'popover' | 'drawer';
  className?: string | ((state: ColorFieldState) => string | undefined);
  style?: CSSProperties;
  children?: ReactNode;
};

type Context = {
  field: Omit<ReturnType<typeof useColorField>, 'rootRef' | 'triggerRef'>;
  state: ColorFieldState;
  placeholder: string;
  triggerProps: Record<string, unknown>;
  valueId: string;
  picker: ComponentProps<typeof ColorPicker>;
  styles: ReturnType<typeof ColorField.Style>;
};

const FieldContext = createContext<Context | null>(null);

function useColor(part: string) {
  const context = use(FieldContext);
  invariant(context, `${part} must be rendered inside ColorField.`);
  return context;
}

const isType = (type: unknown) => (node: ReactNode) => isValidElement(node) && node.type === type;

// Duck-typed rather than `instanceof Node`, which fails across frames.
const isNode = (value: unknown): value is Node =>
  typeof value === 'object' && value !== null && 'nodeType' in value;

// Focus lands on the first control of whatever the popup holds: the area, a slider, the
// input, or the chosen swatch of a palette-only picker.
const FIRST_CONTROL = [
  '[data-color-picker] input:not([tabindex="-1"])',
  '[data-color-picker] [role=slider]:not([tabindex="-1"])',
  '[data-color-picker] [role=radio][tabindex="0"]',
].join(', ');

const CHECKER =
  'conic-gradient(var(--ids-color-muted) 25%, var(--ids-color-surface) 0 50%, var(--ids-color-muted) 0 75%, var(--ids-color-surface) 0)';

export function ColorField({
  value,
  defaultValue,
  onValueChange,
  format = 'hex',
  alpha = false,
  swatches,
  variant = 'outline',
  size,
  invalid,
  readOnly = false,
  required = false,
  disabled = false,
  placeholder = messages.colorField.placeholder,
  open,
  defaultOpen,
  onOpenChange,
  mobileVariant,
  name,
  form,
  className,
  style,
  children,
  ref: forwardedRef,
  onBlur,
  ...native
}: ColorFieldProps) {
  const { rootRef, triggerRef, ...field } = useColorField({
    value,
    defaultValue,
    onValueChange,
    open,
    defaultOpen,
    onOpenChange,
    format,
    alpha,
    disabled,
    readOnly,
  });
  const { state: s, actions } = field;
  const drawer = useDrawerPresentation(mobileVariant);
  const popupId = `ids-color-${useId()}`;
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const styles = ColorField.Style({ variant, size: resolvedSize });

  const ariaInvalid = native['aria-invalid'] ?? invalid ?? (s.invalid || undefined);
  const isInvalid = ariaInvalid === true || ariaInvalid === 'true';
  const state: ColorFieldState = {
    open: s.open,
    disabled,
    readOnly,
    invalid: isInvalid,
    required,
    empty: !s.value,
  };

  const popupSelector = `[data-color-field-popup="${popupId}"]`;
  const triggerId = native.id ?? `${popupId}-trigger`;
  const valueId = `${popupId}-value`;
  // A label on a button replaces its content as the name, which would hide the color from a
  // screen reader. Pointing the name at the label and then the value reads both.
  const labelledBy = native['aria-labelledby']
    ? `${native['aria-labelledby']} ${valueId}`
    : native['aria-label']
      ? `${triggerId} ${valueId}`
      : undefined;
  const triggerProps = mergeProps(native as Record<string, unknown>, {
    // mergeRefs only composes the refs into a callback; nothing reads them during render.
    // eslint-disable-next-line react-hooks/refs
    ref: mergeRefs(triggerRef, forwardedRef),
    id: triggerId,
    'aria-labelledby': labelledBy,
    type: 'button',
    form,
    disabled,
    'aria-haspopup': 'dialog',
    'aria-expanded': s.open,
    'aria-controls': s.open ? popupId : undefined,
    'aria-invalid': ariaInvalid,
    'aria-required': native['aria-required'] ?? (required || undefined),
    'aria-disabled': readOnly || undefined,
    'data-field-input': '',
    'data-placeholder': state.empty ? '' : undefined,
    'data-readonly': readOnly ? '' : undefined,
    onClick: actions.toggle,
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => actions.onTriggerKeyDown(event),
    // Moving into the popup is not leaving the field.
    onBlur: (event: FocusEvent<HTMLButtonElement>) => {
      const next = event.relatedTarget;
      if (isNode(next) && (next as Element).closest?.(popupSelector)) return;
      onBlur?.(event);
    },
  });

  const nodes = flattenParts(children);
  const triggers = nodes.filter(isType(ColorFieldTrigger));
  const clears = nodes.filter(isType(ColorFieldClear));
  const contents = nodes.filter(isType(ColorFieldContent));
  invariant(
    triggers.length <= 1 && contents.length <= 1 && clears.length <= 1,
    'ColorField accepts one Trigger, Content and Clear.',
  );

  return (
    <FieldContext
      value={{
        field,
        state,
        placeholder,
        triggerProps,
        valueId,
        picker: {
          value: s.text,
          onValueChange: actions.change,
          format,
          alpha,
          swatches,
          size: resolvedSize,
          disabled,
          readOnly,
        },
        styles,
      }}
    >
      <div
        ref={rootRef}
        data-color-field=""
        data-size={resolvedSize}
        data-variant={variant}
        data-open={s.open ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        data-readonly={readOnly ? '' : undefined}
        data-invalid={isInvalid ? '' : undefined}
        data-required={required ? '' : undefined}
        data-empty={state.empty ? '' : undefined}
        className={styles.root({ className: resolveState(className, state) })}
        style={style}
      >
        {triggers.length ? triggers : <ColorFieldTrigger />}
        {clears.length ? clears : <ColorFieldClear />}
        <FormValue
          name={name}
          form={form}
          value={s.text}
          required={required && !readOnly}
          disabled={disabled}
          anchor={triggerRef}
        />
      </div>
      {s.open && (
        <FieldPopup
          anchor={rootRef}
          onClose={actions.close}
          mobileVariant={mobileVariant}
          preferredWidth={resolvedSize === 'tiny' ? 248 : 280}
          initialFocusSelector={FIRST_CONTROL}
          role="dialog"
          id={popupId}
          {...(native['aria-labelledby']
            ? { 'aria-labelledby': native['aria-labelledby'] }
            : { 'aria-label': native['aria-label'] ?? messages.colorField.dialog })}
          data-color-field-popup={popupId}
          className={styles.popup()}
          onBlur={(event) => {
            const next = event.relatedTarget;
            if (isNode(next) && (event.currentTarget.contains(next) || next === triggerRef.current))
              return;
            onBlur?.(event as unknown as FocusEvent<HTMLButtonElement>);
          }}
        >
          {drawer && (
            <FieldPopupHeader
              title={messages.colorField.dialog}
              closeLabel={messages.colorField.close}
              onClose={() => actions.close(true)}
            />
          )}
          {contents.length ? contents : <ColorFieldContent />}
        </FieldPopup>
      )}
    </FieldContext>
  );
}

function ColorFieldTrigger({ asChild, children, className, ...props }: ColorField.TriggerProps) {
  const c = useColor('ColorField.Trigger');
  invariant(
    !flattenParts(children).some(isType(ColorFieldClear)),
    'ColorField.Clear must be a sibling of Trigger, not inside its button.',
  );
  return part(
    'button',
    asChild,
    children ?? (
      <>
        <ColorFieldSwatch />
        <ColorFieldValue />
      </>
    ),
    mergeProps(props, {
      ...c.triggerProps,
      className: c.styles.trigger({ className: resolveState(className, c.state) }),
    }),
  );
}

// No color is drawn as a struck-through box; a translucent one over a checkerboard.
function ColorFieldSwatch({
  asChild,
  children,
  className,
  style,
  ...props
}: ColorField.SwatchProps) {
  const c = useColor('ColorField.Swatch');
  const { parsed } = c.field.state;
  const fill = parsed ? cssColor(parsed) : undefined;
  return part(
    'span',
    asChild,
    children,
    mergeProps(props, {
      'aria-hidden': true,
      'data-color-field-swatch': '',
      'data-empty': parsed ? undefined : '',
      className: c.styles.swatch({ className }),
      style: fill
        ? {
            ...style,
            backgroundImage: `linear-gradient(${fill}, ${fill}), ${CHECKER}`,
            backgroundSize: '100% 100%, 6px 6px',
          }
        : style,
    }),
  );
}

function ColorFieldValue({ asChild, children, className, ...props }: ColorField.ValueProps) {
  const c = useColor('ColorField.Value');
  const { text } = c.field.state;
  return part(
    'span',
    asChild,
    children ?? (text || c.placeholder),
    mergeProps(props, {
      id: props.id ?? c.valueId,
      'data-placeholder': text ? undefined : '',
      className: c.styles.value({ className }),
    }),
  );
}

function ColorFieldClear({ asChild, children, className, ...props }: ColorField.ClearProps) {
  const c = useColor('ColorField.Clear');
  if (!c.field.state.value || c.state.readOnly) return null;
  return part(
    'button',
    asChild,
    children ?? <XMarkIcon aria-hidden="true" />,
    mergeProps(props, {
      type: 'button',
      'aria-label': props['aria-label'] ?? messages.colorField.clear,
      disabled: c.state.disabled,
      'data-color-field-clear': '',
      className: c.styles.clear({ className }),
      onClick: c.field.actions.clear,
    }),
  );
}

// The popup's body: a ColorPicker bound to the field. Its children are ColorPicker parts, so a
// field can offer only a palette, or only a hue slider and an input.
function ColorFieldContent({ children, className, ...props }: ColorField.ContentProps) {
  const c = useColor('ColorField.Content');
  return (
    <ColorPicker {...props} {...c.picker} className={className}>
      {children}
    </ColorPicker>
  );
}

export namespace ColorField {
  export type Props = ColorFieldProps;
  export type State = ColorFieldState;
  export type Variant = ColorFieldVariant;
  export type TriggerProps = Omit<ComponentProps<'button'>, 'className'> & {
    asChild?: boolean;
    className?: string | ((state: ColorFieldState) => string | undefined);
  };
  export type SwatchProps = ComponentProps<'span'> & { asChild?: boolean };
  export type ValueProps = ComponentProps<'span'> & { asChild?: boolean };
  export type ClearProps = ComponentProps<'button'> & { asChild?: boolean };
  export type ContentProps = Omit<
    ComponentProps<'div'>,
    'defaultValue' | 'onChange' | 'className' | 'children'
  > & {
    className?: string;
    children?: ReactNode;
  };

  export const Trigger = ColorFieldTrigger;
  export const Swatch = ColorFieldSwatch;
  export const Value = ColorFieldValue;
  export const Clear = ColorFieldClear;
  export const Content = ColorFieldContent;

  export const Style = tv({
    slots: {
      // The trigger carries data-field-input, so focus-ring rings the whole field for it while
      // Clear keeps a ring of its own.
      root: ['relative', fieldTrigger.base],
      trigger: [
        'flex h-full min-w-0 flex-1 cursor-pointer items-center self-stretch bg-transparent text-start outline-none',
        'disabled:cursor-not-allowed data-readonly:cursor-default',
      ],
      swatch: [
        'shrink-0 rounded-indicator inset-ring-1 inset-ring-(--ids-color-on-surface)/15',
        'data-empty:bg-[linear-gradient(to_top_right,transparent_calc(50%-0.75px),var(--ids-color-danger)_50%,transparent_calc(50%+0.75px))]',
        'data-empty:inset-ring-(--ids-color-border)',
      ],
      value: [
        'min-w-0 flex-1 truncate font-mono',
        'data-placeholder:font-sans data-placeholder:text-(--ids-color-on-muted)',
      ],
      clear: [
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-standard',
        'text-(--ids-color-on-muted) hover:bg-(--ids-color-muted) hover:text-(--ids-color-on-surface)',
        'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
        'focus-ring disabled:pointer-events-none',
      ],
      // Padding that keeps the popup's corner concentric with the standard-radius area inside it.
      popup: 'concentric-p-3',
    },
    variants: {
      variant: {
        outline: { root: fieldTrigger.variant.outline },
        soft: { root: fieldTrigger.variant.soft },
        ghost: { root: fieldTrigger.variant.ghost },
      } satisfies Record<ColorFieldVariant, object>,
      size: {
        standard: {
          root: 'h-(--ids-size-control-standard) rounded-standard text-body-b3-regular',
          trigger: 'gap-2 px-3',
          swatch: 'size-5',
          clear: 'me-1 size-7 [&_svg]:size-(--ids-size-icon-standard)',
        },
        tiny: {
          root: 'h-(--ids-size-control-tiny) rounded-standard text-caption-c1-regular',
          trigger: 'gap-1.5 px-2.5',
          swatch: 'size-4',
          clear: 'me-1 size-6 [&_svg]:size-(--ids-size-icon-tiny)',
        },
      } satisfies Record<IdsSize, object>,
    },
    defaultVariants: { variant: 'outline', size: 'standard' },
  });
}
