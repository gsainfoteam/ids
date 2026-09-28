import {
  createContext,
  isValidElement,
  use,
  useCallback,
  useEffect,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { UserIcon } from '@heroicons/react/24/solid';

import {
  AvatarCutoutContext,
  AvatarGroupContext,
  type AvatarCutout,
  type AvatarShape,
} from './context';
import { initialsOf } from './initials';
import {
  useAvatarStatus,
  useFallbackVisible,
  useImageSettledBeforeMount,
  type AvatarStatus,
} from './use-avatar';
import { resolveState, type StateValue } from '../../../internal/state-props';
import { cn, flattenFragments, invariant, mergeRefs, tv } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { Slot } from '../../utility/slot';

import type { IdsSize } from '../../../tokens/types';

export { initialsOf } from './initials';
export type { AvatarShape } from './context';
export type { AvatarStatus } from './use-avatar';

type Context = {
  state: Avatar.State;
  name: string | undefined;
  imageSrc: string | undefined;
  report: (src: string, status: AvatarStatus) => void;
  styles: ReturnType<typeof Avatar.Style>;
};

const AvatarContext = createContext<Context | null>(null);

function useAvatarContext(part: string) {
  const context = use(AvatarContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Avatar>\`.`);
  return context;
}

const FALLBACK_DELAY = 600;
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
    (node): node is ReactElement<Avatar.Image.Props> =>
      isValidElement(node) && node.type === Avatar.Image,
  );
  const hasFallback = nodes.some((node) => isValidElement(node) && node.type === Avatar.Fallback);
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
  const styles = Avatar.Style({
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
          {image === undefined && imageSrc ? <Avatar.Image /> : null}
          {nodes}
          {hasFallback ? null : <Avatar.Fallback />}
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

  export function Image({ src, className, style, onLoad, onError, ref, ...rest }: Image.Props) {
    const { state, imageSrc, report, styles } = useAvatarContext('Avatar.Image');
    const current = src || imageSrc;
    const imageRef = useRef<HTMLImageElement>(null);
    const mergedRef = useCallback(
      (node: HTMLImageElement | null) => mergeRefs(imageRef, ref)(node),
      [ref],
    );
    useImageSettledBeforeMount(imageRef, current, report);

    if (!current || state.status === 'error') return null;
    return (
      <img
        key={current}
        alt=""
        loading="lazy"
        decoding="async"
        {...rest}
        ref={mergedRef}
        src={current}
        data-avatar-image=""
        data-status={state.status}
        onLoad={(event) => {
          report(current, 'loaded');
          onLoad?.(event);
        }}
        onError={(event) => {
          report(current, 'error');
          onError?.(event);
        }}
        className={styles.image({ className: resolveState(className, state) })}
        style={resolveState(style, state)}
      />
    );
  }

  export namespace Image {
    export type Props = Omit<ComponentProps<'img'>, 'className' | 'style' | 'alt'> & {
      className?: StateValue<string | undefined, State>;
      style?: StateValue<CSSProperties | undefined, State>;
    };
  }

  export function Fallback({
    delay = FALLBACK_DELAY,
    asChild,
    className,
    style,
    children,
    ...rest
  }: Fallback.Props) {
    const { state, name, imageSrc, styles } = useAvatarContext('Avatar.Fallback');
    const visible = useFallbackVisible(state.status, imageSrc, delay);
    if (!visible) return null;

    const initials = name === undefined ? '' : initialsOf(name);
    const content = resolveState(children, state) ?? (initials || <UserIcon />);
    const props = {
      'aria-hidden': true,
      ...rest,
      'data-avatar-fallback': '',
      className: styles.fallback({ className: resolveState(className, state) }),
      style: resolveState(style, state),
    };
    if (asChild === true) return <Slot {...props}>{content}</Slot>;
    return <span {...props}>{content}</span>;
  }

  export namespace Fallback {
    export type Props = Omit<ComponentProps<'span'>, 'className' | 'style' | 'children'> & {
      delay?: number;
      asChild?: boolean;
      className?: StateValue<string | undefined, State>;
      style?: StateValue<CSSProperties | undefined, State>;
      children?: StateValue<ReactNode, State>;
    };
  }

  const circleMask = cn(
    '[mask-image:radial-gradient(50%_50%_at_var(--avatar-hole-x)_50%,transparent_calc(100%_+_var(--ag-gap)),#000_calc(100%_+_var(--ag-gap)_+_0.5px))]',
  );
  const squareMask = cn(
    '[mask-image:linear-gradient(to_var(--avatar-band),transparent_calc(var(--ag-overlap)_+_var(--ag-gap)),#000_0),radial-gradient(circle_calc(var(--avatar-radius)_+_var(--ag-gap))_at_var(--avatar-corner-x)_100%,transparent_100%,#000_calc(100%_+_0.5px)),radial-gradient(circle_calc(var(--avatar-radius)_+_var(--ag-gap))_at_var(--avatar-corner-x)_0%,transparent_100%,#000_calc(100%_+_0.5px))]',
    '[mask-size:100%_100%,100%_var(--avatar-radius),100%_var(--avatar-radius)]',
    '[mask-position:0_0,0_0,0_100%] [mask-repeat:no-repeat]',
  );

  export const Style = tv({
    slots: {
      root: [
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden align-middle',
        'bg-(--ids-color-muted) text-(--ids-color-on-muted) select-none @container',
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]',
        'after:inset-ring-1 after:inset-ring-(--ids-color-on-surface)/8',
      ],
      image: 'absolute inset-0 size-full object-cover',
      fallback: [
        'inline-flex size-full items-center justify-center font-medium',
        'text-[length:max(10px,40cqi)] leading-none [&_svg]:size-[62%]',
      ],
    },
    variants: {
      shape: {
        circle: { root: 'rounded-full' },
        square: { root: 'rounded-(--avatar-radius)' },
      } satisfies Record<AvatarShape, object>,
      size: {
        standard: { root: 'size-10 [--avatar-radius:var(--ids-radius-standard)]' },
        tiny: { root: 'size-6 [--avatar-radius:var(--ids-radius-indicator)]' },
      } satisfies Record<IdsSize, object>,
      cutout: { start: {}, end: {}, none: {} },
    },
    compoundVariants: [
      { shape: 'circle', cutout: ['start', 'end'], class: { root: circleMask } },
      { shape: 'square', cutout: ['start', 'end'], class: { root: squareMask } },
      {
        shape: 'circle',
        cutout: 'start',
        class: {
          root: 'ltr:[--avatar-hole-x:calc(var(--ag-overlap)_-_50%)] rtl:[--avatar-hole-x:calc(150%_-_var(--ag-overlap))]',
        },
      },
      {
        shape: 'circle',
        cutout: 'end',
        class: {
          root: 'ltr:[--avatar-hole-x:calc(150%_-_var(--ag-overlap))] rtl:[--avatar-hole-x:calc(var(--ag-overlap)_-_50%)]',
        },
      },
      {
        shape: 'square',
        cutout: 'start',
        class: {
          root: [
            'ltr:[--avatar-band:right] rtl:[--avatar-band:left]',
            'ltr:[--avatar-corner-x:calc(var(--ag-overlap)_-_var(--avatar-radius))]',
            'rtl:[--avatar-corner-x:calc(100%_-_var(--ag-overlap)_+_var(--avatar-radius))]',
          ],
        },
      },
      {
        shape: 'square',
        cutout: 'end',
        class: {
          root: [
            'ltr:[--avatar-band:left] rtl:[--avatar-band:right]',
            'ltr:[--avatar-corner-x:calc(100%_-_var(--ag-overlap)_+_var(--avatar-radius))]',
            'rtl:[--avatar-corner-x:calc(var(--ag-overlap)_-_var(--avatar-radius))]',
          ],
        },
      },
    ],
    defaultVariants: { shape: 'circle', size: 'standard', cutout: 'none' },
  });
}
