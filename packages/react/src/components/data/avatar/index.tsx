import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { type AvatarCutout, type AvatarShape } from './context';
import { AvatarFallback, type AvatarFallbackProps } from './fallback';
import { AvatarImage, type AvatarImageProps } from './image';
import { AvatarRoot } from './root';
import { avatarStyle } from './style';
import { type AvatarStatus } from './use-avatar';
import { type StateValue } from '../../../internal/state-props';

import type { IdsSize } from '../../../tokens/types';

export function Avatar(props: Avatar.Props) {
  return <AvatarRoot {...props} />;
}

export namespace Avatar {
  export type Shape = AvatarShape;
  export type Status = AvatarStatus;
  export type Cutout = AvatarCutout;

  export type State = { status: AvatarStatus; shape: AvatarShape; size: IdsSize };

  export type Props = Omit<ComponentProps<'span'>, 'className' | 'style' | 'children' | 'role'> & {
    src?: string;
    name?: string;
    alt?: string;
    shape?: AvatarShape;
    size?: IdsSize;
    onStatusChange?: (status: AvatarStatus) => void;
    className?: StateValue<string | undefined, State>;
    style?: StateValue<CSSProperties | undefined, State>;
    children?: ReactNode;
  };

  export const Image = AvatarImage;
  export namespace Image {
    export type Props = AvatarImageProps;
  }

  export const Fallback = AvatarFallback;
  export namespace Fallback {
    export type Props = AvatarFallbackProps;
  }

  export const Style = avatarStyle;
}
export { initialsOf } from './initials';
export type { AvatarShape } from './context';
export type { AvatarStatus } from './use-avatar';
