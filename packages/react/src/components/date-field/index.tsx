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
} from 'react';

import { invariant, mergeProps, mergeRefs } from '../../utils';
import { Calendar, type CalendarOptions, type CalendarProps } from '../calendar';
import {
  datesOf,
  dayKey,
  validateValue,
  type CalendarValue,
  type DateRange,
  type DateSelection,
} from '../calendar/date';
import { useFieldSize } from '../field/context';
import { FieldPopup, fieldTriggerStyle, flattenParts, part } from '../field-popup';
import { dateFormatter, type DateFieldFormat } from './format';

export type DateFieldProps = Omit<
  ComponentProps<'button'>,
  'value' | 'defaultValue' | 'onChange' | 'disabled'
> &
  CalendarOptions &
  DateSelection & {
    format?: DateFieldFormat;
    variant?: 'outline' | 'filled' | 'unstyled';
    invalid?: boolean;
    required?: boolean;
    placeholder?: string;
    mobileVariant?: 'popover' | 'drawer';
  };
type ContextValue = {
  display: string;
  hasValue: boolean;
  blocked: boolean;
  trigger: ComponentProps<'button'>;
  calendar: CalendarProps;
  clear: () => void;
};
const Context = createContext<ContextValue | null>(null);
function useDateField() {
  const c = useContext(Context);
  invariant(c, 'DateField parts must be inside DateField.');
  return c;
}
function DateValue({ asChild, children, ...props }: DateField.ValueProps) {
  const c = useDateField();
  return part(
    'span',
    asChild,
    children ?? c.display,
    mergeProps({ className: 'min-w-0 flex-1 truncate' }, props),
  );
}
function DateTrigger({ asChild, children, ...props }: DateField.TriggerProps) {
  const c = useDateField();
  invariant(
    !flattenParts(children).some((n) => isValidElement(n) && n.type === DateClear),
    'DateField.Clear must be a sibling of Trigger.',
  );
  return part(
    'button',
    asChild,
    children ?? (
      <>
        <span aria-hidden="true">▦</span>
        <DateValue />
        <span aria-hidden="true">▾</span>
      </>
    ),
    mergeProps(props, { ...c.trigger }),
  );
}
function DateClear({ asChild, children = '×', ...props }: DateField.ClearProps) {
  const c = useDateField();
  if (!c.hasValue) return null;
  return part(
    'button',
    asChild,
    children,
    mergeProps(props, {
      type: 'button',
      'aria-label': props['aria-label'] ?? '날짜 지우기',
      disabled: c.blocked,
      className:
        'mr-1 flex size-8 shrink-0 items-center justify-center rounded-lg focus-visible:outline-2 disabled:opacity-40',
      onClick: c.clear,
    }),
  );
}
function DateContent({ asChild, children, ...props }: DateField.ContentProps) {
  const c = useDateField();
  return part('div', asChild, children ?? <Calendar {...c.calendar} />, props);
}
export function DateField(props: DateFieldProps) {
  const {
    selectionMode = 'single',
    value,
    defaultValue,
    onChange: _onChange,
    format,
    variant = 'outline',
    size,
    invalid,
    required,
    placeholder = '날짜 선택',
    mobileVariant,
    children,
    ref: forwardedRef,
    name,
    form,
    className,
    style,
    min,
    max,
    disabled,
    readOnly,
    monthsToShow = 1,
    locale = 'en-US',
    weekStartsOn,
    month,
    defaultMonth,
    onMonthChange,
    today,
    ...native
  } = props;
  const [stored, setStored] = useState<CalendarValue>(
    defaultValue ?? (selectionMode === 'multiple' ? [] : null),
  );
  const current = value === undefined ? stored : value;
  validateValue(current, selectionMode);
  const formatDate = dateFormatter(format, locale),
    dates = datesOf(current),
    hasValue = dates.length > 0;
  const range = selectionMode === 'range' ? (current as DateRange | null) : null;
  const display = !hasValue
    ? placeholder
    : selectionMode === 'range'
      ? `${formatDate(range!.start!)} – ${range!.end ? formatDate(range!.end) : '…'}`
      : selectionMode === 'multiple'
        ? `${dates.slice(0, 2).map(formatDate).join(', ')}${dates.length > 2 ? `, +${dates.length - 2}` : ''}`
        : formatDate(dates[0]);
  const model =
    selectionMode === 'multiple'
      ? dates.map(dayKey)
      : [
          selectionMode === 'range'
            ? range?.start
              ? `${dayKey(range.start)}/${range.end ? dayKey(range.end) : ''}`
              : ''
            : dates[0]
              ? dayKey(dates[0])
              : '',
        ];
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const id = `ids-date-${useId()}`;
  const blocked = disabled === true || !!readOnly;
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const close = useCallback((restore: boolean) => {
    setOpen(false);
    if (restore) trigger.current?.focus({ preventScroll: true });
  }, []);
  const change = (next: CalendarValue) => {
    if (blocked) return;
    if (value === undefined) setStored(next);
    if (props.selectionMode === 'multiple') props.onChange?.(next as Date[]);
    else if (props.selectionMode === 'range') props.onChange?.(next as DateRange | null);
    else props.onChange?.(next as Date | null);
  };
  useLayoutEffect(() => {
    const owner = trigger.current?.form;
    if (!owner) return;
    let alive = true;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (alive && !event.defaultPrevented) {
          if (value === undefined)
            setStored(defaultValue ?? (selectionMode === 'multiple' ? [] : null));
          close(false);
        }
      });
    owner.addEventListener('reset', reset);
    return () => {
      alive = false;
      owner.removeEventListener('reset', reset);
    };
  }, [value, defaultValue, selectionMode, form, close]);
  const triggerProps: ComponentProps<'button'> = {
    ...native,
    disabled: disabled === true,
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
    // mergeRefs only composes callbacks, without reading current during render.
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
      if (!e.relatedTarget || !(e.relatedTarget as Element).closest?.(`[data-date-owner="${id}"]`))
        native.onBlur?.(e);
    },
  };
  const options = {
    min,
    max,
    disabled,
    readOnly,
    monthsToShow,
    locale,
    weekStartsOn,
    month,
    defaultMonth,
    onMonthChange,
    today,
    size: resolvedSize,
  };
  const onSelection = (next: CalendarValue) => {
    change(next);
    if (selectionMode === 'single') close(true);
  };
  const calendar: CalendarProps =
    selectionMode === 'range'
      ? {
          ...options,
          selectionMode: 'range',
          value: current as DateRange | null,
          onChange: onSelection,
        }
      : selectionMode === 'multiple'
        ? { ...options, selectionMode: 'multiple', value: current as Date[], onChange: onSelection }
        : { ...options, value: current as Date | null, onChange: onSelection };
  const parts = flattenParts(children),
    triggers = parts.filter((n) => isValidElement(n) && n.type === DateTrigger),
    contents = parts.filter((n) => isValidElement(n) && n.type === DateContent),
    clears = parts.filter((n) => isValidElement(n) && n.type === DateClear);
  invariant(
    triggers.length <= 1 && contents.length <= 1 && clears.length <= 1,
    'DateField accepts at most one Trigger, Content and Clear.',
  );
  return (
    <Context.Provider
      value={{
        display,
        hasValue,
        blocked,
        trigger: triggerProps,
        calendar,
        clear: () => {
          change(selectionMode === 'multiple' ? [] : null);
          close(true);
        },
      }}
    >
      <div
        ref={surface}
        data-date-field=""
        aria-invalid={triggerProps['aria-invalid']}
        className={fieldTriggerStyle({
          variant,
          size: resolvedSize,
          className: `gap-0 px-0 ${disabled === true ? 'opacity-40' : ''} ${className ?? ''}`,
        })}
        style={style}
      >
        {triggers.length ? triggers : <DateTrigger />}
        {clears.length ? clears : <DateClear />}
      </div>
      {open && !blocked && (
        <FieldPopup
          anchor={surface}
          onClose={close}
          mobileVariant={mobileVariant}
          preferredWidth={(resolvedSize === 'tiny' ? 240 : 288) * Math.min(monthsToShow, 2)}
          initialFocusSelector={'[data-calendar-day][tabindex="0"]'}
          role="dialog"
          id={id}
          aria-label="날짜 선택"
          data-date-owner={id}
          onBlur={(e) => {
            if (
              !e.currentTarget.contains(e.relatedTarget as Node) &&
              e.relatedTarget !== trigger.current
            )
              native.onBlur?.(e as unknown as React.FocusEvent<HTMLButtonElement>);
          }}
        >
          <div className="mb-1 flex items-center justify-between px-1">
            <span className="text-sm font-medium">
              {selectionMode === 'range'
                ? '기간 선택'
                : selectionMode === 'multiple'
                  ? '날짜 다중 선택'
                  : '날짜 선택'}
            </span>
            <button
              type="button"
              data-popup-autofocus=""
              aria-label="날짜 선택 닫기"
              onClick={() => close(true)}
              className="size-7 rounded focus-visible:outline-2"
            >
              ×
            </button>
          </div>
          {contents.length ? contents : <DateContent />}
        </FieldPopup>
      )}
      {name &&
        model.map((item, index) => (
          <input
            key={index}
            type="hidden"
            name={name}
            form={form}
            value={item}
            disabled={disabled === true}
          />
        ))}
    </Context.Provider>
  );
}
export namespace DateField {
  export type Props = DateFieldProps;
  export type TriggerProps = ComponentProps<'button'> & { asChild?: boolean };
  export type ClearProps = TriggerProps;
  export type ValueProps = ComponentProps<'span'> & { asChild?: boolean };
  export type ContentProps = ComponentProps<'div'> & { asChild?: boolean };
  export const Trigger = DateTrigger,
    Value = DateValue,
    Content = DateContent,
    Clear = DateClear;
  export const Style = fieldTriggerStyle;
}
export type { DateFieldFormat } from './format';
