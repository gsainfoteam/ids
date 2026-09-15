import {
  Children,
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

import { invariant, mergeRefs, tv } from '../../utils';

import type { IdsSize } from '../../tokens/types';

export type TextAreaVariant = 'outline' | 'filled' | 'underline';

export type TextAreaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export type TextAreaInputProps = Omit<
  ComponentProps<'textarea'>,
  'children' | 'className' | 'style' | 'color' | 'disabled'
>;

export type TextAreaContextValue = {
  size: IdsSize;
  disabled?: boolean;
  resize: TextAreaResize;
  autoResize: boolean;
  maxRows?: number;
  inputProps: TextAreaInputProps;
  inputRef: RefObject<HTMLTextAreaElement | null>;
};

const TextAreaContext = createContext<TextAreaContextValue | null>(null);

export function useTextAreaContext() {
  return useContext(TextAreaContext);
}

/** `field-sizing: content`는 `rows`를 무시하므로 높이 경계를 직접 계산한다. */
function rowsToHeight(rows: number | undefined) {
  return rows == null ? undefined : `calc(${rows} * 1lh + var(--ids-text-area-pad-y) * 2)`;
}

function splitByInput(children: ReactNode) {
  const items = Children.toArray(children);
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
  size = 'standard',
  disabled,
  autoResize = true,
  resize,
  maxRows,
  rows = 3,
  className,
  style,
  children,
  ...rest
}: TextArea.Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  invariant(
    !autoResize || resize == null || resize === 'none',
    '`<TextArea>` cannot use `resize` together with `autoResize`.',
  );
  const inputProps = { ...rest, rows };
  const { top, input, bottom } = splitByInput(children);
  const { root, bar } = TextArea.Style({ variant, size });

  // The sentinel's own props win over the container's, so validate and derive
  // container state from the merged result, not from the container props alone.
  const merged = { ...inputProps, ...input.props };
  const isDisabled = input.props.disabled ?? disabled;

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
        resize: autoResize ? 'none' : (resize ?? 'vertical'),
        maxRows,
        inputProps,
        inputRef,
      }}
    >
      <div
        data-text-area=""
        data-variant={variant}
        data-size={size}
        data-disabled={isDisabled ? '' : undefined}
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
        'bg-transparent text-(--ids-color-on-surface) transition-all',
        'data-disabled:cursor-not-allowed data-disabled:opacity-40',
      ],
      bar: [
        'flex shrink-0 items-center empty:hidden',
        'border-(--ids-color-outline)',
        'not-has-[button]:text-(--ids-color-on-muted)',
        '[&_svg]:shrink-0',
        '[&_button]:size-auto [&_button]:h-auto [&_button]:min-h-0 [&_button]:w-auto [&_button]:min-w-0',
      ],
      input: [
        'w-full min-w-0 bg-transparent outline-none',
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
            'inset-ring-1 inset-ring-(--ids-color-outline)',
            'has-[[data-text-area-input]:focus-visible]:outline-2',
            'has-[[data-text-area-input]:focus-visible]:outline-offset-2',
            'has-[[data-text-area-input]:focus-visible]:outline-(--ids-color-primary)',
          ],
        },
        filled: {
          root: [
            'bg-(--ids-color-primary)/10 inset-ring-1 inset-ring-transparent',
            'has-[[data-text-area-input]:focus-visible]:bg-(--ids-color-primary)/15',
            'has-[[data-text-area-input]:focus-visible]:outline-2',
            'has-[[data-text-area-input]:focus-visible]:outline-offset-2',
            'has-[[data-text-area-input]:focus-visible]:outline-(--ids-color-primary)',
          ],
        },
        underline: {
          root: [
            'rounded-none border-b-2 border-(--ids-color-outline)',
            'has-[[data-text-area-input]:focus-visible]:border-(--ids-color-primary)',
          ],
        },
      },
      size: {
        standard: {
          root: 'text-body-b2-regular',
          bar: 'gap-1 px-3 py-2 [&_svg]:size-5',
          input: 'px-3 [--ids-text-area-pad-y:0.625rem]',
        },
        tiny: {
          root: 'text-body-b3-regular',
          bar: 'gap-0.5 px-2 py-1.5 [&_svg]:size-4',
          input: 'px-2 [--ids-text-area-pad-y:0.375rem]',
        },
      },
      position: {
        top: { bar: 'border-b' },
        bottom: { bar: 'border-t' },
      },
      resize: {
        none: { input: 'resize-none' },
        vertical: { input: 'resize-y' },
        horizontal: { input: 'resize-x' },
        both: { input: 'resize' },
      },
      autoResize: {
        true: { input: 'field-sizing-content' },
        false: { input: '' },
      },
    },
    compoundVariants: [
      { variant: 'outline', size: 'standard', class: { root: 'rounded-xl' } },
      { variant: 'outline', size: 'tiny', class: { root: 'rounded-lg' } },
      { variant: 'filled', size: 'standard', class: { root: 'rounded-xl' } },
      { variant: 'filled', size: 'tiny', class: { root: 'rounded-lg' } },
    ],
    defaultVariants: {
      variant: 'outline',
      size: 'standard',
      resize: 'none',
      autoResize: true,
    },
  });

  export function Input({ disabled: disabledProp, className, style, ref, ...rest }: Input.Props) {
    const field = useTextAreaContext();
    invariant(field != null, '`<TextArea.Input>` must be used inside `<TextArea>`.');

    const { size, autoResize, resize, maxRows, inputProps, inputRef } = field;
    const { input } = Style({ size, resize, autoResize });

    return (
      <textarea
        data-text-area-input=""
        {...inputProps}
        {...rest}
        disabled={disabledProp ?? field.disabled}
        className={input({ className })}
        style={{
          minHeight: autoResize ? rowsToHeight(inputProps.rows) : undefined,
          maxHeight: rowsToHeight(maxRows),
          ...style,
        }}
        ref={mergeRefs(inputRef, inputProps.ref, ref)}
      />
    );
  }

  export namespace Input {
    export type Props = TextAreaInputProps & {
      disabled?: boolean;
      className?: string;
      style?: CSSProperties;
    };
  }

  export type Props = TextAreaInputProps & {
    variant?: TextAreaVariant;
    size?: IdsSize;
    disabled?: boolean;
    autoResize?: boolean;
    resize?: TextAreaResize;
    maxRows?: number;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
  };
}
