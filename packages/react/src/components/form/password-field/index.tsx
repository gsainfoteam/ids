import {
  cloneElement,
  createContext,
  Fragment,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { isNotNil } from 'es-toolkit';

import { fieldSurface, type FieldSurfaceVariant } from '../../../internal/field-surface';
import { flattenFragments, invariant, mergeProps, mergeRefs, tv } from '../../../utils';
import { IconButton } from '../../action/icon-button';
import { Slot } from '../../utility/slot';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

type NativeProps = ComponentProps<'input'>;
type NativeButtonProps = ComponentProps<'button'>;
type RootInputProps = Omit<NativeProps, 'type' | 'size' | 'color' | 'children'>;

export type PasswordFieldVariant = FieldSurfaceVariant;
export type PasswordFieldProps = RootInputProps & {
  variant?: PasswordFieldVariant;
  size?: IdsSize;
  invalid?: boolean;
  hideVisibilityToggle?: boolean;
  children?: ReactNode;
};

type PasswordFieldContextValue = {
  size: IdsSize;
  visible: boolean;
  disabled: boolean;
  id: string;
  toggle: (pointer: boolean) => void;
  inputProps: Omit<RootInputProps, 'className' | 'style'>;
  // Computed from the merged root, Input and asChild props, so applying them last does not
  // discard anything the caller set; it only fills in the password-specific defaults.
  internal: Pick<
    NativeProps,
    'id' | 'type' | 'autoComplete' | 'spellCheck' | 'autoCapitalize' | 'aria-invalid' | 'disabled'
  >;
  inputRef: RefObject<HTMLInputElement | null>;
};

const PasswordFieldContext = createContext<PasswordFieldContextValue | null>(null);

function splitByInput(children: ReactNode) {
  const items = flattenFragments(children);
  const indexesOf = (type: unknown) =>
    items
      .map((child, index) => (isValidElement(child) && child.type === type ? index : null))
      .filter(isNotNil);
  const inputIndexes = indexesOf(PasswordInput);

  invariant(
    inputIndexes.length <= 1,
    '`<PasswordField>` accepts at most one `<PasswordField.Input />`.',
  );
  invariant(
    indexesOf(PasswordVisibilityToggle).length <= 1,
    '`<PasswordField>` accepts at most one `<PasswordField.VisibilityToggle />`.',
  );

  const hasToggle = indexesOf(PasswordVisibilityToggle).length > 0;
  const inputIndex = inputIndexes[0];
  if (inputIndex == null) {
    return { leading: items, input: <PasswordInput />, trailing: [] as ReactNode[], hasToggle };
  }

  return {
    leading: items.slice(0, inputIndex),
    input: items[inputIndex] as ReactElement<PasswordField.InputProps>,
    trailing: items.slice(inputIndex + 1),
    hasToggle,
  };
}

function PasswordInput({
  asChild,
  children,
  className,
  style,
  ref,
  ...rest
}: PasswordField.InputProps) {
  const field = useContext(PasswordFieldContext);
  invariant(field != null, '`<PasswordField.Input>` must be used inside `<PasswordField>`.');

  const { size, inputProps, internal, inputRef } = field;
  const register = (node: HTMLInputElement | null) => {
    invariant(
      !node || node.tagName === 'INPUT',
      '`<PasswordField.Input asChild>` must forward its ref to an input.',
    );
    inputRef.current = node;
    return () => {
      inputRef.current = null;
    };
  };
  const props = {
    'data-password-field-input': '',
    'data-field-input': '',
    'data-size': size,
    // Input values win, but handlers compose so Field and react-hook-form wiring on the
    // root still runs when the Input sets its own onChange or onBlur.
    ...mergeProps(inputProps, rest),
    ...internal,
    className: PasswordField.Style({ size }).input({ className }),
    style,
  };

  if (asChild === true) {
    invariant(
      isValidElement(children) && (typeof children.type !== 'string' || children.type === 'input'),
      '`<PasswordField.Input asChild>` requires one input, or a component forwarding input props and ref.',
    );
    return (
      <Slot {...(props as Slot.Props)} ref={mergeRefs(register, inputProps.ref, ref)}>
        {children}
      </Slot>
    );
  }
  invariant(
    children == null,
    '`<PasswordField.Input>` takes `value`/`defaultValue`, not children.',
  );
  return <input {...props} ref={mergeRefs(register, inputProps.ref, ref)} />;
}

function PasswordVisibilityToggle({
  asChild,
  children,
  ...props
}: PasswordField.VisibilityToggleProps) {
  const context = useContext(PasswordFieldContext);
  invariant(
    context != null,
    '`<PasswordField.VisibilityToggle>` must be used inside `<PasswordField>`.',
  );
  const internal: Omit<NativeButtonProps, 'children'> = {
    type: 'button',
    disabled: context.disabled || props.disabled,
    'aria-label': context.visible ? '비밀번호 숨기기' : '비밀번호 표시',
    'aria-pressed': context.visible,
    'aria-controls': context.id,
    onPointerDown: (event) => {
      if (event.button === 0) event.preventDefault();
    },
    onClick: (event) => {
      if (!context.disabled && !props.disabled) context.toggle(event.detail > 0);
    },
  };
  if (asChild) {
    invariant(
      isValidElement<NativeButtonProps>(children) && children.type !== Fragment,
      '`<PasswordField.VisibilityToggle asChild>` requires one button, or a component forwarding button props and ref.',
    );
    invariant(
      typeof children.type !== 'string' || children.type === 'button',
      '`<PasswordField.VisibilityToggle asChild>` must render a button.',
    );
    return cloneElement(
      children,
      mergeProps(mergeProps({ ...children.props }, props), { ...internal }),
    );
  }
  invariant(
    children == null,
    '`<PasswordField.VisibilityToggle>` supplies its own icon; use `asChild` to customize it.',
  );
  return (
    <IconButton
      {...mergeProps(props, { ...internal })}
      size={context.size}
      variant="ghost"
      aria-label={internal['aria-label']!}
      className={PasswordField.Style({ size: context.size }).toggle()}
      icon={context.visible ? <EyeSlashIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
    />
  );
}

export function PasswordField({
  variant = 'outline',
  size,
  invalid,
  hideVisibilityToggle = false,
  children,
  className,
  style,
  ...inputProps
}: PasswordFieldProps) {
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const styles = PasswordField.Style({ variant, size: resolvedSize });
  const generatedId = useId();
  const [visible, setVisible] = useState(false);
  const { leading, input, trailing, hasToggle } = splitByInput(children);

  // Container state and the internal input attributes read the same precedence the Input
  // renders with (asChild child < root < Input), so they never disagree with the DOM.
  const { asChild, children: inputChild, ...ownInputProps } = input.props;
  const childProps =
    asChild === true && isValidElement<NativeProps>(inputChild) ? inputChild.props : {};
  const native: NativeProps = mergeProps(mergeProps({ ...childProps }, inputProps), ownInputProps);
  const id = native.id ?? `ids-password-${generatedId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const selection = useRef<{
    start: number;
    end: number;
    direction: 'forward' | 'backward' | 'none';
  } | null>(null);
  useLayoutEffect(() => {
    const node = inputRef.current;
    const saved = selection.current;
    if (node && saved) node.setSelectionRange(saved.start, saved.end, saved.direction);
    selection.current = null;
  }, [visible]);
  useEffect(() => {
    if (import.meta.env.DEV && !native.name)
      console.warn(
        '[IDS] PasswordField: name="password" 등을 명시하면 자동완성 매니저 호환성이 향상됩니다.',
      );
  }, [native.name]);
  useLayoutEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    let active = true;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (active && !event.defaultPrevented) setVisible(false);
      });
    form.addEventListener('reset', reset);
    return () => {
      active = false;
      form.removeEventListener('reset', reset);
    };
  }, [native.form]);
  const ariaInvalid = native['aria-invalid'] ?? invalid;
  // Only a name identifying a new password is a reliable local hint. Callers can override it.
  const nameLeaf = native.name
    ?.replaceAll('[', '.')
    .replaceAll(']', '.')
    .split('.')
    .filter(Boolean)
    .at(-1);
  const autoComplete =
    native.autoComplete ??
    (/^new[-_]?password$/i.test(nameLeaf ?? '') ? 'new-password' : 'current-password');

  const context: PasswordFieldContextValue = {
    size: resolvedSize,
    visible,
    disabled: !!native.disabled,
    id,
    inputProps,
    internal: {
      id,
      type: visible ? 'text' : 'password',
      autoComplete,
      spellCheck: native.spellCheck ?? false,
      autoCapitalize: native.autoCapitalize ?? 'none',
      'aria-invalid': ariaInvalid,
      disabled: native.disabled,
    },
    inputRef,
    toggle: (pointer) => {
      const node = inputRef.current;
      if (!node || native.disabled) return;
      if (pointer) node.focus({ preventScroll: true });
      selection.current =
        node.selectionStart == null || node.selectionEnd == null
          ? null
          : {
              start: node.selectionStart,
              end: node.selectionEnd,
              direction: node.selectionDirection ?? 'none',
            };
      setVisible((previous) => !previous);
    },
  };
  return (
    <PasswordFieldContext.Provider value={context}>
      <div
        data-password-field=""
        data-size={resolvedSize}
        data-variant={variant}
        data-disabled={native.disabled ? '' : undefined}
        data-readonly={native.readOnly ? '' : undefined}
        data-invalid={
          ariaInvalid != null && ariaInvalid !== false && ariaInvalid !== 'false' ? '' : undefined
        }
        className={styles.root({ className })}
        style={style}
      >
        <Adornments items={leading} className={styles.adornment()} />
        {input}
        <Adornments items={trailing} className={styles.adornment()} />
        {!hideVisibilityToggle && !hasToggle && <PasswordVisibilityToggle />}
      </div>
    </PasswordFieldContext.Provider>
  );
}

function Adornments({ items, className }: { items: ReactNode[]; className: string }) {
  return items.map((item, index) =>
    // The toggle is our own part with its own sizing; the adornment span resets nested
    // buttons to their content size, which would shrink it.
    isValidElement(item) && item.type === PasswordVisibilityToggle ? (
      item
    ) : (
      <span
        key={(isValidElement(item) && item.key) || index}
        data-password-field-adornment=""
        className={className}
      >
        {item}
      </span>
    ),
  );
}

export namespace PasswordField {
  export type Props = PasswordFieldProps;
  export type InputProps = Omit<NativeProps, 'type' | 'size' | 'children'> & {
    asChild?: boolean;
    children?: ReactNode;
  };
  export type VisibilityToggleProps = NativeButtonProps & { asChild?: boolean };
  export const Input = PasswordInput;
  export const VisibilityToggle = PasswordVisibilityToggle;
  export const Style = tv({
    slots: {
      root: ['inline-flex w-full min-w-0 items-center', fieldSurface.base],
      input: [
        'h-full w-full min-w-0 flex-1 border-0 bg-transparent outline-none',
        'text-inherit placeholder:text-(--ids-color-on-muted)',
        'selection:bg-(--ids-color-primary)/30 selection:text-(--ids-color-on-surface)',
        'disabled:cursor-not-allowed',
      ],
      adornment: [
        'inline-flex shrink-0 items-center empty:hidden',
        'not-has-[button]:text-(--ids-color-on-muted)',
        'not-has-[button]:[&_svg]:shrink-0 not-has-[button]:[&_svg]:text-current',
        '[&_button]:size-auto [&_button]:h-auto [&_button]:min-h-0 [&_button]:w-auto [&_button]:min-w-0',
        '[&_button]:p-0',
      ],
      toggle: 'min-w-0 shrink-0 p-0',
    },
    variants: {
      variant: {
        outline: { root: fieldSurface.variant.outline },
        soft: { root: fieldSurface.variant.soft },
        ghost: { root: fieldSurface.variant.ghost },
      } satisfies Record<PasswordFieldVariant, object>,
      size: {
        standard: {
          root: fieldSurface.size.standard,
          adornment: [
            'gap-1',
            'not-has-[button]:text-body-b3-regular not-has-[button]:[&_svg]:size-(--ids-size-icon-standard)',
          ],
          toggle: 'size-7 rounded-standard',
        },
        tiny: {
          root: fieldSurface.size.tiny,
          adornment: [
            'gap-0.5',
            'not-has-[button]:text-caption-c1-regular not-has-[button]:[&_svg]:size-(--ids-size-icon-tiny)',
          ],
          toggle: 'size-6 rounded-indicator',
        },
      } satisfies Record<IdsSize, object>,
    },
    defaultVariants: {
      variant: 'outline',
      size: 'standard',
    },
  });
}
