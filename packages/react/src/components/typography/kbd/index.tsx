import { Fragment, type ComponentProps, type ReactNode } from 'react';

import { GLYPH_ICONS } from './glyph-icons';
import {
  orderKeys,
  parseKeys,
  splitGlyphs,
  type KbdLabel,
  type KbdLabels,
  type KbdPlatform,
  type ResolvedKey,
} from './keys';
import { KbdGroupContext, useKbd } from './use-kbd';
import { messages } from '../../../internal/messages';
import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export type { KbdLabel, KbdLabels, KbdPlatform } from './keys';

function resolve<T, S>(value: T | ((state: S) => T), state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}

type GlyphProps = { glyph: string; name: string; iconClassName: string | undefined };

function GlyphReadAsName({ glyph, name, iconClassName }: GlyphProps) {
  const Icon = GLYPH_ICONS[glyph];

  return (
    <>
      {Icon ? (
        <Icon aria-hidden="true" data-kbd-glyph={glyph} className={iconClassName} />
      ) : (
        <span aria-hidden="true">{glyph}</span>
      )}
      <span className="sr-only"> {name} </span>
    </>
  );
}

type FaceProps = {
  keyInfo: ResolvedKey;
  name: (label: KbdLabel) => string;
  iconClassName: string | undefined;
};

function Face({ keyInfo, name, iconClassName }: FaceProps) {
  return keyInfo.label === undefined ? (
    keyInfo.glyph
  ) : (
    <GlyphReadAsName
      glyph={keyInfo.glyph}
      name={name(keyInfo.label)}
      iconClassName={iconClassName}
    />
  );
}

export function Kbd({
  keys,
  size,
  platform,
  labels,
  separator,
  className,
  children,
  ...rest
}: Kbd.Props) {
  const kbd = useKbd({ size, platform, labels });
  const name = (label: KbdLabel) => kbd.labels[label] ?? messages.kbd[label];
  const ordered = keys === undefined ? [] : orderKeys(parseKeys(keys), kbd.platform);
  const state: Kbd.State = {
    size: kbd.size,
    platform: kbd.platform,
    combination: ordered.length > 1,
  };
  const styles = Kbd.Style({ size: kbd.size });

  if (ordered.length > 1) {
    const joiner = separator !== undefined ? separator : kbd.platform === 'apple' ? null : '+';
    return (
      <kbd
        {...rest}
        data-kbd-group=""
        data-size={kbd.size}
        data-platform={kbd.platform}
        className={styles.group({ className: resolve(className, state) })}
      >
        {ordered.map((keyInfo, index) => (
          <Fragment key={`${index}:${keyInfo.id}`}>
            {index > 0 && joiner !== null && (
              <span data-kbd-separator="" className={styles.separator()}>
                {joiner}
              </span>
            )}
            <kbd data-kbd="" className={styles.root()}>
              <span className={styles.face()}>
                <Face keyInfo={keyInfo} name={name} iconClassName={styles.glyph()} />
              </span>
            </kbd>
          </Fragment>
        ))}
      </kbd>
    );
  }

  const content =
    ordered.length === 1 ? (
      <Face keyInfo={ordered[0]!} name={name} iconClassName={styles.glyph()} />
    ) : typeof children === 'string' ? (
      splitGlyphs(children, kbd.platform).map((segment, index) =>
        segment.label === undefined ? (
          segment.text
        ) : (
          <GlyphReadAsName
            key={index}
            glyph={segment.text}
            name={name(segment.label)}
            iconClassName={styles.glyph()}
          />
        ),
      )
    ) : (
      children
    );

  return (
    <kbd
      {...rest}
      data-kbd=""
      data-size={kbd.size}
      data-platform={kbd.platform}
      className={styles.root({ className: resolve(className, state) })}
    >
      <span className={styles.face()}>{content}</span>
    </kbd>
  );
}

export namespace Kbd {
  export type Platform = KbdPlatform;
  export type Labels = KbdLabels;

  export type State = {
    size: IdsSize;
    platform: Platform;
    combination: boolean;
  };

  export type Props = Omit<ComponentProps<'kbd'>, 'className'> & {
    keys?: string | readonly string[];
    size?: IdsSize;
    platform?: Platform;
    labels?: Labels;
    separator?: ReactNode;
    className?: string | ((state: State) => string | undefined);
  };

  export function Group({ size, platform, labels, className, children, ...rest }: Group.Props) {
    const kbd = useKbd({ size, platform, labels });
    const state: State = { size: kbd.size, platform: kbd.platform, combination: true };
    return (
      <KbdGroupContext value={{ size: kbd.size, platform: kbd.platform, labels: kbd.labels }}>
        <kbd
          {...rest}
          data-kbd-group=""
          data-size={kbd.size}
          data-platform={kbd.platform}
          className={Style({ size: kbd.size }).group({ className: resolve(className, state) })}
        >
          {children}
        </kbd>
      </KbdGroupContext>
    );
  }
  export namespace Group {
    export type Props = Omit<ComponentProps<'kbd'>, 'className'> & {
      size?: IdsSize;
      platform?: Platform;
      labels?: Labels;
      className?: string | ((state: State) => string | undefined);
    };
  }

  export const Style = tv({
    slots: {
      root: [
        'relative inline-flex w-fit shrink-0 items-center justify-center before:self-end',
        'rounded-indicator bg-current/10 font-sans text-current/75 select-none',
      ],
      face: 'inline-flex items-center gap-0.5',
      group: 'inline-flex items-center gap-1',
      glyph: 'shrink-0',
      separator: 'text-current/60 select-none',
    },
    variants: {
      size: {
        standard: {
          root: 'h-5 min-w-5 px-1 align-[calc(0.5cap-10px)]',
          face: 'text-caption-c1-medium',
          group: 'align-[calc(0.5cap-10px)]',
          glyph: 'size-3!',
          separator: 'text-caption-c1-regular',
        },
        tiny: {
          root: 'h-4 min-w-4 px-0.5 align-[calc(0.5cap-8px)]',
          face: 'text-caption-c2-medium',
          group: 'align-[calc(0.5cap-8px)]',
          glyph: 'size-2.5!',
          separator: 'text-caption-c2-regular',
        },
      } satisfies Record<IdsSize, object>,
    },
    defaultVariants: { size: 'standard' },
  });
}
