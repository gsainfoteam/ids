import {
  createContext,
  isValidElement,
  use,
  type ComponentProps,
  type ComponentType,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

import {
  useTemporalField,
  type TemporalChange,
  type TemporalFieldApi,
  type TemporalFieldState,
} from './use-temporal-field';
import { IconButton } from '../../components/action/icon-button';
import { useFieldSize } from '../../components/form/field/context';
import { invariant, mergeProps, mergeRefs, tv } from '../../utils';
import { FieldPopup, FieldPopupHeader, flattenParts, part } from '../field-popup';
import { fieldAction, fieldSurface, type FieldSurfaceVariant } from '../field-surface';
import { FormValue } from '../form-value';

import type { IdsSize } from '../../tokens/types';

export type { TemporalFieldState, TemporalChange } from './use-temporal-field';

export type TemporalFieldProps<V> = Omit<
  ComponentProps<'button'>,
  'value' | 'defaultValue' | 'onChange' | 'className' | 'style' | 'disabled' | 'children'
> & {
  value?: V;
  defaultValue?: V;
  onValueChange?: (value: V) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: FieldSurfaceVariant;
  size?: IdsSize;
  invalid?: boolean;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  mobileVariant?: 'popover' | 'drawer';
  // Only read by an Input part, where it defaults to off.
  autoComplete?: ComponentProps<'input'>['autoComplete'];
  className?: string | ((state: TemporalFieldState<V>) => string | undefined);
  style?: CSSProperties | ((state: TemporalFieldState<V>) => CSSProperties | undefined);
  children?: ReactNode;
};

export type TemporalMessages = {
  placeholder: string;
  title: string;
  clear: string;
  close: string;
  open?: string;
};

export type TemporalPicker<V> = (api: {
  value: V;
  change: TemporalChange<V>;
  close: (restoreFocus: boolean) => void;
  size: IdsSize;
}) => ReactNode;

export type TemporalConfig<V> = {
  kind: 'date' | 'time' | 'date-time';
  empty: V;
  isEmpty: (value: V) => boolean;
  isSame: (a: V, b: V) => boolean;
  display: (value: V) => string;
  serialize: (value: V) => string | string[];
  messages: TemporalMessages;
  icon: ComponentType<ComponentProps<'svg'>>;
  picker: TemporalPicker<V>;
  preferredWidth?: number;
  initialFocusSelector: string;
  // Present on fields that take typed text through an Input part.
  parse?: (text: string) => V | undefined;
  inputHint?: string;
};

export type TriggerProps = ComponentProps<'button'> & { asChild?: boolean };
export type ValueProps = ComponentProps<'span'> & { asChild?: boolean };
export type ClearProps = ComponentProps<'button'> & { asChild?: boolean };
export type ContentProps = ComponentProps<'div'> & { asChild?: boolean };
export type InputProps = Omit<ComponentProps<'input'>, 'value' | 'defaultValue' | 'type'> & {
  asChild?: boolean;
};

type ContextValue = {
  state: TemporalFieldState<unknown>;
  size: IdsSize;
  hasClear: boolean;
  hasInput: boolean;
  input: Record<string, unknown> | undefined;
  blocked: boolean;
  clear: () => void;
  onBlur: TemporalFieldApi<unknown>['onBlur'];
  trigger: Record<string, unknown>;
  text: string;
  icon: ComponentType<ComponentProps<'svg'>>;
  messages: TemporalMessages;
  content: () => ReactNode;
  styles: ReturnType<typeof temporalFieldStyle>;
};

const TemporalContext = createContext<ContextValue | null>(null);

function useTemporal(part: string) {
  const context = use(TemporalContext);
  invariant(context, `${part} must be inside its field.`);
  return context;
}

export const temporalFieldStyle = tv({
  slots: {
    // The trigger carries data-field-input, so focus-ring rings the whole shell for it while
    // Clear keeps a ring of its own.
    root: ['relative inline-flex w-full min-w-0 items-center', fieldSurface.base],
    trigger: [
      'flex h-full min-w-0 flex-1 cursor-pointer touch-manipulation items-center self-stretch',
      'bg-transparent text-start outline-none disabled:cursor-not-allowed',
    ],
    icon: 'shrink-0 text-(--ids-color-on-muted)',
    value: 'min-w-0 flex-1 truncate data-placeholder:text-(--ids-color-on-muted)',
    // Clear, and the calendar button that stands in for the trigger beside an Input part, are
    // ghost IconButtons. The trigger runs to both edges of the box so all of it opens the popup,
    // which leaves no padding for fieldAction to pull an end button into; each keeps 4px from the
    // border instead, the inset it has above and below.
    clear: [fieldAction.base, 'me-1'],
    // With an Input part the text box takes the focus and the label.
    input: [
      'h-full min-w-0 flex-1 self-stretch bg-transparent outline-none',
      'placeholder:text-(--ids-color-on-muted) disabled:cursor-not-allowed',
    ],
    button: [fieldAction.base, 'me-1'],
    content: 'flex justify-center',
    // DateTimeField's popup: the calendar beside the clock, stacked on a phone.
    panel: 'flex flex-col gap-4 sm:flex-row',
    panelTime: 'flex min-w-0 flex-col gap-2 sm:w-52',
    panelHint: 'text-caption-c1-regular text-(--ids-color-on-muted)',
  },
  variants: {
    variant: {
      outline: { root: fieldSurface.variant.outline },
      soft: { root: fieldSurface.variant.soft },
      ghost: { root: fieldSurface.variant.ghost },
    } satisfies Record<FieldSurfaceVariant, object>,
    size: {
      standard: {
        root: 'h-(--ids-size-control-standard) rounded-standard text-body-b3-regular',
        trigger: 'gap-2 px-3',
        icon: 'size-(--ids-size-icon-standard)',
        clear: [fieldAction.size.standard, 'first:ms-1 last:me-1'],
        input: 'ps-3',
        button: [fieldAction.size.standard, 'first:ms-1 last:me-1'],
      },
      tiny: {
        root: 'h-(--ids-size-control-tiny) rounded-standard text-caption-c1-regular',
        trigger: 'gap-1.5 px-2.5',
        icon: 'size-(--ids-size-icon-tiny)',
        clear: [fieldAction.size.tiny, 'first:ms-1 last:me-1'],
        input: 'ps-2.5',
        button: [fieldAction.size.tiny, 'first:ms-1 last:me-1'],
      },
    } satisfies Record<IdsSize, object>,
    disabled: {
      true: { root: 'cursor-not-allowed opacity-50' },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'standard',
  },
});

export function TemporalValue({ asChild, children, ...props }: ValueProps) {
  const c = useTemporal('Value');
  const empty = c.state.empty;
  return part(
    'span',
    asChild,
    children ?? c.text,
    mergeProps({ className: c.styles.value(), 'data-placeholder': empty ? '' : undefined }, props),
  );
}

export function TemporalTrigger({ asChild, children, className, ...props }: TriggerProps) {
  const c = useTemporal('Trigger');
  invariant(
    !flattenParts(children).some((n) => isValidElement(n) && n.type === TemporalClear),
    'Clear must be a sibling of Trigger.',
  );
  if (c.hasInput) {
    const button = {
      ...mergeProps(props, c.trigger),
      // The default names the button; a label given to the part names it instead.
      'aria-label': props['aria-label'] ?? (c.trigger['aria-label'] as string),
      variant: 'ghost' as const,
      size: c.size,
      className: c.styles.button({ className }),
    };
    return asChild ? (
      <IconButton {...button} asChild>
        {children as ReactElement}
      </IconButton>
    ) : (
      <IconButton {...button} icon={(children as ReactElement) ?? <c.icon aria-hidden="true" />} />
    );
  }
  // The field's combobox fills the field surface and carries its label, so it is not a Button.
  return part(
    'button',
    asChild,
    children ?? (
      <>
        <c.icon aria-hidden="true" className={c.styles.icon()} />
        <TemporalValue />
        {/* Clear takes the chevron's place once there is a value, so the end holds one icon. */}
        {(c.state.empty || !c.hasClear) && (
          <ChevronDownIcon aria-hidden="true" className={c.styles.icon()} />
        )}
      </>
    ),
    mergeProps({ ...props, className }, c.trigger),
  );
}

export function TemporalInput({ asChild, ...props }: InputProps) {
  const c = useTemporal('Input');
  invariant(c.input, 'Input must be a direct part of its field.');
  // A bare input inside this field's surface; TextField would draw a second box around it.
  return part('input', asChild, undefined, mergeProps(props, c.input));
}

// Unlike a text field's Clear this one stays in the tab order, since a date field without an
// Input part has no text to delete and its calendar has no key that empties it.
export function TemporalClear({ asChild, children, className, ...props }: ClearProps) {
  const c = useTemporal('Clear');
  if (c.state.empty) return null;
  const button = {
    ...mergeProps(props, {
      type: 'button',
      'aria-label': props['aria-label'] ?? c.messages.clear,
      'data-temporal-clear': '',
      onClick: c.clear,
      onBlur: c.onBlur,
    }),
    variant: 'ghost' as const,
    size: c.size,
    disabled: c.blocked,
    className: c.styles.clear({ className }),
  };
  return asChild ? (
    <IconButton {...button} asChild>
      {children as ReactElement}
    </IconButton>
  ) : (
    <IconButton {...button} icon={(children as ReactElement) ?? <XMarkIcon aria-hidden="true" />} />
  );
}

export function TemporalContent({ asChild, children, ...props }: ContentProps) {
  const c = useTemporal('Content');
  return part(
    'div',
    asChild,
    children ?? c.content(),
    mergeProps({ className: c.styles.content() }, props),
  );
}

export function TemporalField<V>({
  config,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  variant = 'outline',
  size,
  invalid,
  required = false,
  readOnly = false,
  disabled = false,
  placeholder,
  mobileVariant,
  name,
  form,
  className,
  style,
  children,
  ref,
  onBlur,
  ...native
}: TemporalFieldProps<V> & { config: TemporalConfig<V> }) {
  const ariaInvalid = native['aria-invalid'];
  const {
    state,
    input,
    blocked,
    popupId,
    triggerRef,
    rootRef,
    change,
    clear,
    close,
    toggle,
    show,
    onBlur: handleBlur,
  } = useTemporalField<V>({
    value,
    defaultValue: defaultValue ?? config.empty,
    onValueChange,
    empty: config.empty,
    isEmpty: config.isEmpty,
    isSame: config.isSame,
    open,
    defaultOpen,
    onOpenChange,
    disabled,
    readOnly,
    invalid: ariaInvalid === undefined ? invalid : ariaInvalid === true || ariaInvalid === 'true',
    required,
    display: config.display,
    parse: config.parse,
    onBlur,
  });
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const styles = temporalFieldStyle({ variant, size: resolvedSize, disabled });

  const parts = flattenParts(children);
  const contents = parts.filter((n) => isValidElement(n) && n.type === TemporalContent);
  const shell = parts.filter((n) => !(isValidElement(n) && n.type === TemporalContent));
  const count = (type: unknown) => parts.filter((n) => isValidElement(n) && n.type === type).length;
  invariant(
    count(TemporalTrigger) <= 1 &&
      contents.length <= 1 &&
      count(TemporalClear) <= 1 &&
      count(TemporalInput) <= 1,
    'A date or time field accepts at most one Trigger, Input, Content and Clear.',
  );
  // With no parts of its own the field draws Trigger then Clear. Once parts are given they are
  // drawn as given, and only a missing Trigger is filled in, since the field cannot open without it.
  const composed = shell.length > 0;
  const hasTrigger = count(TemporalTrigger) > 0;
  const hasInput = count(TemporalInput) > 0;
  invariant(
    !hasInput || !!config.parse,
    'Input is only available on a field that reads typed text.',
  );

  // The control that carries the field's id, label, description and combobox role: the trigger,
  // or the text box when there is one.
  const control = {
    ...native,
    role: 'combobox',
    id: native.id ?? `${popupId}-trigger`,
    disabled,
    form,
    'data-field-input': '',
    'aria-haspopup': 'dialog',
    'aria-expanded': state.open,
    'aria-controls': state.open ? popupId : undefined,
    'aria-invalid': state.invalid || undefined,
    'aria-required': native['aria-required'] ?? (required || undefined),
    'aria-readonly': readOnly || undefined,
    // mergeRefs only builds a callback; no ref is read while rendering.
    // eslint-disable-next-line react-hooks/refs
    ref: mergeRefs(triggerRef, ref),
  };
  const trigger = hasInput
    ? {
        type: 'button',
        // The text box opens the popup with Down Arrow, so the button stays out of the tab
        // order, as in the APG date picker combobox.
        tabIndex: -1,
        'aria-label': config.messages.open,
        'aria-haspopup': 'dialog',
        'aria-expanded': state.open,
        'aria-controls': state.open ? popupId : undefined,
        disabled: disabled || readOnly,
        onClick: toggle,
        onBlur: handleBlur,
      }
    : {
        ...control,
        type: 'button',
        className: styles.trigger(),
        onClick: (event: MouseEvent<HTMLButtonElement>) => {
          native.onClick?.(event);
          if (!event.defaultPrevented) toggle();
        },
        // APG combobox: Down Arrow opens; Enter and Space already click the button.
        onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
          native.onKeyDown?.(event);
          if (event.defaultPrevented || event.key !== 'ArrowDown') return;
          event.preventDefault();
          show();
        },
        onBlur: handleBlur,
      };
  const textBox = hasInput
    ? {
        ...control,
        type: 'text',
        readOnly,
        autoComplete: native.autoComplete ?? 'off',
        spellCheck: false,
        placeholder: placeholder ?? config.inputHint,
        className: styles.input(),
        value: input.value,
        onChange: input.onChange,
        onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
          (native.onKeyDown as ((event: KeyboardEvent<HTMLInputElement>) => void) | undefined)?.(
            event,
          );
          input.onKeyDown(event);
        },
        onBlur: input.onBlur,
      }
    : undefined;

  return (
    <TemporalContext.Provider
      value={{
        state,
        size: resolvedSize,
        hasClear: !composed || count(TemporalClear) > 0,
        hasInput,
        input: textBox,
        blocked,
        clear,
        onBlur: handleBlur,
        trigger,
        text: state.empty
          ? (placeholder ?? config.messages.placeholder)
          : config.display(state.value),
        icon: config.icon,
        messages: config.messages,
        content: () =>
          config.picker({
            value: state.value,
            change,
            close,
            size: resolvedSize,
          }),
        styles,
      }}
    >
      <div
        ref={rootRef}
        {...{ [`data-${config.kind}-field`]: '' }}
        data-temporal-field={config.kind}
        data-size={resolvedSize}
        data-variant={variant}
        data-open={state.open ? '' : undefined}
        data-empty={state.empty ? '' : undefined}
        data-invalid={state.invalid ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        data-readonly={readOnly ? '' : undefined}
        data-required={required ? '' : undefined}
        className={styles.root({
          className: typeof className === 'function' ? className(state) : className,
        })}
        style={typeof style === 'function' ? style(state) : style}
      >
        {composed ? (
          <>
            {!hasTrigger && !hasInput && <TemporalTrigger />}
            {shell}
            {!hasTrigger && hasInput && <TemporalTrigger />}
          </>
        ) : (
          <>
            <TemporalTrigger />
            <TemporalClear />
          </>
        )}
        <FormValue
          name={name}
          form={form}
          value={state.empty ? null : config.serialize(state.value)}
          required={required}
          disabled={disabled}
          anchor={triggerRef}
        />
      </div>
      {state.open && (
        <FieldPopup
          anchor={rootRef}
          onClose={close}
          mobileVariant={mobileVariant}
          preferredWidth={config.preferredWidth}
          initialFocusSelector={config.initialFocusSelector}
          role="dialog"
          id={popupId}
          aria-label={config.messages.title}
          data-temporal-owner={popupId}
          className="concentric-p-3"
          onBlur={handleBlur as (event: FocusEvent<HTMLDivElement>) => void}
        >
          <FieldPopupHeader
            title={config.messages.title}
            closeLabel={config.messages.close}
            autoFocus
            onClose={() => close(true)}
          />
          {contents.length ? contents : <TemporalContent />}
        </FieldPopup>
      )}
    </TemporalContext.Provider>
  );
}
