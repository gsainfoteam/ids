import { messages } from './messages-catalog';
import { editorMessages } from '../components/form/editor/messages-catalog';

import type { MessageTree } from './messages';

const sortedByGroup = (catalog: MessageTree): MessageTree =>
  Object.fromEntries(
    Object.keys(catalog)
      .sort()
      .map((name) => [name, catalog[name]]),
  );

export const everyMessage = sortedByGroup({ ...messages, ...editorMessages });
