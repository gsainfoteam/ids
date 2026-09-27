import {
  createContext,
  isValidElement,
  useContext,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';

import { isNotNil } from 'es-toolkit';

import { useAutoResize } from './use-auto-resize';
import { flattenFragments, invariant, mergeProps, mergeRefs, tv } from '../../../utils';
import { Slot } from '../../utility/slot';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

export type TextAreaVariant = 'outline' | 'filled' | 'underline';

export type TextAreaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export type TextAreaInputProps = Omit<
  ComponentProps<'textarea'>,
  'children' | 'className' | 'style' | 'color' | 'disabled'
>;

export type TextAreaContextValue = {
  size: IdsSize;
  disabled?: boolean;
  autoResize: boolean;
  minRows?: number;
  maxRows?: number;
  invalid: boolean;
  inputProps: TextAreaInputProps;
  inputRef: RefObject<HTMLTextAreaElement | null>;
};

const TextAreaContext = createContext<TextAreaContextValue | null>(null);

export function useTextAreaContext() {
  return useContext(TextAreaContext);
}

function rowsToHeight(rows: number | undefined) {
  return rows == null ? undefined : `calc(${rows} * 1lh + var(--ids-text-area-pad-y) * 2)`;
}

function splitByInput(children: ReactNode) {
  const items = flattenFragments(children);
  const inputIndexes = items
    .map((child, index) => (isValidElement(child) && child.type === TextArea.Input ? index : null))
    .filter(isNotNil);

  invariant(inputIndexes.length <= 1, '`<TextArea>` accepts at most one `<TextArea.Input />`.');

  const inputIndex = inputIndexes[0];
  if (inputIndex == null) {
    return { top: [] as ReactNode[], input: <TextArea.Input />, bottom: items };
  }

  return {
    top: items.slice(0, inputIndex),
    input: items[inputIndex] as ReactElement<TextArea.Input.Props>,
    bottom: items.slice(inputIndex + 1),
  };
}

export function TextArea({
  variant = 'outline',
  size: sizeProp,
  disabled,
  invalid,
  autoResize = true,
  resize,
  minRows,
  maxRows,
  rows = 3,
  className,
  style,
  children,
  ...rest
}: TextArea.Props) {
  const size = useFieldSize(sizeProp) ?? 'standard';
  const inputRef = useRef<HTMLTextAreaElement>(null);

  invariant(
    !autoResize || resize == null || resize === 'none',
    '`<TextArea>` cannot use `resize` together with `autoResize`.',
  );
  for (const [name, value] of Object.entries({ minRows, maxRows })) {
    invariant(
      value == null || (Number.isInteger(value) && value > 0),
      `\`<TextArea>\` \`${name}\` must be a positive integer.`,
    );
  }
  invariant(
    minRows == null || maxRows == null || minRows <= maxRows,
    '`<TextArea>` `minRows` must not exceed `maxRows`.',
  );
  const inputProps = { ...rest, rows };
  const { top, input, bottom } = splitByInput(children);
  const { root, bar } = TextArea.Style({
    variant,
    size,
    resize: autoResize ? 'none' : (resize ?? 'vertical'),
  });

  // The sentinel's own props win over the container's, so validate and derive
  // container state from the merged result, not from the container props alone.
  const merged = { ...inputProps, ...input.props };
  const isDisabled = input.props.disabled ?? disabled;
  const ariaInvalid = merged['aria-invalid'] ?? invalid;
  const isInvalid = ariaInvalid != null && ariaInvalid !== false && ariaInvalid !== 'false';

  invariant(
    merged.value == null || merged.onChange != null || merged.readOnly === true,
    '`<TextArea>` with `value` requires `onChange` (or `readOnly`).',
  );

  return (
    <TextAreaContext.Provider
      value={{
        size,
        disabled: isDisabled,
        autoResize,
        minRows,
        maxRows,
        invalid: isInvalid,
        inputProps,
        inputRef,
      }}
    >
      <div
        data-text-area=""
        data-variant={variant}
        data-size={size}
        data-disabled={isDisabled ? '' : undefined}
        data-invalid={isInvalid ? '' : undefined}
        className={root({ className })}
        style={style}
      >
        <div data-text-area-top="" className={bar({ position: 'top' })}>
          {top}
        </div>
        {input}
        <div data-text-area-bottom="" className={bar({ position: 'bottom' })}>
          {bottom}
        </div>
      </div>
    </TextAreaContext.Provider>
  );
}

export namespace TextArea {
  export const Style = tv({
    slots: {
      root: [
        'flex w-full min-w-0 flex-col overflow-hidden',
        // Not transition-all: the root carries the resize handle, and animating its
        // width/height makes the field lag behind the pointer while dragging.
        'bg-transparent text-(--ids-color-on-surface)',
        'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast)',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
      ],
      bar: [
        'flex shrink-0 items-center empty:hidden',
        'border-(--ids-color-outline)',
        'not-has-[button]:text-(--ids-color-on-muted)',
        '[&_svg]:shrink-0',
        '[&_button]:size-auto [&_button]:h-auto [&_button]:min-h-0 [&_button]:w-auto [&_button]:min-w-0',
      ],
      input: [
        'w-full min-w-0 grow resize-none bg-transparent outline-none',
        'text-inherit placeholder:text-(--ids-color-on-muted)',
        'selection:bg-(--ids-color-primary)/30 selection:text-(--ids-color-on-surface)',
        'disabled:cursor-not-allowed',
        'py-(--ids-text-area-pad-y)',
      ],
    },
    variants: {
      variant: {
        outline: {
          root: [
            'shadow-xs inset-ring-1 inset-ring-(--ids-color-outline)',
            'data-invalid:inset-ring-(--ids-color-danger)',
            'focus-ring',
          ],
        },
        filled: {
          root: [
            'bg-(--ids-color-primary)/10 inset-ring-1 inset-ring-transparent',
            'has-[[data-text-area-input]:focus-visible]:bg-(--ids-color-primary)/15',
            'data-invalid:inset-ring-(--ids-color-danger)',
            'focus-ring',
          ],
        },
        underline: {
          root: [
            'rounded-none border-b-2 border-(--ids-color-outline)',
            'has-[[data-text-area-input]:focus-visible]:border-(--ids-color-primary)',
            'data-invalid:border-(--ids-color-danger)',
          ],
        },
      },
      size: {
        standard: {
          root: 'text-body-b3-regular',
          bar: 'gap-1 px-3 py-2 [&_svg]:size-(--ids-size-icon-standard)',
          input: 'px-3 [--ids-text-area-pad-y:0.5rem]',
        },
        tiny: {
          root: 'text-caption-c1-regular',
          bar: 'gap-0.5 px-2 py-1.5 [&_svg]:size-(--ids-size-icon-tiny)',
          input: 'px-2 [--ids-text-area-pad-y:0.5rem]',
        },
      },
      position: {
        top: { bar: 'border-b' },
        bottom: { bar: 'border-t' },
      },
      // The handle lives on the root: resizing the textarea itself would push it past
      // the rounded border and the bars instead of growing the whole field.
      resize: {
        none: { root: 'resize-none' },
        vertical: { root: 'resize-y' },
        horizontal: { root: 'resize-x' },
        both: { root: 'resize' },
      },
    },
    compoundVariants: [
      { variant: 'outline', size: 'standard', class: { root: 'rounded-standard' } },
      { variant: 'outline', size: 'tiny', class: { root: 'rounded-standard' } },
      { variant: 'filled', size: 'standard', class: { root: 'rounded-standard' } },
      { variant: 'filled', size: 'tiny', class: { root: 'rounded-standard' } },
    ],
    defaultVariants: {
      variant: 'outline',
      size: 'standard',
      resize: 'none',
    },
  });

  export function Input({
    asChild,
    children,
    disabled: disabledProp,
    className,
    style,
    ref,
    ...rest
  }: Input.Props) {
    const field = useTextAreaContext();
    invariant(field != null, '`<TextArea.Input>` must be used inside `<TextArea>`.');

    const { size, autoResize, minRows, maxRows, invalid, inputProps, inputRef } = field;
    const { input } = Style({ size });
    // JS measurement rather than `field-sizing: content`, which Safari and Firefox ignore.
    useAutoResize(inputRef, { autoResize, minRows, maxRows });

    const props = {
      'data-text-area-input': '',
      'aria-invalid': invalid || undefined,
      // Input values win, but handlers compose so Field and react-hook-form wiring on the
      // root still runs when the Input sets its own onChange or onBlur.
      ...mergeProps(inputProps, rest),
      disabled: disabledProp ?? field.disabled,
      className: input({ className }),
      style: { maxHeight: autoResize ? undefined : rowsToHeight(maxRows), ...style },
    };

    if (asChild === true) {
      invariant(
        isValidElement(children) &&
          (typeof children.type !== 'string' || children.type === 'textarea'),
        '`<TextArea.Input asChild>` requires one textarea, or a component forwarding textarea props and ref.',
      );
      return (
        <Slot {...(props as Slot.Props)} ref={mergeRefs(inputRef, inputProps.ref, ref)}>
          {children}
        </Slot>
      );
    }
    invariant(children == null, '`<TextArea.Input>` takes `value`/`defaultValue`, not children.');
    return <textarea {...props} ref={mergeRefs(inputRef, inputProps.ref, ref)} />;
  }

  export namespace Input {
    export type Props = TextAreaInputProps & {
      asChild?: boolean;
      children?: ReactNode;
      disabled?: boolean;
      className?: string;
      style?: CSSProperties;
    };
  }

  export type Props = TextAreaInputProps & {
    variant?: TextAreaVariant;
    size?: IdsSize;
    disabled?: boolean;
    invalid?: boolean;
    autoResize?: boolean;
    resize?: TextAreaResize;
    minRows?: number;
    maxRows?: number;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
  };
}

export type TextAreaProps = TextArea.Props;
