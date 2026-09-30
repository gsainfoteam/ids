'use client';

import {
  cloneElement,
  Fragment,
  isValidElement,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';

import { flushSync } from 'react-dom';

import { axisSeparatorProps, type ResizeAxis, type ResizeDimension } from './axis';
import { resizeGripStyle } from './style';
import {
  axisKeyMap,
  readingDirection,
  useAxesDrag,
  useAxisSeparator,
  type AxesDragOptions,
} from './use-resize-axes';
import { invariant, mergeProps, part } from '../../utils';
import { keyHandler, type KeyMap } from '../keys';
import { useTranslate } from '../translate';

export type ResizeGripProps = Omit<ComponentProps<'div'>, 'children'> & {
  axes: readonly ResizeAxis[];
  disabled?: boolean;
  onDraggingChange?: (dragging: boolean) => void;
  asChild?: boolean;
  children?: ReactNode;
};

type GripProps = Omit<ResizeGripProps, 'axes' | 'disabled' | 'onDraggingChange'> & {
  drag: AxesDragOptions;
};

function GripMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M9 1 1 9M9 5 5 9" />
    </svg>
  );
}

function OneAxisGrip({
  axis,
  drag,
  asChild = false,
  className,
  children,
  ...props
}: GripProps & { axis: ResizeAxis }) {
  const separator = useAxisSeparator(axis, drag);
  const styles = resizeGripStyle({ axes: axis.dimension === 'width' ? 'inline' : 'block' });

  return part(
    'div',
    asChild,
    children ?? <GripMark className={styles.mark()} />,
    mergeProps(props, {
      ...separator,
      'aria-label': props['aria-label'] ?? separator['aria-label'],
      'data-resize-grip': '',
      className: styles.grip({ className }),
    }),
  );
}

function TwoAxisGrip({
  axes,
  drag: options,
  asChild = false,
  className,
  children,
  ...props
}: GripProps & { axes: readonly ResizeAxis[] }) {
  const t = useTranslate();
  const drag = useAxesDrag(axes, options);
  const [focusedAxis, setFocusedAxis] = useState<ResizeDimension>(axes[0]!.dimension);
  const separators = useRef(new Map<ResizeDimension, HTMLElement>());
  const styles = resizeGripStyle({ axes: 'both' });
  const { disabled } = options;

  const resizeAndFocus = (axis: ResizeAxis) => (size: number) => {
    flushSync(() => {
      axis.resize(size);
      setFocusedAxis(axis.dimension);
    });
    separators.current.get(axis.dimension)?.focus();
  };

  const keysOn = (focused: ResizeAxis): KeyMap<HTMLElement> => ({
    ...Object.assign(
      {},
      ...axes
        .filter((axis) => axis !== focused)
        .map((axis) => axisKeyMap(axis, resizeAndFocus(axis))),
    ),
    ...axisKeyMap(focused, resizeAndFocus(focused)),
    Enter: () => {
      for (const axis of axes) axis.reset();
    },
  });

  const hiddenSeparators = axes.map((axis) => (
    <div
      key={axis.dimension}
      ref={(node) => {
        if (node) separators.current.set(axis.dimension, node);
        return () => {
          separators.current.delete(axis.dimension);
        };
      }}
      {...axisSeparatorProps(axis, t, disabled)}
      tabIndex={disabled ? undefined : axis.dimension === focusedAxis ? 0 : -1}
      className={styles.separator()}
      onFocus={() => setFocusedAxis(axis.dimension)}
      onKeyDown={(event) => {
        if (!disabled) keyHandler(keysOn(axis), readingDirection(event.currentTarget))(event);
      }}
    />
  ));

  const group = mergeProps(props, {
    ...drag.dragProps,
    role: 'group',
    'aria-label': props['aria-label'] ?? t('resizable.handle'),
    'aria-disabled': disabled || undefined,
    'data-resize-grip': '',
    'data-disabled': disabled ? '' : undefined,
    className: styles.grip({ className }),
  });

  if (!asChild)
    return (
      <div {...group}>
        {children ?? <GripMark className={styles.mark()} />}
        {hiddenSeparators}
      </div>
    );

  invariant(
    isValidElement<{ children?: ReactNode }>(children) && children.type !== Fragment,
    '`asChild` on a resize grip requires one element to draw the grip.',
  );
  const drawn = children as ReactElement<{ children?: ReactNode }>;
  return cloneElement(
    drawn,
    mergeProps(drawn.props as Record<string, unknown>, group),
    drawn.props.children,
    ...hiddenSeparators,
  );
}

export function ResizeGrip({
  axes,
  disabled = false,
  onDraggingChange,
  ...props
}: ResizeGripProps) {
  const [first] = axes;
  invariant(first, 'A resize grip needs at least one axis to resize.');

  const drag = { disabled, onDraggingChange };
  if (axes.length === 1) return <OneAxisGrip {...props} axis={first} drag={drag} />;
  return <TwoAxisGrip {...props} axes={axes} drag={drag} />;
}
