import { type SplitterOrientation } from './hooks/use-splitter';
import { SplitterHandle, type SplitterHandleProps } from './parts/handle';
import { SplitterPanel, type SplitterPanelProps } from './parts/panel';
import { SplitterRoot, type SplitterProps } from './root';
import { splitterStyle } from './style';

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
export type { SplitterPanelProps } from './parts/panel';
export type { SplitterHandleProps } from './parts/handle';
export type { SplitterOrientation } from './hooks/use-splitter';
