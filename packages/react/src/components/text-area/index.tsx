import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  useEffect,
  useCallback,
  useRef,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';

import { useAutoResize, type AutoResizeOptions } from './use-auto-resize';
import { invariant, mergeProps, mergeRefs, tv } from '../../utils';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../tokens/types';

type NativeProps = ComponentProps<'textarea'>;
export type TextAreaVariant = 'outline' | 'filled' | 'unstyled';
export type TextAreaProps = Omit<NativeProps, 'children' | 'color'> &
  AutoResizeOptions & {
    variant?: TextAreaVariant;
    size?: IdsSize;
    invalid?: boolean;
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
    children?: ReactNode;
  };

// Fragments are transparent; do not execute arbitrary components to discover children.
function flatten(children: ReactNode, prefix = ''): ReactNode[] {
  return Children.toArray(children).flatMap((child, index) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flatten(child.props.children, `${prefix}${index}:`)
      : [isValidElement(child) ? cloneElement(child, { key: `${prefix}${child.key}` }) : child],
  );
}

function TextAreaInput(_props: TextArea.InputProps): ReactNode {
  invariant(false, 'TextArea.Input must be a direct child of TextArea (or inside a Fragment).');
}

function InputElement({
  nativeProps,
  child,
  options,
}: {
  nativeProps: NativeProps;
  child?: ReactElement<NativeProps>;
  options: AutoResizeOptions;
}) {
  const localRef = useRef<HTMLTextAreaElement>(null);
  const ref = useCallback(
    (node: HTMLTextAreaElement | null) => {
      invariant(
        !node || node.tagName === 'TEXTAREA',
        'TextArea.Input asChild must forward its ref to a textarea.',
      );
      localRef.current = node;
      const cleanup = mergeRefs(nativeProps.ref)(node);
      return () => {
        localRef.current = null;
        cleanup?.();
      };
    },
    [nativeProps.ref],
  );
  useAutoResize(localRef, options);
  const props = { ...nativeProps, ref };
  // cloneElement forwards the callback ref; it never reads ref.current.
  // eslint-disable-next-line react-hooks/refs
  return child ? cloneElement(child, props) : <textarea {...props} />;
}

export function TextArea({
  variant = 'outline',
  size,
  invalid,
  autoResize = false,
  minRows,
  maxRows,
  resize,
  children,
  className,
  style,
  ...nativeProps
}: TextAreaProps) {
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const parts = flatten(children);
  const sentinels = parts.filter((part) => isValidElement(part) && part.type === TextAreaInput);
  invariant(sentinels.length <= 1, 'TextArea: TextArea.Input은 한 번만 명시할 수 있습니다.');
  invariant(
    parts.length === 0 || sentinels.length === 1,
    'TextArea: children require one TextArea.Input.',
  );
  for (const [name, value] of Object.entries({ minRows, maxRows })) {
    invariant(
      value == null || (Number.isInteger(value) && value > 0),
      `TextArea: ${name} must be a positive integer.`,
    );
  }
  invariant(
    minRows == null || maxRows == null || minRows <= maxRows,
    'TextArea: minRows must not exceed maxRows.',
  );
  useEffect(() => {
    if (import.meta.env.DEV && autoResize && resize != null && resize !== 'none') {
      console.warn('[IDS] TextArea: autoResize와 resize는 양립할 수 없습니다.');
    }
  }, [autoResize, resize]);

  const sentinel = sentinels[0] as ReactElement<TextArea.InputProps> | undefined;
  const { asChild, children: inputChild, ...inputProps } = sentinel?.props ?? {};
  let child: ReactElement<NativeProps> | undefined;
  if (asChild) {
    invariant(
      isValidElement<NativeProps>(inputChild) && inputChild.type !== Fragment,
      'TextArea.Input asChild requires one textarea or a component forwarding textarea props/ref.',
    );
    invariant(
      typeof inputChild.type !== 'string' || inputChild.type === 'textarea',
      'TextArea.Input asChild must render a textarea.',
    );
    child = inputChild;
  } else {
    invariant(inputChild == null, 'TextArea.Input uses value/defaultValue, not children.');
  }
  // Root native props own Field/RHF wiring; handlers and refs are composed child → Input → root.
  const merged: NativeProps = mergeProps(mergeProps({ ...child?.props }, inputProps), nativeProps);
  const ariaInvalid = merged['aria-invalid'] ?? invalid;
  const isInvalid = ariaInvalid != null && ariaInvalid !== false && ariaInvalid !== 'false';
  const inputIndex = sentinel ? parts.indexOf(sentinel) : -1;
  const top = sentinel ? parts.slice(0, inputIndex) : [];
  const bottom = sentinel ? parts.slice(inputIndex + 1) : [];
  return (
    <div
      data-text-area=""
      data-size={resolvedSize}
      data-variant={variant}
      data-disabled={merged.disabled ? '' : undefined}
      data-readonly={merged.readOnly ? '' : undefined}
      data-invalid={isInvalid ? '' : undefined}
      className={TextArea.Style({ variant, size: resolvedSize, className })}
      style={style}
    >
      {top.length > 0 && (
        <div data-text-area-part="top" className="border-b border-(--ids-color-outline) p-2">
          {top}
        </div>
      )}
      <InputElement
        child={child}
        options={{ autoResize, minRows, maxRows }}
        nativeProps={{
          ...merged,
          'aria-invalid': ariaInvalid,
          // Inline data attributes are attached below through a spread to retain native prop typing.
          ...{ 'data-text-area-input': '', 'data-size': resolvedSize },
          className: inputStyle({ size: resolvedSize, className: merged.className }),
          style: { ...merged.style, resize: autoResize ? 'none' : (resize ?? 'vertical') },
        }}
      />
      {bottom.length > 0 && (
        <div data-text-area-part="bottom" className="border-t border-(--ids-color-outline) p-2">
          {bottom}
        </div>
      )}
    </div>
  );
}

const inputStyle = tv({
  base: [
    'block box-border w-full min-w-0 border-0 bg-transparent text-inherit outline-none',
    'placeholder:text-(--ids-color-on-muted) disabled:cursor-not-allowed',
    'selection:bg-(--ids-color-primary)/30 selection:text-(--ids-color-on-surface)',
  ],
  variants: { size: { standard: 'min-h-20 px-3 py-2', tiny: 'min-h-16 px-2 py-1.5' } },
});

export namespace TextArea {
  export type Props = TextAreaProps;
  export type InputProps = NativeProps & { asChild?: boolean };
  export const Input = TextAreaInput;
  export const Style = tv({
    base: [
      'w-full min-w-0 text-(--ids-color-on-surface)',
      '[--ids-text-area-danger:var(--ids-field-danger,#b42318)]',
      '[[data-mode=dark]_&]:[--ids-text-area-danger:var(--ids-field-danger,#fda29b)]',
      'data-disabled:cursor-not-allowed data-disabled:opacity-40',
    ],
    variants: {
      variant: {
        outline:
          'inset-ring-1 inset-ring-(--ids-color-outline) hover:inset-ring-(--ids-color-primary)',
        filled:
          'bg-(--ids-color-primary)/10 inset-ring-1 inset-ring-transparent hover:bg-(--ids-color-primary)/15',
        unstyled:
          'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-(--ids-color-primary)',
      } satisfies Record<TextAreaVariant, string>,
      size: {
        standard: 'rounded-xl text-body-b2-regular',
        tiny: 'rounded-lg text-body-b3-regular',
      } satisfies Record<IdsSize, string>,
    },
    compoundVariants: [
      {
        variant: ['outline', 'filled'],
        class: [
          'has-[:focus-visible]:outline-2',
          'has-[:focus-visible]:outline-offset-2',
          'has-[:focus-visible]:outline-(--ids-color-primary)',
          'data-invalid:inset-ring-1 data-invalid:inset-ring-(--ids-text-area-danger)',
          'data-invalid:has-[:focus-visible]:outline-(--ids-text-area-danger)',
        ],
      },
    ],
  });
}
