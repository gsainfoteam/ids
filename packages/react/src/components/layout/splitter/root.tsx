'use client';

import { isValidElement, type ComponentProps, type ReactElement, type ReactNode } from 'react';

import { HandleIndexContext, PanelIndexContext, SplitterContext } from './context';
import { useInternalSplitter, type SplitterOrientation } from './hooks/use-splitter';
import { useInternalSplitterRootRef } from './hooks/use-splitter-root-ref';
import { useInternalSplitterWarnings } from './hooks/use-splitter-warnings';
import { defaultTotalOf } from './lib/layout';
import { SplitterHandle, type SplitterHandleProps } from './parts/handle';
import { SplitterPanel, type SplitterPanelProps } from './parts/panel';
import { splitterStyle } from './style';
import { elementTypeOf, flattenFragments, mergeProps } from '../../../utils';

export type SplitterProps = Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange'> & {
  orientation?: SplitterOrientation;
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
};

const isPart =
  <P,>(type: unknown) =>
  (node: ReactNode): node is ReactElement<P> =>
    isValidElement(node) && elementTypeOf(node) === type;

const isPanel = isPart<SplitterPanelProps>(SplitterPanel);
const isHandle = isPart<SplitterHandleProps>(SplitterHandle);

function arrange(children: ReactNode) {
  const nodes = flattenFragments(children);
  const panels = nodes.filter(isPanel);
  const handleIds: Array<string | undefined> = [];
  const placed: ReactNode[] = [];
  let seen = 0;
  let gapHasHandle = false;
  let stray = 0;

  for (const node of nodes) {
    if (isPanel(node)) {
      if (seen > 0 && !gapHasHandle)
        placed.push(
          <HandleIndexContext key={`inserted-handle-${seen - 1}`} value={seen - 1}>
            <SplitterHandle />
          </HandleIndexContext>,
        );
      placed.push(
        <PanelIndexContext key={String(node.key)} value={seen}>
          {node}
        </PanelIndexContext>,
      );
      seen += 1;
      gapHasHandle = false;
    } else if (isHandle(node)) {
      const outsideAGap = seen === 0 || seen === panels.length || gapHasHandle;
      if (outsideAGap) {
        stray += 1;
        continue;
      }
      gapHasHandle = true;
      handleIds[seen - 1] = node.props.id;
      placed.push(
        <HandleIndexContext key={String(node.key)} value={seen - 1}>
          {node}
        </HandleIndexContext>,
      );
    } else {
      placed.push(node);
    }
  }

  return { panels: panels.map((panel) => panel.props), placed, handleIds, stray };
}

export function SplitterRoot({
  orientation = 'horizontal',
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  id,
  ref,
  className,
  children,
  ...props
}: SplitterProps) {
  const layout = arrange(children);
  const splitter = useInternalSplitter({
    id,
    orientation,
    value,
    defaultValue,
    onValueChange,
    onValueCommit,
    panels: layout.panels,
    handleIds: layout.handleIds,
  });

  const mergedRef = useInternalSplitterRootRef(splitter.rootRef, ref);

  useInternalSplitterWarnings({
    panelCount: layout.panels.length,
    defaultTotal: defaultTotalOf(defaultValue, layout.panels),
    stray: layout.stray,
  });

  const styles = splitterStyle({ orientation });

  return (
    <SplitterContext value={{ orientation, styles, splitter }}>
      <div
        {...mergeProps(props, splitter.rootProps)}
        ref={mergedRef}
        className={styles.root({ className })}
      >
        {layout.placed}
      </div>
    </SplitterContext>
  );
}
