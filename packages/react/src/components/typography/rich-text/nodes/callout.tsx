import { Alert } from '../../../feedback/alert';
import { RichTextCalloutIcon } from '../parts/callout-icon';
import { RichTextCalloutTitle } from '../parts/callout-title';
import { calloutKindOf } from '../schema/callout';

import type { DocumentNodeProps } from './types';

export function CalloutNode({ node, children }: DocumentNodeProps) {
  const kind = calloutKindOf(node.attrs.kind);

  return (
    <Alert role="note" data-callout="" colorScheme={kind} variant="soft">
      <Alert.Icon>
        <RichTextCalloutIcon kind={kind} />
      </Alert.Icon>
      <RichTextCalloutTitle kind={kind} />
      <Alert.Description asChild>
        <div data-document-blocks="">{children}</div>
      </Alert.Description>
    </Alert>
  );
}
