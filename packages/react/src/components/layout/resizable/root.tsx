'use client';

import {
  cloneElement,
  Fragment,
  isValidElement,
  useId,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { ResizableContext } from './context';
import { ResizableHandle } from './handle';
import { resizableStyle } from './style';
import { useResizable } from './use-resizable';
import { resolveState } from '../../../internal/state-props';
import { containsElementOfType, invariant, mergeProps, mergeRefs } from '../../../utils';

import type { Resizable } from '.';

type ResizedChild = ReactElement<{ id?: string; style?: CSSProperties; children?: ReactNode }>;

const HANDLE = new Set<unknown>([ResizableHandle]);

const pixels = (size: number | undefined) => (size === undefined ? undefined : `${size}px`);

export function ResizableRoot({
  direction = 'both',
  width,
  defaultWidth,
  onWidthChange,
  height,
  defaultHeight,
  onHeightChange,
  minWidth = 0,
  maxWidth = Infinity,
  minHeight = 0,
  maxHeight = Infinity,
  disabled = false,
  asChild = false,
  id,
  className,
  style,
  children,
  ref,
  ...props
}: Resizable.Props) {
  invariant(
    !asChild || (isValidElement(children) && children.type !== Fragment),
    '`<Resizable asChild>` requires one element to resize.',
  );

  const generatedId = useId();
  const child = asChild ? (children as ResizedChild) : null;
  const rootId = child?.props.id ?? id ?? `ids-resizable-${generatedId}`;
  const content = child ? child.props.children : children;
  const [dragging, setDragging] = useState(false);

  const resizable = useResizable({
    width: {
      value: width,
      defaultValue: defaultWidth,
      onChange: onWidthChange,
      min: minWidth,
      max: maxWidth,
    },
    height: {
      value: height,
      defaultValue: defaultHeight,
      onChange: onHeightChange,
      min: minHeight,
      max: maxHeight,
    },
    controls: rootId,
  });

  const state: Resizable.State = {
    direction,
    width: resizable.axes.width.size,
    height: resizable.axes.height.size,
    dragging,
    disabled,
  };
  const styles = resizableStyle({ direction });
  const size: CSSProperties = {
    ...(resizable.width !== undefined && { width: pixels(resizable.width) }),
    ...(resizable.height !== undefined && { height: pixels(resizable.height) }),
  };

  const rootProps = mergeProps(props, {
    // eslint-disable-next-line react-hooks/refs
    ref: mergeRefs(ref, resizable.setElement),
    id: rootId,
    'data-resizable': '',
    'data-direction': direction,
    'data-dragging': dragging ? '' : undefined,
    'data-disabled': disabled ? '' : undefined,
    className: styles.root({ className: resolveState(className, state) }),
    style: resolveState(style, state),
  });

  const structure = (
    <ResizableContext
      value={{ direction, disabled, axes: resizable.axes, styles, onDraggingChange: setDragging }}
    >
      {content}
      {!containsElementOfType(content, HANDLE) && <ResizableHandle />}
    </ResizableContext>
  );

  if (child) {
    const merged = mergeProps(rootProps, child.props);
    return cloneElement(child, { ...merged, style: { ...merged.style, ...size } }, structure);
  }

  return (
    <div {...rootProps} style={{ ...rootProps.style, ...size }}>
      {structure}
    </div>
  );
}
