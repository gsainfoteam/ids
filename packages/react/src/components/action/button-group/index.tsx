import { ButtonGroupRoot } from './root';
import { Group } from '../../utility/group';

export function ButtonGroup(props: ButtonGroup.Props) {
  return <ButtonGroupRoot {...props} />;
}

export namespace ButtonGroup {
  export type Props = Group.Props;
  export type SeparatorProps = Group.SeparatorProps;
  export type TextProps = Group.TextProps;

  export const Separator = Group.Separator;
  export const Text = Group.Text;
  export const Style = Group.Style;
}
