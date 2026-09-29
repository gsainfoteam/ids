import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { QRCodeLogo, type QRCodeLogoProps } from './logo';
import {
  type QRCodeErrorCorrection,
  type QRCodeFinderShape,
  type QRCodeModuleShape,
} from './qr-path';
import { QRCodeRoot } from './root';
import { qrCodeStyle } from './style';
import { type StateValue } from '../../../internal/state-props';

import type { IdsSize } from '../../../tokens/types';

export function QRCode(props: QRCode.Props) {
  return <QRCodeRoot {...props} />;
}

export namespace QRCode {
  export type ErrorCorrection = QRCodeErrorCorrection;
  export type Shape = QRCodeModuleShape;
  export type FinderShape = QRCodeFinderShape;

  export type State = {
    version: number | undefined;
    errorCorrection: QRCodeErrorCorrection;
    shape: QRCodeModuleShape;
    finderShape: QRCodeFinderShape;
  };

  export type Props = Omit<ComponentProps<'div'>, 'className' | 'style' | 'children' | 'role'> & {
    value: string;
    size?: IdsSize | number;
    errorCorrection?: QRCodeErrorCorrection;
    shape?: QRCodeModuleShape;
    finderShape?: QRCodeFinderShape;
    quietZone?: number;
    inverted?: boolean;
    className?: StateValue<string | undefined, State>;
    style?: StateValue<CSSProperties | undefined, State>;
    children?: ReactNode;
  };

  export const Logo = QRCodeLogo;
  export namespace Logo {
    export type Props = QRCodeLogoProps;
  }

  export const Style = qrCodeStyle;
}
