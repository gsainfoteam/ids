import { Alert } from '../../../feedback/alert';
import { RichTextCalloutTitle } from '../callout-title';
import { calloutKindOf, type CalloutKind } from '../schema/callout';

import type { DocumentNodeProps } from './types';

const CALLOUT_SCHEME = {
  note: 'info',
  tip: 'success',
  important: 'primary',
  warning: 'warning',
  caution: 'danger',
} as const satisfies Record<CalloutKind, Alert.Props['colorScheme']>;

export function CalloutNode({ node, children }: DocumentNodeProps) {
  const kind = calloutKindOf(node.attrs.kind);

  return (
    <Alert role="note" colorScheme={CALLOUT_SCHEME[kind]} variant="soft">
      <RichTextCalloutTitle kind={kind} />
      <Alert.Description asChild>
        <div>{children}</div>
      </Alert.Description>
    </Alert>
  );
}
