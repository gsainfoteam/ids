import { defineConfig, parse, type TokenNormalizedSet } from '@terrazzo/parser';
import { readdirSync, readFileSync } from 'node:fs';
import * as v from 'valibot';
import { parse as parseYaml } from 'yaml';

import {
  CONFIG_FILES,
  MessageFileSchema,
  NpmManifestSchema,
  type MessageFile,
  PubManifestSchema,
  type PubManifest,
  type TargetsConfig,
} from './config.ts';

export class SourceError extends Error {
  override name = 'SourceError';
}

const describeIssues = (file: string, issues: readonly v.BaseIssue<unknown>[]) =>
  issues
    .map((issue) => {
      const key = v.getDotPath(issue) ?? '(root)';
      return `${file}: ${key}: ${issue.message}`;
    })
    .join('\n');

export function validated<Schema extends v.GenericSchema>(
  file: string,
  schema: Schema,
  data: unknown,
): v.InferOutput<Schema> {
  const result = v.safeParse(schema, data);
  if (!result.success) throw new SourceError(describeIssues(file, result.issues));
  return result.output;
}

const readText = (root: URL, file: string) => readFileSync(new URL(file, root), 'utf8');

const readJson = (root: URL, file: string): unknown => {
  try {
    return JSON.parse(readText(root, file));
  } catch (error) {
    throw new SourceError(`${file}: ${(error as Error).message}`);
  }
};

type ConfigFiles = typeof CONFIG_FILES;

export type Config = { [Key in keyof ConfigFiles]: v.InferOutput<ConfigFiles[Key]['schema']> };

export function loadConfig(root: URL): Config {
  return Object.fromEntries(
    Object.entries(CONFIG_FILES).map(([key, { file, schema }]) => [
      key,
      validated(file, schema, readJson(root, file)),
    ]),
  ) as Config;
}

export const TOKENS_DIRECTORY = 'tokens/';

const TOKEN_FILE = /\.tokens\.json$/;

export async function loadTokens(root: URL): Promise<TokenNormalizedSet> {
  const directory = new URL(TOKENS_DIRECTORY, root);
  const files = readdirSync(directory)
    .filter((file) => TOKEN_FILE.test(file))
    .sort();
  const config = defineConfig({}, { cwd: root });
  const filenames = files.map((file) => new URL(file, directory).href);
  const { tokens } = await parse(
    files.map((file) => ({ filename: new URL(file, directory), src: readText(directory, file) })),
    { config },
  );
  return inSourceOrder(tokens, filenames);
}

type ParsedToken = TokenNormalizedSet[string];

const sourcePosition = (filenames: readonly string[], token: ParsedToken): [number, number] => [
  filenames.indexOf(String(token.source.filename)),
  Number(token.source.node?.loc?.start?.offset ?? 0),
];

function inSourceOrder(
  tokens: TokenNormalizedSet,
  filenames: readonly string[],
): TokenNormalizedSet {
  const ordered = Object.values(tokens).toSorted((a, b) => {
    const [fileA, offsetA] = sourcePosition(filenames, a);
    const [fileB, offsetB] = sourcePosition(filenames, b);
    return fileA - fileB || offsetA - offsetB;
  });
  return Object.fromEntries(ordered.map((token) => [token.id, token]));
}

export const MESSAGES_DIRECTORY = 'messages/';

const MESSAGE_FILE = /\.json$/;

export interface MessageSource extends MessageFile {
  file: string;
}

export function loadMessages(root: URL): MessageSource[] {
  return readdirSync(new URL(MESSAGES_DIRECTORY, root))
    .filter((file) => MESSAGE_FILE.test(file))
    .sort()
    .map((name) => {
      const file = MESSAGES_DIRECTORY + name;
      return { file, ...validated(file, MessageFileSchema, readJson(root, file)) };
    });
}

export interface Manifests {
  css: { name: string };
  ts: { name: string };
  dart: PubManifest;
}

export function loadManifests(root: URL, targets: TargetsConfig): Manifests {
  const { css, ts, dart } = targets.targets;
  return {
    css: validated(css.manifest, NpmManifestSchema, readJson(root, css.manifest)),
    ts: validated(ts.manifest, NpmManifestSchema, readJson(root, ts.manifest)),
    dart: validated(dart.manifest, PubManifestSchema, parseYaml(readText(root, dart.manifest))),
  };
}

export interface Sources {
  config: Config;
  tokens: TokenNormalizedSet;
  manifests: Manifests;
  messages: MessageSource[];
}

export async function loadSources(root: URL): Promise<Sources> {
  const config = loadConfig(root);
  return {
    config,
    tokens: await loadTokens(root),
    manifests: loadManifests(root, config.targets),
    messages: loadMessages(root),
  };
}
