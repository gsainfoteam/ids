import type { CSSProperties } from 'react';

import { type Hotkey } from '@tanstack/react-hotkeys';

import { ToasterRoot } from './root';
import { toasterStyle } from './style';

import type { StatusColorScheme } from '../../../internal/status-palette';

export function Toaster(props: Toaster.Props) {
  return <ToasterRoot {...props} />;
}

export namespace Toaster {
  export type Placement =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';

  export type ColorScheme = StatusColorScheme;

  export type Props = {
    placement?: Placement;
    max?: number;
    gap?: number;
    offset?: number;
    expand?: boolean;
    hotkey?: Hotkey;
    className?: string;
    style?: CSSProperties;
    'aria-label'?: string;
  };

  export const Style = toasterStyle;
}

export { DefaultToaster } from './root';
export {
  toast,
  type ToastAction,
  type ToastId,
  type ToastOptions,
  type ToastPromiseMessages,
  type ToastRecord,
} from './toast-store';
