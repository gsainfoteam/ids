'use client';

import { useTranslate } from '../../../internal/translate';
import { Alert } from '../../feedback/alert';

import type { CalloutKind } from './schema/callout';

const TITLE_KEY = {
  note: 'richText.calloutNote',
  tip: 'richText.calloutTip',
  important: 'richText.calloutImportant',
  warning: 'richText.calloutWarning',
  caution: 'richText.calloutCaution',
} as const satisfies Record<CalloutKind, string>;

export function RichTextCalloutTitle({ kind }: { kind: CalloutKind }) {
  const t = useTranslate();
  return <Alert.Title>{t(TITLE_KEY[kind])}</Alert.Title>;
}
