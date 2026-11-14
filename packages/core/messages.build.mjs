import { dartMessages, slangMessages } from './dart-messages.mjs';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const write = (path, content) => {
  const url = new URL(path, import.meta.url);
  mkdirSync(new URL('.', url), { recursive: true });
  writeFileSync(url, content);
};

const korean = read('./messages/ko.json');
const english = read('./messages/en.json');

write('../react/src/internal/messages-catalog.ts', `// prettier-ignore
export const messages = ${JSON.stringify(korean, null, 2)} as const;\n`);
write('../react/messages/en.json', `${JSON.stringify(english, null, 2)}\n`);

write('../flutter/lib/messages/ids_messages.dart', dartMessages(korean));
write('../flutter/messages/ko.i18n.json', `${JSON.stringify(slangMessages(korean), null, 2)}\n`);
