'use client';

import type { ReactElement } from 'react';

import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  XCircleIcon,
} from '@heroicons/react/16/solid';

import type { CalloutKind } from './schema/callout';

export const CALLOUT_ICON: Record<CalloutKind, ReactElement> = {
  note: <InformationCircleIcon aria-hidden="true" />,
  tip: <LightBulbIcon aria-hidden="true" />,
  important: <ExclamationCircleIcon aria-hidden="true" />,
  warning: <ExclamationTriangleIcon aria-hidden="true" />,
  caution: <XCircleIcon aria-hidden="true" />,
};

export function RichTextCalloutIcon({ kind }: { kind: CalloutKind }) {
  return CALLOUT_ICON[kind];
}
