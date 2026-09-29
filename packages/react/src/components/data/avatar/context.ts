import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { Avatar } from '.';
import type { avatarStyle } from './style';
import type { AvatarStatus } from './use-avatar';
import type { IdsSize } from '../../../tokens/types';

export type AvatarShape = 'circle' | 'square';

export type AvatarCutout = 'start' | 'end';

export type AvatarGroupContextValue = {
  size: IdsSize;
  shape: AvatarShape;
};

export const AvatarGroupContext = createContext<AvatarGroupContextValue | null>(null);

export const AvatarCutoutContext = createContext<AvatarCutout | undefined>(undefined);

type Context = {
  state: Avatar.State;
  name: string | undefined;
  imageSrc: string | undefined;
  report: (src: string, status: AvatarStatus) => void;
  styles: ReturnType<typeof avatarStyle>;
};

export const AvatarContext = createContext<Context | null>(null);

export function useAvatarContext(part: string) {
  const context = use(AvatarContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Avatar>\`.`);
  return context;
}
