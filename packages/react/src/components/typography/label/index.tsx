import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { LabelRoot } from './root';
import { labelStyle } from './style';

import type { IdsSize } from '../../../tokens/types';

export function Label(props: Label.Props) {
  return <LabelRoot {...props} />;
}

export namespace Label {
  export type State = {
    disabled: boolean;
    required: boolean;
    invalid: boolean;
  };

  export type Props = Omit<ComponentProps<'label'>, 'className' | 'style'> & {
    size?: IdsSize;
    required?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    asChild?: boolean;
    className?: string | ((state: State) => string | undefined);
    style?: CSSProperties | ((state: State) => CSSProperties | undefined);
    children?: ReactNode;
  };

  export const Style = labelStyle;
}
