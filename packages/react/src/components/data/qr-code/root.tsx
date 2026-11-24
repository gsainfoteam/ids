'use client';

import type { CSSProperties } from 'react';

import { QRCodeContext } from './context';
import { useInternalQRCodeGeometry } from './hooks/use-qr-code-geometry';
import { useInternalQRCodeWarnings } from './hooks/use-qr-code-warnings';
import { QRCodeLogo } from './parts/logo';
import { qrCodeStyle } from './style';
import { useInternalRequiredName } from '../../../internal/lib/accessible-name';
import { resolveState } from '../../../internal/lib/state-props';
import { containsElementOfType } from '../../../utils';

import type { QRCode } from '.';
import type { QRCodeFinderShape, QRCodeModuleShape } from './lib/qr-path';

const LOGO_PARTS: ReadonlySet<unknown> = new Set([QRCodeLogo]);

const STANDARD_QUIET_ZONE = 4;

const FINDER_FOR_SHAPE: Record<QRCodeModuleShape, QRCodeFinderShape> = {
  square: 'square',
  rounded: 'rounded',
  dots: 'circle',
};

const EMPTY_PLATE = 1;

export function QRCodeRoot({
  value,
  size = 'standard',
  errorCorrection,
  shape = 'square',
  finderShape,
  quietZone = STANDARD_QUIET_ZONE,
  variant = 'theme',
  className,
  style,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: QRCode.Props) {
  useInternalRequiredName('QRCode', { 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy });

  const hasLogo = containsElementOfType(children, LOGO_PARTS);
  const level = errorCorrection ?? (hasLogo ? 'H' : 'M');
  const finder = finderShape ?? FINDER_FOR_SHAPE[shape];

  const geometry = useInternalQRCodeGeometry({ value, level, shape, finder, quietZone, hasLogo });
  const overflow = geometry === undefined;
  useInternalQRCodeWarnings({ value, overflow, hasLogo, level });

  const state: QRCode.State = {
    version: geometry?.version,
    errorCorrection: level,
    shape,
    finderShape: finder,
  };
  const styles = qrCodeStyle({
    size: typeof size === 'number' ? undefined : size,
    variant,
    flush: quietZone <= 0,
  });
  const customSize: CSSProperties | undefined =
    typeof size === 'number' ? { width: size } : undefined;
  const viewBox = geometry?.viewBox ?? EMPTY_PLATE;

  return (
    <QRCodeContext value={{ logo: geometry?.logo, viewBox, styles }}>
      <div
        role="img"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        {...rest}
        data-qr-code=""
        data-variant={variant}
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
