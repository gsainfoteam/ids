import { type ComponentProps } from 'react';

import { SpinnerRoot } from './root';
import { spinnerStyle } from './style';

import type { IdsSize } from '../../../tokens/types';

export function Spinner(props: Spinner.Props) {
  return <SpinnerRoot {...props} />;
}

export namespace Spinner {
  export type State = {
    size: IdsSize | undefined;
    announced: boolean;
  };

  export type Props = Omit<ComponentProps<'svg'>, 'children' | 'className' | 'width' | 'height'> & {
    size?: IdsSize;
    decorative?: boolean;
    className?: string | ((state: State) => string | undefined);
  };

  export const Style = spinnerStyle;
}
