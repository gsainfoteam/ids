import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { type AvatarCutout } from './context';
import { type AvatarStatus } from './hooks/use-avatar';
import { AvatarFallback, type AvatarFallbackProps } from './parts/fallback';
import { AvatarImage, type AvatarImageProps } from './parts/image';
import { AvatarRoot } from './root';
import { avatarStyle } from './style';
import { type StateValue } from '../../../internal/lib/state-props';

import type { IdsSize } from '../../../tokens/types';

export function Avatar(props: Avatar.Props) {
  return <AvatarRoot {...props} />;
}

export namespace Avatar {
  export type Status = AvatarStatus;
  export type Cutout = AvatarCutout;

  export type State = { status: AvatarStatus; size: IdsSize };

  export type Props = Omit<ComponentProps<'span'>, 'className' | 'style' | 'children' | 'role'> & {
    src?: string;
    name?: string;
    alt?: string;
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
export { initialsOf } from './lib/initials';
export type { AvatarStatus } from './hooks/use-avatar';
