import { CodeBlock } from '../../../data/code-block';

import type { DocumentNodeProps } from './types';

export function CodeBlockNode({ node }: DocumentNodeProps) {
  return <CodeBlock language={node.attrs.language ?? undefined}>{node.textContent}</CodeBlock>;
}
