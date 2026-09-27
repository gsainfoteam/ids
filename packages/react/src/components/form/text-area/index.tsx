import {
  cloneElement,
  createContext,
  isValidElement,
  use,
  useId,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { omit } from 'es-toolkit';
import TextareaAutosize from 'react-textarea-autosize';

import {
  countState,
  useCountAnnouncement,
  useTextArea,
  type CountState,
  type TextAreaInputProps,
  type TextAreaResize,
} from './use-text-area';
import { fieldSurface, type FieldSurfaceVariant } from '../../../internal/field-surface';
import { messages } from '../../../internal/messages';
import {
  insetButtons,
  stateAttributes,
  type TextControlState,
} from '../../../internal/text-control';
import { cn, flattenFragments, invariant, tv } from '../../../utils';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

export type { TextAreaInputProps, TextAreaResize } from './use-text-area';
export type TextAreaVariant = FieldSurfaceVariant;
export type TextAreaState = TextControlState;
export type TextAreaCountState = CountState;

type StateValue<S, T> = T | ((state: S) => T);

type TextAreaContextValue = {
  inputProps: ReturnType<typeof useTextArea>['inputProps'];
  count: ReturnType<typeof useTextArea>['count'];
  countId: string;
  autoResize: boolean;
  minRows?: number;
  maxRows?: number;
  styles: ReturnType<typeof TextArea.Style>;
};

const TextAreaContext = createContext<TextAreaContextValue | null>(null);

function resolve<S, T>(value: StateValue<S, T>, state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}

function defaultAnnouncement(state: CountState) {
  if (state.remaining === undefined) return '';
  return state.atLimit
    ? messages.textArea.limitReached
    : messages.textArea.remaining(state.remaining);
}

function rowsToHeight(rows: number | undefined) {
  return rows == null ? undefined : `calc(${rows} * 1lh + var(--ids-text-area-pad-y) * 2)`;
}

function splitByInput(children: ReactNode) {
  const items = flattenFragments(children);
  const indexes = items.flatMap((child, index) =>
    isValidElement(child) && child.type === TextArea.Input ? [index] : [],
  );
  invariant(indexes.length <= 1, '`<TextArea>` accepts at most one `<TextArea.Input />`.');
  const index = indexes[0];
  if (index === undefined) return { items, top: [], input: <TextArea.Input />, bottom: items };
  return {
    items,
    top: items.slice(0, index),
    input: items[index] as ReactElement<TextArea.Input.Props>,
    bottom: items.slice(index + 1),
  };
}

export function TextArea({
  variant = 'outline',
  size: sizeProp,
  disabled,
  invalid,
  onValueChange,
  autoResize = true,
  resize,
  minRows,
  maxRows,
  rows = 3,
  className,
  style,
  children,
  ...rootProps
}: TextArea.Props) {
  const size = useFieldSize(sizeProp) ?? 'standard';
  const generatedId = useId();
  const { items, top, input, bottom } = splitByInput(children);
  const countNode = items.find(
    (item): item is ReactElement<TextArea.CountProps> =>
      isValidElement(item) && item.type === TextArea.Count,
  );
  const countId = countNode?.props.id ?? `ids-text-area-count-${generatedId}`;
  const field = useTextArea({
    rootProps: { ...rootProps, rows },
    input: input.props,
    disabled,
    invalid,
    onValueChange,
    autoResize,
    resize,
    minRows,
    maxRows,
    countId: countNode ? countId : undefined,
  });
  const state: TextAreaState = { size, variant, ...field.state };
  const styles = TextArea.Style({
    variant,
    size,
    resize: autoResize ? 'none' : (resize ?? 'vertical'),
  });

  return (
    <TextAreaContext
      value={{
        inputProps: field.inputProps,
        count: field.count,
        countId,
        autoResize,
        minRows,
        maxRows,
        styles,
      }}
    >
      <div
        data-text-area=""
        {...stateAttributes(state)}
        {...field.rootProps}
        className={styles.root({ className: resolve(className, state) })}
        style={resolve(style, state)}
      >
        <div data-text-area-top="" className={styles.bar({ position: 'top' })}>
          {top}
        </div>
        {input}
        <div data-text-area-bottom="" className={styles.bar({ position: 'bottom' })}>
          {bottom}
        </div>
      </div>
    </TextAreaContext>
  );
}

export namespace TextArea {
  export type Props = TextAreaInputProps & {
    variant?: TextAreaVariant;
    size?: IdsSize;
    disabled?: boolean;
    invalid?: boolean;
    onValueChange?: (value: string) => void;
    autoResize?: boolean;
    resize?: TextAreaResize;
    minRows?: number;
    maxRows?: number;
    children?: ReactNode;
    className?: StateValue<TextAreaState, string | undefined>;
    style?: StateValue<TextAreaState, CSSProperties | undefined>;
  };
  export type State = TextAreaState;
  export type Variant = TextAreaVariant;
  export type Resize = TextAreaResize;
  export type CountState = TextAreaCountState;
  export type CountProps = Omit<ComponentProps<'span'>, 'children' | 'className'> & {
    threshold?: number;
    announce?: (state: CountState) => string;
    className?: StateValue<CountState, string | undefined>;
    children?: StateValue<CountState, ReactNode>;
  };

  export function Input({ asChild, children, className, style }: Input.Props) {
    const context = use(TextAreaContext);
    invariant(context != null, '`<TextArea.Input>` must be used inside `<TextArea>`.');
    const { inputProps, autoResize, minRows, maxRows, styles } = context;
    const props = {
      ...inputProps,
      className: styles.input({ className: cn(inputProps.className, className) }),
      style: { ...inputProps.style, ...style },
    };
    const fixed = { ...props, style: { maxHeight: rowsToHeight(maxRows), ...props.style } };

    if (asChild === true) {
      invariant(
        isValidElement(children) &&
          (typeof children.type !== 'string' || children.type === 'textarea'),
        '`<TextArea.Input asChild>` requires one textarea, or a component forwarding textarea props and ref.',
      );
      if (children.type !== 'textarea') return cloneElement(children, autoResize ? props : fixed);
    } else {
      invariant(children == null, '`<TextArea.Input>` takes `value`/`defaultValue`, not children.');
    }
    if (!autoResize) return <textarea {...fixed} />;
    return (
      <TextareaAutosize
        {...props}
        style={omit(props.style, ['height', 'minHeight', 'maxHeight'])}
        minRows={minRows ?? props.rows}
        maxRows={maxRows}
      />
    );
  }

  export namespace Input {
    export type Props = TextAreaInputProps & {
      asChild?: boolean;
      children?: ReactNode;
      className?: string;
      style?: CSSProperties;
    };
  }

  export function Count({
    threshold,
    announce = defaultAnnouncement,
    className,
    children,
    id: _id,
    ...props
  }: CountProps) {
    const context = use(TextAreaContext);
    invariant(context != null, '`<TextArea.Count>` must be used inside `<TextArea>`.');
    const { count, countId, styles } = context;
    const state = countState(count.length, count.maxLength, threshold);
    const spoken = useCountAnnouncement(state.nearLimit ? announce(state) : '');

    return (
      <>
        <span
          {...props}
          id={countId}
          data-text-area-count=""
          data-near-limit={state.nearLimit ? '' : undefined}
          data-at-limit={state.atLimit ? '' : undefined}
          className={styles.count({ className: resolve(className, state) })}
        >
          {children === undefined
            ? messages.textArea.count(state.count, state.maxLength)
            : resolve(children, state)}
        </span>
        <span role="status" className="sr-only">
          {spoken}
        </span>
      </>
    );
  }

  export const Style = tv({
    slots: {
      root: [
        'flex w-full min-w-0 cursor-text flex-col overflow-hidden rounded-standard',
        fieldSurface.base,
      ],
      bar: [
        'flex shrink-0 items-center empty:hidden',
        'border-(--ids-color-border)',
        'not-has-[button]:text-(--ids-color-on-muted)',
        '[&_svg]:shrink-0',
        insetButtons.base,
      ],
      input: [
        'w-full min-w-0 grow resize-none bg-transparent outline-none',
        'text-inherit placeholder:text-(--ids-color-on-muted)',
        'selection:bg-(--ids-color-primary)/30 selection:text-(--ids-color-on-surface)',
        'disabled:cursor-not-allowed',
        'py-(--ids-text-area-pad-y)',
      ],
      count: [
        'ms-auto shrink-0 text-(--ids-color-on-muted) tabular-nums',
        'data-near-limit:text-(--ids-color-on-surface)',
      ],
    },
    variants: {
      variant: {
        outline: { root: fieldSurface.variant.outline },
        soft: { root: fieldSurface.variant.soft },
        ghost: { root: fieldSurface.variant.ghost },
      } satisfies Record<TextAreaVariant, object>,
      size: {
        standard: {
          root: 'text-body-b3-regular',
          bar: [
            'gap-1 px-3 py-1.5 [&_svg]:size-(--ids-size-icon-standard)',
            insetButtons.size.standard,
            '[&>:first-child:is(button,:has(button))]:-ms-1.5 [&>:last-child:is(button,:has(button))]:-me-1.5',
          ],
          input: 'px-3 [--ids-text-area-pad-y:0.5rem]',
          count: 'text-caption-c1-regular',
        },
        tiny: {
          root: 'text-caption-c1-regular',
          bar: [
            'gap-0.5 px-2 py-1 [&_svg]:size-(--ids-size-icon-tiny)',
            insetButtons.size.tiny,
            '[&>:first-child:is(button,:has(button))]:-ms-1 [&>:last-child:is(button,:has(button))]:-me-1',
          ],
          input: 'px-2 [--ids-text-area-pad-y:0.5rem]',
          count: 'text-caption-c2-regular',
        },
      } satisfies Record<IdsSize, object>,
      position: {
        top: { bar: 'border-b' },
        bottom: { bar: 'border-t' },
      },
      resize: {
        none: { root: 'resize-none' },
        vertical: { root: 'resize-y' },
        horizontal: { root: 'resize-x' },
        both: { root: 'resize' },
      } satisfies Record<TextAreaResize, object>,
    },
    defaultVariants: {
      variant: 'outline',
      size: 'standard',
      resize: 'none',
    },
  });
}

export type TextAreaProps = TextArea.Props;
