'use client';

import { CALLOUT_TITLE } from './callout-kinds';
import { useTranslate } from '../../../internal/translate';
import { Alert } from '../../feedback/alert';

import type { CalloutKind } from './schema/callout';

export function RichTextCalloutTitle({ kind }: { kind: CalloutKind }) {
  const t = useTranslate();
  return <Alert.Title>{t(CALLOUT_TITLE[kind])}</Alert.Title>;
}
