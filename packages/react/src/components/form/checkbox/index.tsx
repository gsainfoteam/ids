import { CheckboxIndicator, type CheckboxIndicatorProps } from './indicator';
import { CheckboxRoot, type CheckboxVariant, type CheckboxState, type CheckboxProps } from './root';
import { checkboxStyle } from './style';
import { type CheckedState } from './use-checkbox';

export function Checkbox(props: CheckboxProps) {
  return <CheckboxRoot {...props} />;
}

export namespace Checkbox {
  export type Props = CheckboxProps;
  export type State = CheckboxState;
  export type Variant = CheckboxVariant;
  export type Checked = CheckedState;

  export type IndicatorProps = CheckboxIndicatorProps;

  export const Indicator = CheckboxIndicator;
  export namespace Indicator {
    export type Props = IndicatorProps;
  }

  export const Style = checkboxStyle;
}

export type { CheckboxVariant, CheckboxState, CheckboxProps } from './root';
export type { CheckedState } from './use-checkbox';
