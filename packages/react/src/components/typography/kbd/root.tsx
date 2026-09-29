'use client';

import { Fragment } from 'react';

import { GLYPH_ICONS } from './glyph-icons';
import { orderedKeys, splitGlyphs, type KbdLabel, type ResolvedKey } from './keys';
import { kbdStyle } from './style';
import { KbdGroupContext, useKbd } from './use-kbd';
import { messages } from '../../../internal/messages';

import type { Kbd } from '.';

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

export function KbdRoot({
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
  const ordered = keys ? orderedKeys(keys, kbd.platform) : [];
  const state: Kbd.State = {
    size: kbd.size,
    platform: kbd.platform,
    combination: ordered.length > 1,
  };
  const styles = kbdStyle({ size: kbd.size });

  if (ordered.length > 1) {
    const joiner = separator !== undefined ? separator : kbd.platform === 'mac' ? null : '+';
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

export function KbdGroup({
  size,
  platform,
  labels,
  className,
  children,
  ...rest
}: Kbd.Group.Props) {
  const kbd = useKbd({ size, platform, labels });
  const state: Kbd.State = { size: kbd.size, platform: kbd.platform, combination: true };
  return (
    <KbdGroupContext value={{ size: kbd.size, platform: kbd.platform, labels: kbd.labels }}>
      <kbd
        {...rest}
        data-kbd-group=""
        data-size={kbd.size}
        data-platform={kbd.platform}
        className={kbdStyle({ size: kbd.size }).group({ className: resolve(className, state) })}
      >
        {children}
      </kbd>
    </KbdGroupContext>
  );
}
