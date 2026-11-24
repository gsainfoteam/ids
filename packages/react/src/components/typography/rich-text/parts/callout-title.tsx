'use client';

import { useInternalTranslate } from '../../../../internal/translate';
import { Alert } from '../../../feedback/alert';
import { CALLOUT_TITLE } from '../lib/callout-kinds';

import type { CalloutKind } from '../schema/callout';

export function RichTextCalloutTitle({ kind }: { kind: CalloutKind }) {
  const t = useInternalTranslate();
  return <Alert.Title>{t(CALLOUT_TITLE[kind])}</Alert.Title>;
}
