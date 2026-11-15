import { ButtonGroupRoot } from './root';
import { Group } from '../../utility/group';

export function ButtonGroup(props: ButtonGroup.Props) {
  return <ButtonGroupRoot {...props} />;
}

export namespace ButtonGroup {
  export type Props = Group.Props;
  export type SeparatorProps = Group.SeparatorProps;

  export const Separator = Group.Separator;
  export const Style = Group.Style;
}
