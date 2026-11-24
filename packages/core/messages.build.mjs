import { dartMessageReaders, dartMessages } from './dart-messages.mjs';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const write = (path, content) => {
  const url = new URL(path, import.meta.url);
  mkdirSync(new URL('.', url), { recursive: true });
  writeFileSync(url, content);
};

const ARGUMENT = /\{([a-z][a-zA-Z0-9]*)(?:, (number))?\}/g;
const ARGUMENT_TYPES = { undefined: 'string', number: 'number' };

function parseMessages(tree, path = []) {
  const runtime = {};
  const argumentTypes = {};
  for (const [name, value] of Object.entries(tree)) {
    const key = [...path, name];
    if (typeof value === 'object' && value !== null) {
      const nested = parseMessages(value, key);
      runtime[name] = nested.runtime;
      Object.assign(argumentTypes, nested.argumentTypes);
      continue;
    }
    if (typeof value !== 'string') throw new Error(`Invalid message: ${key.join('.')}`);
    if (/[{}]/.test(value.replace(ARGUMENT, '')))
      throw new Error(`Only {name} and {name, number} arguments are supported: ${key.join('.')}`);
    const found = [...value.matchAll(ARGUMENT)];
    runtime[name] = value.replace(ARGUMENT, '{$1}');
    if (found.length > 0)
      argumentTypes[key.join('.')] = Object.fromEntries(
        found.map(([, argument, type]) => [argument, ARGUMENT_TYPES[type]]),
      );
  }
  return { runtime, argumentTypes };
}

function parseLocale(file) {
  const { language, tag, messages } = read(`./messages/${file}`);
  if (!/^[a-z]{2,3}$/.test(language)) throw new Error(`${file}: language must be a 2 or 3 letter code`);
  if (new Intl.Locale(tag).language !== language)
    throw new Error(`${file}: tag "${tag}" is not a tag of language "${language}"`);
  return { file, language, tag, ...parseMessages(messages) };
}

const locales = readdirSync(new URL('./messages', import.meta.url))
  .filter((file) => file.endsWith('.json'))
  .sort()
  .map(parseLocale);

const korean = locales.find(({ language }) => language === 'ko');
const signature = (types) => JSON.stringify(Object.entries(types ?? {}).sort());
const keysOf = (tree, path = []) =>
  Object.entries(tree).flatMap(([name, value]) =>
    typeof value === 'string' ? [[...path, name].join('.')] : keysOf(value, [...path, name]),
  );

for (const locale of locales) {
  const own = new Set(keysOf(locale.runtime));
  for (const key of keysOf(korean.runtime)) {
    if (!own.has(key)) throw new Error(`${locale.file} has no message "${key}"`);
    if (signature(locale.argumentTypes[key]) !== signature(korean.argumentTypes[key]))
      throw new Error(`${locale.file}: "${key}" takes other arguments than ko.json`);
    own.delete(key);
  }
  if (own.size > 0) throw new Error(`${locale.file} has messages ko.json lacks: ${[...own].join(', ')}`);
}

const { editor, ...shared } = korean.runtime;

write('../react/src/internal/messages-catalog.ts', `// prettier-ignore
export const messages = ${JSON.stringify(shared, null, 2)} as const;\n`);
write('../react/src/components/form/editor/messages-catalog.ts', `// prettier-ignore
export const editorMessages = ${JSON.stringify({ editor }, null, 2)} as const;\n`);
write('../react/src/internal/message-arguments.ts', `// prettier-ignore
export const messageArguments = ${JSON.stringify(korean.argumentTypes, null, 2)} as const;\n`);

for (const { language, tag, runtime } of locales)
  write(`../react/src/locales/${language}.ts`, `import { defineIdsLocale } from '../internal/locale';

// prettier-ignore
export const ${language} = defineIdsLocale({
  language: '${language}',
  tag: '${tag}',
  messages: ${JSON.stringify(runtime, null, 2).replaceAll('\n', '\n  ')},
});\n`);

write('../flutter/lib/messages/ids_messages.dart', dartMessages(locales));
write('../flutter/test/generated/ids_message_readers.dart', dartMessageReaders(locales));
