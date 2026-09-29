'use client';

import {
  isValidElement,
  useId,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { TextAreaContext } from './context';
import { TextAreaCount, type TextAreaCountProps } from './count';
import { TextAreaInput, type TextAreaInputPartProps } from './input';
import { resolve, type StateValue } from './state-value';
import { textAreaStyle } from './style';
import {
  useTextArea,
  type CountState,
  type TextAreaInputProps,
  type TextAreaResize,
} from './use-text-area';
import { stateAttributes, type TextControlState } from '../../../internal/text-control';
import { flattenFragments, invariant } from '../../../utils';
import { useFieldSize } from '../field/context';

import type { FieldSurfaceVariant } from '../../../internal/field-surface';
import type { IdsSize } from '../../../tokens/types';

export type { TextAreaInputProps, TextAreaResize } from './use-text-area';
export type TextAreaVariant = FieldSurfaceVariant;
export type TextAreaState = TextControlState;
export type TextAreaCountState = CountState;

function splitByInput(children: ReactNode) {
  const items = flattenFragments(children);
  const indexes = items.flatMap((child, index) =>
    isValidElement(child) && child.type === TextAreaInput ? [index] : [],
  );
  invariant(indexes.length <= 1, '`<TextArea>` accepts at most one `<TextArea.Input />`.');
  const index = indexes[0];
  if (index === undefined) return { items, top: [], input: <TextAreaInput />, bottom: items };
  return {
    items,
    top: items.slice(0, index),
    input: items[index] as ReactElement<TextAreaInputPartProps>,
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
    (item): item is ReactElement<TextAreaCountProps> =>
      isValidElement(item) && item.type === TextAreaCount,
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
  const styles = textAreaStyle({
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
  export type CountProps = TextAreaCountProps;

  export const Input = TextAreaInput;
  export namespace Input {
    export type Props = TextAreaInputPartProps;
  }

  export const Count = TextAreaCount;

  export const Style = textAreaStyle;
}

export type TextAreaProps = TextArea.Props;
