'use client';

import type { ReactElement } from 'react';

import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  XCircleIcon,
} from '@heroicons/react/16/solid';

import type { CalloutKind } from './schema/callout';

export const CALLOUT_ICON: Record<CalloutKind, ReactElement> = {
  info: <InformationCircleIcon aria-hidden="true" />,
  success: <LightBulbIcon aria-hidden="true" />,
  warning: <ExclamationTriangleIcon aria-hidden="true" />,
  danger: <XCircleIcon aria-hidden="true" />,
};

export function RichTextCalloutIcon({ kind }: { kind: CalloutKind }) {
  return CALLOUT_ICON[kind];
}
