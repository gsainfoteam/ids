import { Accordion } from '../../../data/accordion';

import type { DocumentNodeProps } from './types';

const ITEM = 'details';

export function DetailsNode({ node, children }: DocumentNodeProps) {
  return (
    <Accordion type="multiple" defaultValue={node.attrs.open ? [ITEM] : []}>
      <Accordion.Item value={ITEM}>{children}</Accordion.Item>
    </Accordion>
  );
}

export function DetailsSummaryNode({ children }: DocumentNodeProps) {
  return (
    <Accordion.Header asChild>
      <div>
        <Accordion.Trigger>{children}</Accordion.Trigger>
      </div>
    </Accordion.Header>
  );
}

export function DetailsContentNode({ children }: DocumentNodeProps) {
  return <Accordion.Content>{children}</Accordion.Content>;
}
