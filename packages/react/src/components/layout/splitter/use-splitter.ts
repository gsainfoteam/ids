'use client';

import { useId, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';

import { normalizeProps, useMachine } from '@zag-js/react';
import { connect, machine, type PanelData } from '@zag-js/splitter';
import { isEqual } from 'es-toolkit';
import { flushSync } from 'react-dom';

import {
  fillSizes,
  handleRange,
  isCollapsed,
  keyTarget,
  moveHandle,
  type PanelConstraints,
} from './layout';
import { keyHandler, withModifiers, type KeyAction } from '../../../internal/keys';
import { useTranslate } from '../../../internal/translate';

export type SplitterOrientation = 'horizontal' | 'vertical';

export type SplitterPanelSpec = {
  id?: string;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  collapsible?: boolean;
  collapsedSize?: number;
};

export type UseSplitterOptions = {
  id?: string;
  orientation: SplitterOrientation;
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
  panels: readonly SplitterPanelSpec[];
  handleIds: ReadonlyArray<string | undefined>;
};

type Gesture = { from: readonly number[]; reported: number[] | null };

const KEY_STEP_PX = 16;
const KEY_STEP_LARGE_PX = 64;

const constraintsOf = (spec: SplitterPanelSpec): PanelConstraints => ({
  minSize: spec.minSize ?? 0,
  maxSize: spec.maxSize ?? 100,
  collapsible: spec.collapsible ?? false,
  collapsedSize: spec.collapsedSize ?? 0,
});

const zagPanelOf = (spec: SplitterPanelSpec, index: number): PanelData => ({
  id: String(index),
  minSize: spec.minSize,
  maxSize: spec.maxSize,
  collapsible: spec.collapsible,
  collapsedSize: spec.collapsedSize,
});

const triggerIdOf = (handle: number) => `${handle}:${handle + 1}` as const;

type StoredLayout = { count: number; initial: number[]; sizes: number[] };

function useLayout(
  value: number[] | undefined,
  defaultValue: number[] | undefined,
  panels: readonly SplitterPanelSpec[],
  onValueChange: ((value: number[]) => void) | undefined,
) {
  const count = panels.length;
  const resolveDefault = (): StoredLayout => {
    const initial = fillSizes(defaultValue ?? panels.map((panel) => panel.defaultSize), count);
    return { count, initial, sizes: initial };
  };
  const [stored, setStored] = useState(resolveDefault);

  let current = stored;
  if (stored.count !== count) {
    current = resolveDefault();
    setStored(current);
  }

  const change = (next: number[]) => {
    if (value === undefined) setStored((previous) => ({ ...previous, sizes: next }));
    onValueChange?.(next);
  };

  return {
    sizes: value === undefined ? current.sizes : fillSizes(value, count),
    initial: current.initial,
    change,
  };
}

export function useSplitter({
  id,
  orientation,
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  panels,
  handleIds,
}: UseSplitterOptions) {
  const t = useTranslate();
  const generatedId = useId();
  const baseId = id ?? `splitter-${generatedId}`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const dragFrom = useRef<readonly number[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);

  const constraints = panels.map(constraintsOf);
  const layout = useLayout(value, defaultValue, panels, onValueChange);
  const { sizes } = layout;

  const renderBeforeTheNextEvent = (size: number[]) => {
    if (gesture.current) gesture.current.reported = size;
    flushSync(() => layout.change(size));
  };

  const service = useMachine(machine, {
    id: generatedId,
    ids: {
      root: baseId,
      panel: (panel) => panels[Number(panel)]?.id ?? `${baseId}-panel-${panel}`,
      resizeTrigger: (trigger) => {
        const handle = Number(trigger.split(':')[0]);
        return handleIds[handle] ?? `${baseId}-handle-${handle}`;
      },
    },
    orientation,
    panels: panels.map(zagPanelOf),
    size: sizes,
    onResize: ({ size }) => renderBeforeTheNextEvent(size),
  });
  const api = connect(service, normalizeProps);

  const collapsed = constraints.map((panel, index) => isCollapsed(panel, sizes[index] ?? 0));
  const panelProps = constraints.map((_, index) => api.getPanelProps({ id: String(index) }));

  const beginGesture = () => {
    gesture.current ??= { from: sizes, reported: null };
  };

  const endGesture = () => {
    const ended = gesture.current;
    gesture.current = null;
    if (ended?.reported && !isEqual(ended.reported, ended.from)) onValueCommit?.(ended.reported);
  };

  const settle = (change: () => void) => {
    beginGesture();
    change();
    queueMicrotask(endGesture);
  };

  const measure = () => {
    const root = rootRef.current;
    if (!root) return null;
    const panelsShareWhatTheHandlesLeave = [
      ...root.querySelectorAll<HTMLElement>(':scope > [data-splitter-panel]'),
    ].reduce((total, element) => {
      const box = element.getBoundingClientRect();
      return total + (orientation === 'horizontal' ? box.width : box.height);
    }, 0);
    return {
      length: panelsShareWhatTheHandlesLeave,
      rtl: getComputedStyle(root).direction === 'rtl',
    };
  };

  const collapsibleAround = (handle: number) => {
    if (constraints[handle]?.collapsible) return handle;
    if (constraints[handle + 1]?.collapsible) return handle + 1;
    return null;
  };

  const togglePanel = (panel: number) => {
    const panelId = String(panel);
    if (isCollapsed(constraints[panel]!, api.getSizes()[panel] ?? 0)) api.expandPanel(panelId);
    else api.collapsePanel(panelId);
  };

  const resetLayout = () => api.setSizes([...layout.initial]);

  const moveHandleTo = (handle: number, from: readonly number[], target: number) => {
    const next = moveHandle(from, constraints, handle, target - from[handle]!);
    if (next) api.setSizes(next);
  };

  const onHandleKeyDown = (handle: number) => (event: KeyboardEvent<HTMLElement>) => {
    const group = measure();
    if (!group || group.length <= 0) return;

    const resizeBy =
      (direction: 1 | -1): KeyAction<HTMLElement> =>
      (keyEvent) => {
        const px = keyEvent.shiftKey ? KEY_STEP_LARGE_PX : KEY_STEP_PX;
        const delta = (direction * px * 100) / group.length;
        moveHandleTo(handle, sizes, keyTarget(sizes, constraints, handle, delta));
      };
    const moveTo = (edge: 'min' | 'max') => () =>
      moveHandleTo(handle, sizes, handleRange(sizes, constraints, handle)[edge]);
    const toggleNearest = () => {
      const panel = collapsibleAround(handle);
      if (panel === null) return false;
      togglePanel(panel);
    };
    const arrows =
      orientation === 'horizontal'
        ? { ArrowLeft: resizeBy(-1), ArrowRight: resizeBy(1) }
        : { ArrowUp: resizeBy(-1), ArrowDown: resizeBy(1) };

    const acted = keyHandler(
      {
        ...withModifiers(arrows, ['Shift']),
        Home: moveTo('min'),
        End: moveTo('max'),
        Enter: toggleNearest,
      },
      { dir: group.rtl ? 'rtl' : 'ltr' },
    )(event);
    if (acted) beginGesture();
  };

  const handle = (index: number) => {
    const {
      style: _zagInlineStyle,
      dir: _zagDefaultsToLtr,
      onPointerDown: _zagDragIgnoresRtl,
      onPointerUp: _zagDragEnd,
      onPointerOver: _zagHoverDelay,
      onPointerLeave: _zagHoverEnd,
      onKeyDown: _zagKeysMoveOnePercentWithAnyModifier,
      onBlur: zagBlur,
      ...attributes
    } = api.getResizeTriggerProps({ id: triggerIdOf(index) });
    const range = handleRange(sizes, constraints, index);
    const now = Math.round(range.now);
    const target = collapsibleAround(index);

    return {
      props: {
        ...attributes,
        'aria-orientation': orientation === 'horizontal' ? 'vertical' : 'horizontal',
        'aria-valuenow': now,
        'aria-valuemin': Math.round(range.min),
        'aria-valuemax': Math.round(range.max),
        'aria-valuetext': collapsed[index]
          ? t('splitter.collapsed')
          : t('splitter.value', { value: now }),
        'aria-controls': panelProps[index]?.id,
        'data-splitter-handle': '',
        'data-dragging': dragging === index ? '' : undefined,
        onKeyDown: onHandleKeyDown(index),
        onKeyUp: endGesture,
        onBlur: (event: FocusEvent<HTMLElement>) => {
          zagBlur?.(event);
          endGesture();
        },
        onDoubleClick: () => settle(resetLayout),
      },
      label: t('splitter.handle'),
      toggle:
        target === null
          ? null
          : {
              collapsed: collapsed[target] ?? false,
              before: target === index,
              label: collapsed[target] ? t('splitter.expand') : t('splitter.collapse'),
              controls: panelProps[target]?.id,
              onClick: () => settle(() => togglePanel(target)),
            },
      drag: {
        orientation,
        measure,
        onStart: () => {
          dragFrom.current = sizes;
          setDragging(index);
          beginGesture();
        },
        onMove: (percent: number) =>
          moveHandleTo(index, dragFrom.current, dragFrom.current[index]! + percent),
        onEnd: () => {
          setDragging(null);
          endGesture();
        },
      },
    };
  };

  const panel = (index: number) => {
    const { style: _zagFlexStyle, dir: _zagDefaultsToLtr, ...attributes } = panelProps[index]!;
    const size = sizes[index] ?? 0;

    return {
      props: {
        ...attributes,
        'data-splitter-panel': '',
        'data-collapsed': collapsed[index] ? '' : undefined,
        'data-dragging': dragging === null ? undefined : '',
        inert: size <= 0 || undefined,
      },
      size,
    };
  };

  const { style: _zagRootStyle, dir: _zagRootDir, ...rootAttributes } = api.getRootProps();

  return {
    rootRef,
    rootProps: {
      ...rootAttributes,
      'data-splitter': '',
      'data-dragging': dragging === null ? undefined : '',
    },
    sizes,
    dragging,
    panel,
    handle,
  };
}
