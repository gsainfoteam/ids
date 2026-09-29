'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { QRCodeArea } from './qr-path';
import type { qrCodeStyle } from './style';

type Context = {
  logo: QRCodeArea | undefined;
  viewBox: number;
  styles: ReturnType<typeof qrCodeStyle>;
};

export const QRCodeContext = createContext<Context | null>(null);

export function useQRCodeContext(part: string) {
  const context = use(QRCodeContext);
  invariant(context, `\`<${part}>\` must be used inside \`<QRCode>\`.`);
  return context;
}
