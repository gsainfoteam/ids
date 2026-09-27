import { Group, useGroupNameWarning } from '../../utility/group';

export function ButtonGroup(props: ButtonGroup.Props) {
  useGroupNameWarning('ButtonGroup', props);
  return <Group {...props} />;
}

export namespace ButtonGroup {
  // orientation, attached, and the size and variant its buttons take unless they set their own.
  export type Props = Group.Props;
  export type SeparatorProps = Group.SeparatorProps;
  export type TextProps = Group.TextProps;

  export const Separator = Group.Separator;
  export const Text = Group.Text;
  export const Style = Group.Style;
}
