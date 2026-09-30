'use client';

import {
  isValidElement,
  useCallback,
  useEffect,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';

import { HandleIndexContext, PanelIndexContext, SplitterContext } from './context';
import { SplitterHandle, type SplitterHandleProps } from './handle';
import { sameSize } from './layout';
import { SplitterPanel, type SplitterPanelProps } from './panel';
import { splitterStyle } from './style';
import { useSplitter, type SplitterOrientation } from './use-splitter';
import { elementTypeOf, flattenFragments, mergeProps, mergeRefs } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

export type SplitterProps = Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange'> & {
  orientation?: SplitterOrientation;
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
};

const FEWEST_PANELS = 2;
const WHOLE = 100;

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

function useDevelopmentWarning(message: string | false) {
  useEffect(() => {
    if (isDevelopment && message) console.warn(`[IDS] ${message}`);
  }, [message]);
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
  const splitter = useSplitter({
    id,
    orientation,
    value,
    defaultValue,
    onValueChange,
    onValueCommit,
    panels: layout.panels,
    handleIds: layout.handleIds,
  });

  const { rootRef } = splitter;
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(rootRef, ref)(node),
    [rootRef, ref],
  );

  const panelCount = layout.panels.length;
  const givenDefaults = (defaultValue ?? layout.panels.map((panel) => panel.defaultSize)).filter(
    (size): size is number => size !== undefined,
  );
  const defaultTotal = givenDefaults.reduce((total, size) => total + size, 0);

  useDevelopmentWarning(
    panelCount < FEWEST_PANELS &&
      `Splitter needs at least two Splitter.Panel children; it has ${panelCount}.`,
  );
  useDevelopmentWarning(
    defaultTotal > WHOLE &&
      !sameSize(defaultTotal, WHOLE) &&
      `Splitter: the default sizes add up to ${defaultTotal}%, past 100%. They are scaled down to fit.`,
  );
  useDevelopmentWarning(
    layout.stray > 0 &&
      `Splitter: ${layout.stray} Splitter.Handle not drawn. A handle goes between two panels, one per gap.`,
  );

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
