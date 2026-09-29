'use client';

import { type ComponentProps, type CSSProperties } from 'react';

import { useQRCodeContext } from './context';
import { Slot } from '../../utility/slot';

export type QRCodeLogoProps = ComponentProps<'div'> & {
  asChild?: boolean;
};

const percent = (value: number, whole: number) => `${(value / whole) * 100}%`;

export function QRCodeLogo({ asChild, className, style, children, ...rest }: QRCodeLogoProps) {
  const { logo, viewBox, styles } = useQRCodeContext('QRCode.Logo');
  if (logo === undefined) return null;

  const placement: CSSProperties = {
    left: percent(logo.start, viewBox),
    top: percent(logo.start, viewBox),
    width: percent(logo.span, viewBox),
    height: percent(logo.span, viewBox),
  };
  const props = {
    ...rest,
    'data-qr-code-logo': '',
    className: styles.logo({ className }),
    style: { ...placement, ...style },
  };
  if (asChild === true) return <Slot {...props}>{children}</Slot>;
  return <div {...props}>{children}</div>;
}

QRCodeLogo.displayName = 'QRCode.Logo';
