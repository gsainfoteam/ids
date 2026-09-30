'use client';

import { isValidElement, useId, type ReactElement, type ReactNode } from 'react';

import { TextAreaContext } from './context';
import { TextAreaCount, type TextAreaCountProps } from './count';
import { TextAreaInput, type TextAreaInputPartProps } from './input';
import { resolve } from './state-value';
import { textAreaStyle } from './style';
import { useTextArea, type CountState } from './use-text-area';
import { useTextAreaResize } from './use-text-area-resize';
import { stateAttributes, type TextControlState } from '../../../internal/text-control';
import { elementTypeOf, flattenFragments, invariant } from '../../../utils';
import { useFieldSize } from '../field/context';

import type { TextArea } from '.';
import type { FieldSurfaceVariant } from '../../../internal/field-surface';

export type TextAreaVariant = FieldSurfaceVariant;
export type TextAreaState = TextControlState;
export type TextAreaCountState = CountState;

function splitByInput(children: ReactNode) {
  const items = flattenFragments(children);
  const indexes = items.flatMap((child, index) =>
    isValidElement(child) && elementTypeOf(child) === TextAreaInput ? [index] : [],
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

export function TextAreaRoot({
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
      isValidElement(item) && elementTypeOf(item) === TextAreaCount,
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
  const resizeMode = autoResize ? 'none' : (resize ?? 'vertical');
  const { setShell, ...resizing } = useTextAreaResize({
    resize: resizeMode,
    disabled: field.state.disabled,
    shellId: `ids-text-area-shell-${generatedId}`,
    inputId: field.inputProps.id,
  });
  const styles = textAreaStyle({ variant, size, resize: resizeMode });
  const resizedWidth = resizing.width === undefined ? undefined : { width: `${resizing.width}px` };

  return (
    <TextAreaContext
      value={{
        inputProps: field.inputProps,
        count: field.count,
        countId,
        autoResize,
        minRows,
        maxRows,
        resize: resizing,
        styles,
      }}
    >
      <div
        ref={setShell}
        id={resizing.shellId}
        data-text-area=""
        {...stateAttributes(state)}
        {...field.rootProps}
        className={styles.root({ className: resolve(className, state) })}
        style={{ ...resolve(style, state), ...resizedWidth }}
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
