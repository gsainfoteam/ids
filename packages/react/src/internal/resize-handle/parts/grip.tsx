'use client';

import {
  cloneElement,
  Fragment,
  isValidElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';

import { invariant, mergeProps } from '../../../utils';
import { useInternalTranslate } from '../../translate';
import { useInternalAxesDrag, useInternalCornerShape } from '../hooks/use-resize-axes';
import { useInternalResizeGripSeparators } from '../hooks/use-resize-grip-separators';
import {
  GRIP_HALO,
  GRIP_STROKE,
  GRIP_TARGET,
  gripArc,
  sizedToArc,
  type GripArc,
  type ResizeBand,
} from '../lib/arc';
import { axisSeparatorProps, type ResizeAxis } from '../lib/axis';
import { resizeGripStyle } from '../style';

export type ResizeGripProps = Omit<ComponentProps<'div'>, 'children'> & {
  axes: readonly [ResizeAxis, ResizeAxis];
  corner: HTMLElement | null;
  band?: ResizeBand;
  disabled?: boolean;
  onDraggingChange?: (dragging: boolean) => void;
  asChild?: boolean;
  children?: ReactNode;
};

type Styles = ReturnType<typeof resizeGripStyle>;

const HALO_WIDTH = GRIP_STROKE + 2 * GRIP_HALO;

function Arc({ arc, styles }: { arc: GripArc; styles: Styles }) {
  return (
    <svg
      aria-hidden="true"
      width={arc.view}
      height={arc.view}
      viewBox={`0 0 ${arc.view} ${arc.view}`}
      fill="none"
      className={styles.drawing()}
      style={{ top: -arc.bleed, left: -arc.bleed }}
    >
      <path
        d={arc.arc}
        strokeWidth={HALO_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        data-resize-grip-halo=""
        className={styles.halo()}
      />
      <path
        d={arc.arc}
        strokeWidth={GRIP_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        data-resize-grip-arc=""
        className={styles.arc()}
      />
      <path
        d={arc.target}
        stroke="transparent"
        strokeWidth={GRIP_TARGET}
        pointerEvents="stroke"
        data-resize-grip-target=""
        className={styles.target()}
      />
    </svg>
  );
}

export function ResizeGrip({
  axes,
  corner,
  band = 'centered',
  disabled = false,
  onDraggingChange,
  asChild = false,
  className,
  style,
  children,
  ...props
}: ResizeGripProps) {
  const t = useInternalTranslate();
  const custom = asChild || children != null;
  const shape = useInternalCornerShape(corner);
  const arc = shape === null || custom ? null : gripArc(shape.radius, band, shape.exponent);
  const drag = useInternalAxesDrag(axes, { disabled, onDraggingChange });
  const separator = useInternalResizeGripSeparators(axes, disabled);
  const styles = resizeGripStyle({ custom });

  const hiddenSeparators = axes.map((axis) => (
    <div
      key={axis.dimension}
      {...axisSeparatorProps(axis, t, disabled)}
      {...separator(axis)}
      className={styles.separator()}
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
    style: sizedToArc(style, arc),
  });

  if (!asChild)
    return (
      <div {...group}>
        {children ?? (arc && <Arc arc={arc} styles={styles} />)}
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
