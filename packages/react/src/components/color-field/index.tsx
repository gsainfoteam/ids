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

import { XMarkIcon } from '@heroicons/react/24/outline';

import { invariant, mergeProps, mergeRefs, tv } from '../../utils';
import { useFieldSize } from '../field/context';
import { FieldPopup, flattenParts, part } from '../field-popup';
import { parseColor, serializeColor, type ColorFormat } from './color';
import { ColorControls, type ColorControlsProps } from './color-controls';

import type { IdsSize } from '../../tokens/types';
export type ColorFieldProps = Omit<
  ComponentProps<'button'>,
  'value' | 'defaultValue' | 'onChange'
> & {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  format?: ColorFormat;
  alpha?: boolean;
  swatches?: string[];
  variant?: 'default' | 'compact' | 'swatchOnly';
  surfaceVariant?: 'outline' | 'filled' | 'unstyled';
  size?: IdsSize;
  invalid?: boolean;
  readOnly?: boolean;
  required?: boolean;
  placeholder?: string;
  mobileVariant?: 'popover' | 'drawer';
};
type ContextValue = {
  styles: ReturnType<typeof ColorField.Style>;
  value: string;
  placeholder: string;
  blocked: boolean;
  trigger: ComponentProps<'button'>;
  clear: () => void;
  controls: ColorControlsProps;
};
const Context = createContext<ContextValue | null>(null);
function useColor() {
  const c = useContext(Context);
  invariant(c, 'ColorField parts must be inside ColorField.');
  return c;
}
function ColorSwatch({ asChild, children, ...props }: ColorField.SwatchProps) {
  const c = useColor();
  const color = parseColor(c.value);
  return part(
    'span',
    asChild,
    children,
    mergeProps(props, {
      'aria-hidden': true,
      className: c.styles.swatch(),
      style: { backgroundColor: color ? serializeColor(color, 'rgb', true) : 'transparent' },
    }),
  );
}
function ColorValue({ asChild, children, ...props }: ColorField.ValueProps) {
  const c = useColor();
  return part(
    'span',
    asChild,
    children ?? (c.value || c.placeholder),
    mergeProps({ className: c.styles.value() }, props),
  );
}
function ColorTrigger({ asChild, children, ...props }: ColorField.TriggerProps) {
  const c = useColor();
  invariant(
    !flattenParts(children).some((p) => isValidElement(p) && p.type === ColorClear),
    'ColorField.Clear must be a sibling of Trigger, not inside its button.',
  );
  return part(
    'button',
    asChild,
    children ?? (
      <>
        <ColorSwatch />
        <ColorValue />
      </>
    ),
    mergeProps(props, { ...c.trigger }),
  );
}
function ColorClear({ asChild, children, ...props }: ColorField.ClearProps) {
  const c = useColor();
  if (!c.value) return null;
  return part(
    'button',
    asChild,
    children ?? <XMarkIcon aria-hidden="true" />,
    mergeProps(props, {
      type: 'button',
      'aria-label': props['aria-label'] ?? '색상 지우기',
      disabled: c.blocked,
      className: c.styles.clear(),
      onClick: () => c.clear(),
    }),
  );
}
function ColorContent({ asChild, children, ...props }: ColorField.ContentProps) {
  const c = useColor();
  return part('div', asChild, children ?? <ColorControls {...c.controls} />, props);
}
export function ColorField({
  value,
  defaultValue = '',
  onChange,
  format = 'hex',
  alpha = false,
  swatches,
  variant = 'default',
  surfaceVariant = 'outline',
  size,
  invalid,
  readOnly,
  required,
  placeholder = '색상 선택',
  mobileVariant,
  children,
  ref: forwardedRef,
  name,
  form,
  className,
  style,
  ...native
}: ColorFieldProps) {
  const [stored, setStored] = useState(defaultValue);
  const current = value === undefined ? stored : value;
  const parsed = parseColor(current);
  const normalized = parsed ? serializeColor(parsed, format, alpha) : current;
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const uid = useId();
  const id = `ids-color-${uid}`;
  const blocked = !!native.disabled || !!readOnly;
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const styles = ColorField.Style({ surfaceVariant, size: resolvedSize });
  const close = useCallback(
    (restore: boolean) => {
      setOpen(false);
      if (restore) trigger.current?.focus({ preventScroll: true });
    },
    [setOpen],
  );
  const change = (next: string) => {
    if (blocked) return;
    if (value === undefined) setStored(next);
    if (next !== normalized) onChange?.(next);
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
    form,
    id: native.id ?? `${id}-trigger`,
    type: 'button',
    'aria-haspopup': 'dialog',
    'aria-expanded': open && !blocked,
    'aria-controls': open && !blocked ? id : undefined,
    'aria-invalid': native['aria-invalid'] ?? invalid ?? (!!current && !parsed),
    'aria-required': native['aria-required'] ?? required,
    // mergeRefs returns a callback; it does not read ref.current here.
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
      if (!e.relatedTarget || !(e.relatedTarget as Element).closest?.(`[data-color-owner="${id}"]`))
        native.onBlur?.(e);
    },
  };
  const parts = flattenParts(children);
  const triggers = parts.filter((p) => isValidElement(p) && p.type === ColorTrigger);
  const contents = parts.filter((p) => isValidElement(p) && p.type === ColorContent);
  const clears = parts.filter((p) => isValidElement(p) && p.type === ColorClear);
  invariant(
    triggers.length <= 1 && contents.length <= 1 && clears.length <= 1,
    'ColorField accepts one Trigger, Content and Clear.',
  );
  return (
    <Context.Provider
      value={{
        styles,
        value: normalized,
        placeholder,
        blocked,
        trigger: triggerProps,
        clear: () => {
          change('');
          trigger.current?.focus({ preventScroll: true });
        },
        controls: {
          value: normalized,
          onChange: change,
          format,
          alpha,
          swatches,
          variant,
          size: resolvedSize,
        },
      }}
    >
      <div
        ref={surface}
        data-color-field=""
        aria-invalid={triggerProps['aria-invalid']}
        className={styles.root({ className })}
        style={style}
      >
        {triggers.length ? triggers : <ColorTrigger />}
        {clears.length ? clears : <ColorClear />}
      </div>
      {open && !blocked && (
        <FieldPopup
          anchor={surface}
          mobileVariant={mobileVariant}
          onClose={close}
          role="dialog"
          id={id}
          aria-label={native['aria-label'] ?? '색상 선택'}
          data-color-owner={id}
          onBlur={(e) => {
            if (
              !e.currentTarget.contains(e.relatedTarget as Node) &&
              e.relatedTarget !== trigger.current
            )
              native.onBlur?.(e as unknown as React.FocusEvent<HTMLButtonElement>);
          }}
        >
          <div className={styles.header()}>
            <span className={styles.title()}>색상 선택</span>
            <button
              type="button"
              data-popup-autofocus=""
              aria-label="색상 선택 닫기"
              onClick={() => close(true)}
              className={styles.close()}
            >
              <XMarkIcon aria-hidden="true" />
            </button>
          </div>
          {contents.length ? contents : <ColorContent />}
        </FieldPopup>
      )}
      {name && (
        <input
          type="hidden"
          name={name}
          form={form}
          value={normalized}
          disabled={native.disabled}
        />
      )}
    </Context.Provider>
  );
}
export namespace ColorField {
  export type Props = ColorFieldProps;
  export type TriggerProps = ComponentProps<'button'> & { asChild?: boolean };
  export type ClearProps = TriggerProps;
  export type ValueProps = ComponentProps<'span'> & { asChild?: boolean };
  export type SwatchProps = ValueProps;
  export type ContentProps = ComponentProps<'div'> & { asChild?: boolean };
  export const Trigger = ColorTrigger;
  export const Value = ColorValue;
  export const Swatch = ColorSwatch;
  export const Content = ColorContent;
  export const Clear = ColorClear;
  export const Style = tv({
    slots: {
      // The shell is a div around two buttons, so it cannot use `focus-ring` and lights up for
      // whichever of them has keyboard focus.
      root: [
        'flex w-full min-w-0 items-center text-(--ids-color-on-surface)',
        'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
        'has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-(--ids-color-primary)/40',
        'aria-invalid:inset-ring-1 aria-invalid:inset-ring-(--ids-color-danger)',
      ],
      trigger: [
        'flex h-full min-w-0 flex-1 touch-manipulation items-center text-left outline-none',
        'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
      ],
      swatch: 'shrink-0 rounded-xs inset-ring-1 inset-ring-(--ids-color-outline)',
      value: 'min-w-0 flex-1 truncate font-mono',
      clear: [
        'inline-flex shrink-0 cursor-pointer items-center justify-center text-(--ids-color-on-muted)',
        'focus-ring disabled:cursor-not-allowed disabled:opacity-50',
      ],
      header: 'mb-2 flex items-center justify-between px-1',
      title: 'text-body-b3-medium',
      close: [
        'inline-flex size-7 cursor-pointer items-center justify-center rounded-sm',
        'focus-ring [&_svg]:size-(--ids-size-icon-standard)',
      ],
    },
    variants: {
      surfaceVariant: {
        outline: { root: 'bg-transparent shadow-xs inset-ring-1 inset-ring-(--ids-color-outline)' },
        filled: { root: 'bg-(--ids-color-primary)/10' },
        unstyled: { root: 'bg-transparent' },
      },
      size: {
        standard: {
          root: 'h-(--ids-size-control-standard) rounded-md text-body-b3-regular',
          trigger: 'gap-2 px-3',
          swatch: 'size-5',
          clear: 'mr-1 size-7 rounded-sm [&_svg]:size-(--ids-size-icon-standard)',
        },
        tiny: {
          root: 'h-(--ids-size-control-tiny) rounded-sm text-caption-c1-regular',
          trigger: 'gap-1.5 px-2',
          swatch: 'size-4',
          clear: 'mr-1 size-6 rounded-xs [&_svg]:size-(--ids-size-icon-tiny)',
        },
      } satisfies Record<IdsSize, object>,
    },
    defaultVariants: { surfaceVariant: 'outline', size: 'standard' },
  });
}
export type { ColorFormat } from './color';
