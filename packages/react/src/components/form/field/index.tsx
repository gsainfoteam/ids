import { type FieldOrientation, type FieldState } from './context';
import { FieldDescription, type FieldDescriptionProps } from './description';
import { FieldError, type FieldErrorProps } from './error';
import { FieldHint, type FieldHintProps } from './hint';
import { FieldLabel, type FieldLabelProps } from './label';
import { FieldRoot, type FieldProps, type FieldErrorState } from './root';
import { fieldStyle } from './style';

import type { FieldValidityKey } from './control-state';

export function Field(props: FieldProps) {
  return <FieldRoot {...props} />;
}

export namespace Field {
  export type Props = FieldProps;
  export type State = FieldState;
  export type Orientation = FieldOrientation;
  export type ErrorState = FieldErrorState;
  export type ValidityKey = FieldValidityKey;

  export type LabelProps = FieldLabelProps;
  export type DescriptionProps = FieldDescriptionProps;
  export type HintProps = FieldHintProps;
  export type ErrorProps = FieldErrorProps;

  export const Label = FieldLabel;
  export const Description = FieldDescription;
  export const Hint = FieldHint;
  export const Error = FieldError;

  export const Style = fieldStyle;
}

export { FieldRoot, type FieldProps, type FieldErrorState } from './root';
export type { FieldOrientation, FieldState } from './context';
export type { FieldValidity, FieldValidityKey } from './control-state';
