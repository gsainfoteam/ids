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

import { ClockIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

import { validateTime } from '../../components/data/time-picker/time';
import { useFieldSize } from '../../components/form/field/context';
import { invariant, mergeProps, mergeRefs, tv } from '../../utils';
import { FieldPopup, flattenParts, part } from '../field-popup';

import type { IdsSize } from '../../tokens/types';

export const temporalFieldStyle = tv({
  slots: {
    root: [
      'inline-flex w-full min-w-0 items-center bg-transparent text-(--ids-color-on-surface)',
      'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast)',
      'motion-reduce:transition-none',
      // The shell wraps a native combobox button, which focus-ring's :has() triggers do not
      // match. Scoping to the combobox keeps the shell quiet while Clear shows its own ring.
      'has-[[role=combobox]:focus-visible]:ring-[3px]',
      'has-[[role=combobox]:focus-visible]:ring-(--ids-color-primary)/40',
      'aria-invalid:inset-ring-1 aria-invalid:inset-ring-(--ids-color-danger)',
    ],
    trigger: [
      'flex h-full min-w-0 flex-1 cursor-pointer touch-manipulation items-center self-stretch',
      'bg-transparent text-left outline-none',
      'disabled:cursor-not-allowed',
    ],
    icon: 'shrink-0 text-(--ids-color-on-muted)',
    value: 'min-w-0 flex-1 truncate',
    clear: [
      'me-1 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-standard',
      'text-(--ids-color-on-muted) enabled:hover:bg-(--ids-color-primary)/10',
      'enabled:hover:text-(--ids-color-on-surface)',
      'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast)',
      'motion-reduce:transition-none',
      'focus-ring',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ],
    popupHeader: 'mb-2 flex items-center justify-between px-1',
    popupTitle: 'text-body-b3-medium',
    popupClose: [
      'inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-standard',
      'text-(--ids-color-on-muted) hover:bg-(--ids-color-primary)/10',
      'hover:text-(--ids-color-on-surface)',
      'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast)',
      'motion-reduce:transition-none',
      'focus-ring',
      '[&_svg]:size-(--ids-size-icon-standard)',
    ],
  },
  variants: {
    variant: {
      outline: { root: 'shadow-xs inset-ring-1 inset-ring-(--ids-color-outline)' },
      filled: { root: 'bg-(--ids-color-primary)/10 inset-ring-1 inset-ring-transparent' },
      unstyled: {},
    },
    size: {
      standard: {
        root: 'h-(--ids-size-control-standard) rounded-standard text-body-b3-regular',
        trigger: 'gap-2 px-3',
        icon: 'size-(--ids-size-icon-standard)',
        clear: 'size-7 [&_svg]:size-(--ids-size-icon-standard)',
      },
      tiny: {
        root: 'h-(--ids-size-control-tiny) rounded-standard text-caption-c1-regular',
        trigger: 'gap-1.5 px-2',
        icon: 'size-(--ids-size-icon-tiny)',
        clear: 'size-6 [&_svg]:size-(--ids-size-icon-tiny)',
      },
    } satisfies Record<IdsSize, object>,
    disabled: {
      true: { root: 'cursor-not-allowed opacity-50' },
    },
    placeholder: {
      true: { value: 'text-(--ids-color-on-muted)' },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'standard',
  },
});

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
  styles: ReturnType<typeof temporalFieldStyle>;
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
    mergeProps({ className: c.styles.value() }, props),
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
        <ClockIcon aria-hidden="true" className={c.styles.icon()} />
        <TemporalValue />
        <ChevronDownIcon aria-hidden="true" className={c.styles.icon()} />
      </>
    ),
    mergeProps(props, { ...c.trigger }),
  );
}
export function TemporalClear({
  asChild,
  children = <XMarkIcon aria-hidden="true" />,
  ...props
}: TriggerProps) {
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
          className: c.styles.clear(),
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
    surface = useRef<HTMLDivElement>(null),
    id = `ids-temporal-${useId()}`;
  const blocked = !!disabled || !!readOnly,
    resolvedSize = useFieldSize(size) ?? 'standard';
  const styles = temporalFieldStyle({
    variant,
    size: resolvedSize,
    disabled: !!disabled,
    placeholder: !current,
  });
  const close = useCallback((restore: boolean) => {
    setOpen(false);
    if (restore) trigger.current?.focus({ preventScroll: true });
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
    className: styles.trigger(),
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
        styles,
      }}
    >
      <div
        ref={surface}
        data-temporal-field=""
        aria-invalid={triggerProps['aria-invalid']}
        className={styles.root({ className })}
        style={style}
      >
        {triggers.length ? triggers : <TemporalTrigger />}
        {clears.length ? clears : <TemporalClear />}
      </div>
      {open && !blocked && (
        <FieldPopup
          anchor={surface}
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
          <div className={styles.popupHeader()}>
            <span className={styles.popupTitle()}>{label} 선택</span>
            <button
              type="button"
              data-popup-autofocus=""
              aria-label={`${label} 선택 닫기`}
              onClick={() => close(true)}
              className={styles.popupClose()}
            >
              <XMarkIcon aria-hidden="true" />
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
