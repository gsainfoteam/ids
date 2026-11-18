import { type ComponentProps } from 'react';

import { FieldGroupRoot } from './root';
import { fieldGroupStyle } from './style';

import type { FieldOrientation } from '../field/context';

export function FieldGroup(props: FieldGroup.Props) {
  return <FieldGroupRoot {...props} />;
}

export namespace FieldGroup {
  export type Orientation = FieldOrientation;

  export type Props = ComponentProps<'div'> & { orientation?: FieldOrientation };

  export const Style = fieldGroupStyle;
}
