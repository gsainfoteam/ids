import {
  isValidElement,
  use,
  useEffect,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import {
  AvatarContext,
  AvatarCutoutContext,
  AvatarGroupContext,
  type AvatarCutout,
  type AvatarShape,
} from './context';
import { AvatarFallback, type AvatarFallbackProps } from './fallback';
import { AvatarImage, type AvatarImageProps } from './image';
import { avatarStyle } from './style';
import { useAvatarStatus, type AvatarStatus } from './use-avatar';
import { resolveState, type StateValue } from '../../../internal/state-props';
import { flattenFragments } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

import type { IdsSize } from '../../../tokens/types';

export { initialsOf } from './initials';
export type { AvatarShape } from './context';
export type { AvatarStatus } from './use-avatar';

const NOT_IN_STACK = undefined;

export function Avatar({
  src,
  name,
  alt,
  shape,
  size,
  onStatusChange,
  className,
  style,
  children,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
  ...rest
}: Avatar.Props) {
  const group = use(AvatarGroupContext);
  const cutout = use(AvatarCutoutContext);
  const resolvedShape = shape ?? group?.shape ?? 'circle';
  const resolvedSize = size ?? group?.size ?? 'standard';

  const nodes = flattenFragments(children);
  const image = nodes.find(
    (node): node is ReactElement<AvatarImageProps> =>
      isValidElement(node) && node.type === AvatarImage,
  );
  const hasFallback = nodes.some((node) => isValidElement(node) && node.type === AvatarFallback);
  const imageSrc = image?.props.src ?? src;
  const { status, report } = useAvatarStatus(imageSrc || undefined, onStatusChange);

  const decorative = alt === '' || ariaHidden === true || ariaHidden === 'true';
  const label = [ariaLabel, alt, name].find((candidate) => candidate?.trim());
  useEffect(() => {
    if (isDevelopment && !decorative && label === undefined)
      console.warn(
        '[IDS] Avatar: pass name, alt or aria-label so it has an accessible name, or alt="" when it is decorative.',
      );
  }, [decorative, label]);

  const state: Avatar.State = { status, shape: resolvedShape, size: resolvedSize };
  const styles = avatarStyle({
    shape: resolvedShape,
    size: resolvedSize,
    cutout: cutout ?? 'none',
  });

  return (
    <AvatarContext value={{ state, name, imageSrc: imageSrc || undefined, report, styles }}>
      <span
        {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label })}
        {...rest}
        data-avatar=""
        data-status={status}
        data-shape={resolvedShape}
        data-size={resolvedSize}
        data-cutout={cutout}
        className={styles.root({ className: resolveState(className, state) })}
        style={resolveState(style, state)}
      >
        <AvatarCutoutContext value={NOT_IN_STACK}>
          {image === undefined && imageSrc ? <AvatarImage /> : null}
          {nodes}
          {hasFallback ? null : <AvatarFallback />}
        </AvatarCutoutContext>
      </span>
    </AvatarContext>
  );
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
