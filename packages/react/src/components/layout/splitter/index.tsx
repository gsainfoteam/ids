import { SplitterHandle, type SplitterHandleProps } from './handle';
import { SplitterPanel, type SplitterPanelProps } from './panel';
import { SplitterRoot, type SplitterProps } from './root';
import { splitterStyle } from './style';
import { type SplitterOrientation } from './use-splitter';

export function Splitter(props: SplitterProps) {
  return <SplitterRoot {...props} />;
}

export namespace Splitter {
  export type Props = SplitterProps;
  export type Orientation = SplitterOrientation;

  export type PanelProps = SplitterPanelProps;
  export type HandleProps = SplitterHandleProps;

  export const Panel = SplitterPanel;
  export namespace Panel {
    export type Props = PanelProps;
  }

  export const Handle = SplitterHandle;
  export namespace Handle {
    export type Props = HandleProps;
  }

  export const Style = splitterStyle;
}

export type { SplitterProps } from './root';
export type { SplitterPanelProps } from './panel';
export type { SplitterHandleProps } from './handle';
export type { SplitterOrientation } from './use-splitter';
