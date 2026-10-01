import { type CSSProperties, type ReactNode } from 'react';

import { TextAreaCount, type TextAreaCountProps } from './count';
import { TextAreaInput, type TextAreaInputPartProps } from './input';
import {
  TextAreaRoot,
  type TextAreaVariant,
  type TextAreaState,
  type TextAreaCountState,
} from './root';
import { type StateValue } from './state-value';
import { textAreaStyle } from './style';
import { type TextAreaInputProps, type TextAreaResize } from './use-text-area';

import type { IdsSize } from '../../../tokens/types';

export function TextArea(props: TextArea.Props) {
  return <TextAreaRoot {...props} />;
}

export namespace TextArea {
  export type Props = TextAreaInputProps & {
    variant?: TextAreaVariant;
    size?: IdsSize;
    disabled?: boolean;
    invalid?: boolean;
    onValueChange?: (value: string) => void;
    autoResize?: boolean;
    resize?: TextAreaResize;
    minRows?: number;
    maxRows?: number;
    children?: ReactNode;
    className?: StateValue<TextAreaState, string | undefined>;
    style?: StateValue<TextAreaState, CSSProperties | undefined>;
  };
  export type State = TextAreaState;
  export type Variant = TextAreaVariant;
  export type Resize = TextAreaResize;
  export type CountState = TextAreaCountState;
  export type CountProps = TextAreaCountProps;

  export const Input = TextAreaInput;
  export namespace Input {
    export type Props = TextAreaInputPartProps;
  }

  export const Count = TextAreaCount;

  export const Style = textAreaStyle;
}

export type { TextAreaVariant, TextAreaState, TextAreaCountState } from './root';
export type { TextAreaInputProps, TextAreaResize } from './use-text-area';

export type TextAreaProps = TextArea.Props;
