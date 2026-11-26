import {
  isArgumentElement,
  isLiteralElement,
  isNumberElement,
  parse,
  type MessageFormatElement,
} from '@formatjs/icu-messageformat-parser';
import { isEqual, sortBy } from 'es-toolkit';
import { words } from 'es-toolkit/string';

import type { MessageTree } from '../sources/config.ts';
import { SourceError, type MessageSource, type Sources } from '../sources/load.ts';
import type { Naming } from './naming.ts';
import type { MessageArgumentType, MessagePart, Messages } from './schema.ts';

const KEY_SEPARATOR = '.';

interface Leaf {
  path: string[];
  text: string;
}

function leavesOf(tree: MessageTree, path: string[] = []): Leaf[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === 'string'
      ? [{ path: [...path, key], text: value }]
      : leavesOf(value, [...path, key]),
  );
}

const idOf = (path: readonly string[]) => path.join(KEY_SEPARATOR);

interface Parsed {
  parts: MessagePart[];
  parameters: Map<string, MessageArgumentType>;
}

interface Argument {
  name: string;
  type: MessageArgumentType;
}

function argumentOf(element: MessageFormatElement): Argument | undefined {
  if (isArgumentElement(element)) return { name: element.value, type: 'string' };
  if (isNumberElement(element) && element.style == null)
    return { name: element.value, type: 'number' };
  return undefined;
}

function parsed(source: MessageSource, path: readonly string[], text: string): Parsed {
  const where = `${source.file}: messages.${idOf(path)}`;
  let elements: MessageFormatElement[];
  try {
    elements = parse(text);
  } catch (error) {
    throw new SourceError(`${where}: ${(error as Error).message}`);
  }
  const parameters = new Map<string, MessageArgumentType>();
  const parts = elements.map((element): MessagePart => {
    if (isLiteralElement(element)) return { kind: 'text', text: element.value };
    const argument = argumentOf(element);
    if (!argument)
      throw new SourceError(`${where}: only text, {name} and {name, number} are supported`);
    const { name, type } = argument;
    const declared = parameters.get(name);
    if (declared && declared !== type)
      throw new SourceError(`${where}: {${name}} is used as ${declared} and ${type}`);
    parameters.set(name, type);
    return { kind: 'argument', argument: name };
  });
  return { parts, parameters };
}

function checkSorted(source: MessageSource, tree: MessageTree, path: string[] = []) {
  const keys = Object.keys(tree);
  const sorted = keys.toSorted();
  if (!isEqual(keys, sorted))
    throw new SourceError(
      `${source.file}: messages${path.map((key) => KEY_SEPARATOR + key).join('')}: keys are not sorted (${sorted.join(', ')})`,
    );
  for (const [key, value] of Object.entries(tree))
    if (typeof value !== 'string') checkSorted(source, value, [...path, key]);
}

function subtagsOf(source: MessageSource) {
  let locale: Intl.Locale;
  try {
    locale = new Intl.Locale(source.tag);
  } catch (error) {
    throw new SourceError(`${source.file}: tag: ${(error as Error).message}`);
  }
  if (locale.language !== source.language)
    throw new SourceError(
      `${source.file}: tag: "${source.tag}" is not a tag of language "${source.language}"`,
    );
  return {
    language: locale.language,
    ...(locale.script ? { script: locale.script } : {}),
    ...(locale.region ? { region: locale.region } : {}),
  };
}

const signature = (parameters: ReadonlyMap<string, MessageArgumentType>) =>
  sortBy([...parameters], [([name]) => name]);

const segmentsOfKey = (key: string) => words(key).map((word) => word.toLowerCase());

export function buildMessages(sources: Sources, naming: Naming): Messages {
  const { messages: config } = sources.config;
  const configFile = 'config/messages.json';
  const fallback = sources.messages.find((source) => source.language === config.fallback);
  if (!fallback)
    throw new SourceError(`${configFile}: fallback: no messages file is in "${config.fallback}"`);

  const languages = new Set<string>();
  for (const source of sources.messages) {
    if (languages.has(source.language))
      throw new SourceError(`${source.file}: language: "${source.language}" has another file`);
    languages.add(source.language);
    checkSorted(source, source.messages);
  }

  const locales = sources.messages.map((source) => ({
    source,
    texts: new Map(leavesOf(source.messages).map((leaf) => [idOf(leaf.path), leaf.text])),
  }));

  const contract = leavesOf(fallback.messages);
  const contractIds = new Set(contract.map((leaf) => idOf(leaf.path)));
  for (const { source, texts } of locales) {
    const extra = [...texts.keys()].filter((id) => !contractIds.has(id));
    if (extra.length > 0)
      throw new SourceError(`${source.file}: messages ${fallback.file} lacks: ${extra.join(', ')}`);
  }

  const groups = new Set(contract.flatMap((leaf) => leaf.path.slice(0, 1)));
  for (const group of config.ownCatalogs)
    if (!groups.has(group))
      throw new SourceError(`${configFile}: ownCatalogs: there is no message group "${group}"`);

  const names = new Map<string, string>();
  const entries = contract.map(({ path }) => {
    const id = idOf(path);
    const segments = path.flatMap(segmentsOfKey);
    const key = naming.key(segments);
    const taken = names.get(key);
    if (taken)
      throw new SourceError(`${fallback.file}: messages.${id}: spells the same name as ${taken}`);
    names.set(key, id);

    const perLocale = locales.map(({ source, texts }) => {
      const text = texts.get(id);
      if (text === undefined) throw new SourceError(`${source.file}: messages.${id}: missing`);
      return { source, ...parsed(source, path, text) };
    });
    const [own] = perLocale.filter(({ source }) => source === fallback);
    for (const locale of perLocale)
      if (!isEqual(signature(locale.parameters), signature(own!.parameters)))
        throw new SourceError(
          `${locale.source.file}: messages.${id}: takes other arguments than ${fallback.file}`,
        );

    return {
      id,
      path,
      name: naming.name(segments),
      parameters: [...own!.parameters].map(([name, type]) => ({ name, type })),
      texts: perLocale.map(({ source, parts }) => ({ language: source.language, parts })),
    };
  });

  const shared = [...groups].filter((group) => !config.ownCatalogs.includes(group));
  return {
    fallback: fallback.language,
    locales: locales.map(({ source }) => ({
      language: source.language,
      tag: source.tag,
      name: naming.name([source.language]),
      catalog: naming.name([...config.catalog, source.language]),
      subtags: subtagsOf(source),
    })),
    catalogs: [
      { name: naming.name(config.catalog), groups: shared },
      ...config.ownCatalogs.map((group) => ({
        name: naming.name([...segmentsOfKey(group), ...config.catalog]),
        groups: [group],
      })),
    ],
    entries,
  };
}
