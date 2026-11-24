'use client';

import { cloneElement, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react';

import { KbdStyleContext } from './context';
import { GLYPH_ICONS } from './glyph-icons';
import { orderedKeys, splitGlyphs, type KbdLabel, type ResolvedKey } from './keys';
import { KbdSeparator, type KbdSeparatorProps } from './separator';
import { kbdStyle } from './style';
import { useKbd } from './use-kbd';
import { useTranslate } from '../../../internal/translate';
import { elementTypeOf, flattenFragments } from '../../../utils';
import { kbdGroupStyle } from '../kbd-group/style';

import type { Kbd } from '.';

function resolve<T, S>(value: T | ((state: S) => T), state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}

const separatorIn = (children: ReactNode) =>
  flattenFragments(children).find(
    (child): child is ReactElement<KbdSeparatorProps> =>
      isValidElement(child) && elementTypeOf(child) === KbdSeparator,
  );

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

export function KbdRoot({ keys, size, platform, labels, className, children, ...rest }: Kbd.Props) {
  const t = useTranslate();
  const kbd = useKbd({ size, platform, labels });
  const name = (label: KbdLabel) => kbd.labels[label] ?? t(`kbd.${label}`);
  const ordered = keys ? orderedKeys(keys, kbd.platform) : [];
  const state: Kbd.State = {
    size: kbd.size,
    platform: kbd.platform,
    combination: ordered.length > 1,
  };
  const styles = kbdStyle({ size: kbd.size });

  if (ordered.length > 1) {
    const written = separatorIn(children);
    const joiner = written ?? (kbd.platform === 'mac' ? null : <KbdSeparator />);
    return (
      <KbdStyleContext value={styles}>
        <kbd
          {...rest}
          data-kbd-group=""
          data-size={kbd.size}
          data-platform={kbd.platform}
          className={kbdGroupStyle({ size: kbd.size, className: resolve(className, state) })}
        >
          {ordered.map((keyInfo, index) => (
            <Fragment key={`${index}:${keyInfo.id}`}>
              {index > 0 && joiner !== null && cloneElement(joiner, { key: 'separator' })}
              <kbd data-kbd="" className={styles.root()}>
                <span className={styles.face()}>
                  <Face keyInfo={keyInfo} name={name} iconClassName={styles.glyph()} />
                </span>
              </kbd>
            </Fragment>
          ))}
        </kbd>
      </KbdStyleContext>
    );
  }

  const content =
    ordered.length === 1 ? (
      <Face keyInfo={ordered[0]!} name={name} iconClassName={styles.glyph()} />
    ) : typeof children === 'string' ? (
      splitGlyphs(children).map((segment, index) =>
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
