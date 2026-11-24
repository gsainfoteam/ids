import { type CheckedState } from './hooks/use-checkbox';
import { CheckboxIndicator, type CheckboxIndicatorProps } from './parts/indicator';
import { CheckboxRoot, type CheckboxVariant, type CheckboxState, type CheckboxProps } from './root';
import { checkboxStyle } from './style';

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
export type { CheckedState } from './hooks/use-checkbox';
