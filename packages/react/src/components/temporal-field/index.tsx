import {
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';

import { invariant, mergeProps, mergeRefs } from '../../utils';
import { useFieldSize } from '../field/context';
import { FieldPopup, fieldTriggerStyle, flattenParts, part } from '../field-popup';
import { validateTime } from '../time-picker/time';

import type { IdsSize } from '../../tokens/types';
export type TemporalFieldProps = Omit<
  ComponentProps<'button'>,
  'value' | 'defaultValue' | 'onChange'
> & {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (value: Date | null) => void;
  variant?: 'outline' | 'filled' | 'unstyled';
  size?: IdsSize;
  invalid?: boolean;
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  mobileVariant?: 'popover' | 'drawer';
};
type PickerState = { value: Date | null; change: (value: Date | null) => void };
type InternalProps = TemporalFieldProps & {
  label: string;
  display: (value: Date) => string;
  serialize: (value: Date) => string;
  picker: (state: PickerState) => ReactNode;
  preferredWidth?: number;
  initialFocusSelector: string;
};
export type TriggerProps = ComponentProps<'button'> & { asChild?: boolean };
export type ValueProps = ComponentProps<'span'> & { asChild?: boolean };
export type ContentProps = ComponentProps<'div'> & { asChild?: boolean };
type ContextValue = {
  trigger: ComponentProps<'button'>;
  text: string;
  hasValue: boolean;
  blocked: boolean;
  clear: () => void;
  content: ReactNode;
  label: string;
};
const Context = createContext<ContextValue | null>(null);
function useTemporal() {
  const c = useContext(Context);
  invariant(c, 'TimeField/DateTimeField parts must be inside their field.');
  return c;
}
export function TemporalValue({ asChild, children, ...props }: ValueProps) {
  const c = useTemporal();
  return part(
    'span',
    asChild,
    children ?? c.text,
    mergeProps({ className: 'min-w-0 flex-1 truncate' }, props),
  );
}
export function TemporalTrigger({ asChild, children, ...props }: TriggerProps) {
  const c = useTemporal();
  invariant(
    !flattenParts(children).some((n) => isValidElement(n) && n.type === TemporalClear),
    'Clear must be a sibling of Trigger.',
  );
  return part(
    'button',
    asChild,
    children ?? (
      <>
        <span aria-hidden="true">◷</span>
        <TemporalValue />
        <span aria-hidden="true">▾</span>
      </>
    ),
    mergeProps(props, { ...c.trigger }),
  );
}
export function TemporalClear({ asChild, children = '×', ...props }: TriggerProps) {
  const c = useTemporal();
  return c.hasValue
    ? part(
        'button',
        asChild,
        children,
        mergeProps(props, {
          type: 'button',
          'aria-label': props['aria-label'] ?? `${c.label} 지우기`,
          disabled: c.blocked,
          className:
            'mr-1 flex size-8 shrink-0 items-center justify-center rounded-lg focus-visible:outline-2 disabled:opacity-40',
          onClick: c.clear,
        }),
      )
    : null;
}
export function TemporalContent({ asChild, children, ...props }: ContentProps) {
  const c = useTemporal();
  return part('div', asChild, children ?? c.content, props);
}
export function TemporalField({
  value,
  defaultValue = null,
  onChange,
  variant = 'outline',
  size,
  invalid,
  required,
  readOnly,
  placeholder,
  mobileVariant,
  children,
  ref: forwardedRef,
  name,
  form,
  className,
  style,
  disabled,
  label,
  display,
  serialize,
  picker,
  preferredWidth,
  initialFocusSelector,
  ...native
}: InternalProps) {
  validateTime(value);
  validateTime(defaultValue);
  const [stored, setStored] = useState(defaultValue),
    [open, setOpen] = useState(false);
  const current = value === undefined ? stored : value,
    trigger = useRef<HTMLButtonElement>(null),
    id = `ids-temporal-${useId()}`;
  const blocked = !!disabled || !!readOnly,
    resolvedSize = useFieldSize(size) ?? 'standard';
  const close = useCallback((restore: boolean) => {
    setOpen(false);
    if (restore) trigger.current?.focus();
  }, []);
  const change = (next: Date | null) => {
    if (blocked) return;
    if (value === undefined) setStored(next);
    onChange?.(next);
  };
  useLayoutEffect(() => {
    const owner = trigger.current?.form;
    if (!owner) return;
    let alive = true;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (alive && !event.defaultPrevented) {
          if (value === undefined) setStored(defaultValue);
          close(false);
        }
      });
    owner.addEventListener('reset', reset);
    return () => {
      alive = false;
      owner.removeEventListener('reset', reset);
    };
  }, [value, defaultValue, form, close]);
  const triggerProps: ComponentProps<'button'> = {
    ...native,
    disabled,
    form,
    id: native.id ?? `${id}-trigger`,
    type: 'button',
    role: 'combobox',
    'aria-haspopup': 'dialog',
    'aria-expanded': open && !blocked,
    'aria-controls': open && !blocked ? id : undefined,
    'aria-invalid': native['aria-invalid'] ?? invalid,
    'aria-required': native['aria-required'] ?? required,
    'aria-readonly': readOnly,
    // mergeRefs creates a callback without reading refs during render.
    // eslint-disable-next-line react-hooks/refs
    ref: mergeRefs(trigger, forwardedRef),
    className: fieldTriggerStyle({ variant: 'unstyled', size: resolvedSize, className: 'flex-1' }),
    onClick: (e) => {
      native.onClick?.(e);
      if (!e.defaultPrevented && !blocked) setOpen((previous) => !previous);
    },
    onKeyDown: (e) => {
      native.onKeyDown?.(e);
      if (!e.defaultPrevented && !blocked && e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
      }
    },
    onBlur: (e) => {
      if (
        !e.relatedTarget ||
        !(e.relatedTarget as Element).closest?.(`[data-temporal-owner="${id}"]`)
      )
        native.onBlur?.(e);
    },
  };
  const parts = flattenParts(children),
    triggers = parts.filter((n) => isValidElement(n) && n.type === TemporalTrigger),
    contents = parts.filter((n) => isValidElement(n) && n.type === TemporalContent),
    clears = parts.filter((n) => isValidElement(n) && n.type === TemporalClear);
  invariant(
    triggers.length <= 1 && contents.length <= 1 && clears.length <= 1,
    'TimeField/DateTimeField accepts at most one Trigger, Content and Clear.',
  );
  return (
    <Context.Provider
      value={{
        trigger: triggerProps,
        text: current ? display(current) : (placeholder ?? `${label} 선택`),
        hasValue: !!current,
        blocked,
        clear: () => {
          change(null);
          close(true);
        },
        content: open && !blocked ? picker({ value: current, change }) : null,
        label,
      }}
    >
      <div
        data-temporal-field=""
        aria-invalid={triggerProps['aria-invalid']}
        className={fieldTriggerStyle({
          variant,
          size: resolvedSize,
          className: `gap-0 px-0 ${disabled ? 'opacity-40' : ''} ${className ?? ''}`,
        })}
        style={style}
      >
        {triggers.length ? triggers : <TemporalTrigger />}
        {clears.length ? clears : <TemporalClear />}
      </div>
      {open && !blocked && (
        <FieldPopup
          anchor={trigger}
          onClose={close}
          mobileVariant={mobileVariant}
          preferredWidth={preferredWidth}
          initialFocusSelector={initialFocusSelector}
          role="dialog"
          id={id}
          aria-label={`${label} 선택`}
          data-temporal-owner={id}
          onBlur={(e) => {
            if (
              !e.currentTarget.contains(e.relatedTarget as Node) &&
              e.relatedTarget !== trigger.current
            )
              native.onBlur?.(e as unknown as React.FocusEvent<HTMLButtonElement>);
          }}
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-sm font-medium">{label} 선택</span>
            <button
              type="button"
              data-popup-autofocus=""
              aria-label={`${label} 선택 닫기`}
              onClick={() => close(true)}
              className="size-7 rounded focus-visible:outline-2"
            >
              ×
            </button>
          </div>
          {contents.length ? contents : <TemporalContent />}
        </FieldPopup>
      )}
      {name && (
        <input
          type="hidden"
          name={name}
          form={form}
          value={current ? serialize(current) : ''}
          disabled={disabled}
        />
      )}
    </Context.Provider>
  );
}
