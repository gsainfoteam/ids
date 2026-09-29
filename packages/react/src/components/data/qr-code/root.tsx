'use client';

import { useEffect, useMemo, type CSSProperties } from 'react';

import { QRCodeContext } from './context';
import { QRCodeLogo } from './logo';
import {
  qrCodeGeometry,
  type QRCodeFinderShape,
  type QRCodeGeometry,
  type QRCodeGeometryOptions,
  type QRCodeModuleShape,
} from './qr-path';
import { qrCodeStyle, type QRCodeTone } from './style';
import { resolveState } from '../../../internal/state-props';
import { useTranslate } from '../../../internal/translate';
import { containsElementOfType } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

import type { QRCode } from '.';

const LOGO_PARTS: ReadonlySet<unknown> = new Set([QRCodeLogo]);

const STANDARD_QUIET_ZONE = 4;

const FINDER_FOR_SHAPE: Record<QRCodeModuleShape, QRCodeFinderShape> = {
  square: 'square',
  rounded: 'rounded',
  dots: 'circle',
};

const LEVELS_TOO_LOW_FOR_A_LOGO = new Set(['L', 'M']);

const EMPTY_PLATE = 1;

function geometryThatFits(value: string, options: QRCodeGeometryOptions) {
  try {
    return qrCodeGeometry(value, options);
  } catch {
    return undefined;
  }
}

function toneOf(inverted: boolean | undefined): QRCodeTone {
  if (inverted === undefined) return 'theme';
  return inverted ? 'light-on-dark' : 'dark-on-light';
}

export function QRCodeRoot({
  value,
  size = 'standard',
  errorCorrection,
  shape = 'square',
  finderShape,
  quietZone = STANDARD_QUIET_ZONE,
  inverted,
  className,
  style,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: QRCode.Props) {
  const t = useTranslate();
  const hasLogo = containsElementOfType(children, LOGO_PARTS);
  const level = errorCorrection ?? (hasLogo ? 'H' : 'M');
  const finder = finderShape ?? FINDER_FOR_SHAPE[shape];

  const geometry: QRCodeGeometry | undefined = useMemo(
    () =>
      geometryThatFits(value, {
        errorCorrection: level,
        shape,
        finderShape: finder,
        quietZone,
        logo: hasLogo,
      }),
    [value, level, shape, finder, quietZone, hasLogo],
  );
  const overflow = geometry === undefined;

  useEffect(() => {
    if (!isDevelopment) return;
    if (value === '') console.warn('[IDS] QRCode: value is empty.');
    if (overflow)
      console.warn(
        `[IDS] QRCode: value is too long to encode at error correction level ${level}. Lower errorCorrection or shorten the value.`,
      );
    if (hasLogo && LEVELS_TOO_LOW_FOR_A_LOGO.has(level))
      console.warn(
        `[IDS] QRCode: a logo covers modules, so use errorCorrection 'Q' or 'H' instead of '${level}'.`,
      );
  }, [value, overflow, hasLogo, level]);

  const state: QRCode.State = {
    version: geometry?.version,
    errorCorrection: level,
    shape,
    finderShape: finder,
  };
  const styles = qrCodeStyle({
    size: typeof size === 'number' ? undefined : size,
    tone: toneOf(inverted),
    flush: quietZone <= 0,
  });
  const customSize: CSSProperties | undefined =
    typeof size === 'number' ? { width: size, height: size } : undefined;
  const viewBox = geometry?.viewBox ?? EMPTY_PLATE;

  return (
    <QRCodeContext value={{ logo: geometry?.logo, viewBox, styles }}>
      <div
        role="img"
        aria-label={ariaLabelledBy === undefined ? (ariaLabel ?? t('qrCode.label')) : ariaLabel}
        aria-labelledby={ariaLabelledBy}
        {...rest}
        data-qr-code=""
        data-shape={shape}
        data-finder-shape={finder}
        data-error-correction={level}
        data-version={geometry?.version}
        data-overflow={overflow ? '' : undefined}
        className={styles.root({ className: resolveState(className, state) })}
        style={{ ...customSize, ...resolveState(style, state) }}
      >
        <svg
          viewBox={`0 0 ${viewBox} ${viewBox}`}
          aria-hidden
          focusable="false"
          className={styles.svg()}
        >
          <rect width={viewBox} height={viewBox} className={styles.background()} />
          {geometry && (
            <>
              <path d={geometry.modules} className={styles.modules()} />
              <path d={geometry.finders} fillRule="evenodd" className={styles.finders()} />
            </>
          )}
        </svg>
        {children}
      </div>
    </QRCodeContext>
  );
}
