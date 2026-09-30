'use client';

import {
  cloneElement,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { omit } from 'es-toolkit';
import TextareaAutosize from 'react-textarea-autosize';

import { useTextAreaContext } from './context';
import { cn, invariant, mergeRefs } from '../../../utils';
import { ScrollArea } from '../../layout/scroll-area';

import type { TextAreaInputProps } from './use-text-area';

export type TextAreaInputPartProps = TextAreaInputProps & {
  asChild?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const MEASURED_HEIGHTS = ['height', 'minHeight', 'maxHeight'] as const;

function rowsToHeight(rows: number | undefined) {
  return rows == null ? undefined : `calc(${rows} * 1lh + var(--ids-text-area-pad-y) * 2)`;
}

export function TextAreaInput({ asChild, children, className, style }: TextAreaInputPartProps) {
  const { inputProps, autoResize, minRows, maxRows, resize, styles } =
    useTextAreaContext('TextArea.Input');

  const props = {
    ...inputProps,
    className: styles.input({ className: cn(inputProps.className, className) }),
    style: { ...inputProps.style, ...style },
  };
  const resizedHeight = resize.height === undefined ? undefined : { height: `${resize.height}px` };
  const fixed = {
    ...props,
    ref: mergeRefs(props.ref, resize.setInput),
    style: { maxHeight: rowsToHeight(maxRows), ...props.style, ...resizedHeight },
  };

  const scrolled = (textarea: ReactElement) => (
    <ScrollArea className={styles.scrollArea()}>
      <ScrollArea.Viewport asChild>{textarea}</ScrollArea.Viewport>
    </ScrollArea>
  );

  if (asChild === true) {
    invariant(
      isValidElement(children) &&
        (typeof children.type !== 'string' || children.type === 'textarea'),
      '`<TextArea.Input asChild>` requires one textarea, or a component forwarding textarea props and ref.',
    );
    const rendersOwnTextarea = children.type !== 'textarea';
    if (rendersOwnTextarea) return scrolled(cloneElement(children, autoResize ? props : fixed));
  } else {
    invariant(children == null, '`<TextArea.Input>` takes `value`/`defaultValue`, not children.');
  }

  if (!autoResize) return scrolled(<textarea {...fixed} />);

  return scrolled(
    <TextareaAutosize
      {...props}
      style={omit(props.style, MEASURED_HEIGHTS)}
      minRows={minRows ?? props.rows}
      maxRows={maxRows}
    />,
  );
}

TextAreaInput.displayName = 'TextArea.Input';
