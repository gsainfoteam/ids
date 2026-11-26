import { groupBy } from 'es-toolkit';
import { posix } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Ir, MessagePart, Messages } from '../../ir/schema.ts';
import { SourceError } from '../../sources/load.ts';
import { outputOf, type Output } from '../output.ts';
import {
  MODULE_EXTENSION,
  relativeSpecifier,
  RUNTIME_ARGUMENT_DELIMITERS,
  runtimeArgument,
} from './literals.ts';
import {
  call,
  exportConst,
  importNamed,
  moduleSource,
  record,
  string,
  type Expression,
} from './nodes.ts';

type Entry = Messages['entries'][number];

function symbolOf(ir: Ir, key: string) {
  const name = ir.targets.ts.symbols[key];
  if (!name) throw new SourceError(`config/targets.json: targets.ts.symbols.${key}: missing`);
  return name.ts.member;
}

function moduleOf(ir: Ir, key: string) {
  const module = ir.targets.ts.modules?.[key];
  if (!module) throw new SourceError(`config/targets.json: targets.ts.modules.${key}: missing`);
  return module;
}

function runtimeText(entry: Entry, parts: readonly MessagePart[]) {
  return parts
    .map((part) => {
      if (part.kind === 'argument') return runtimeArgument(part.argument);
      if (RUNTIME_ARGUMENT_DELIMITERS.test(part.text))
        throw new SourceError(`ir: messages.${entry.id}: the runtime cannot write braces as text`);
      return part.text;
    })
    .join('');
}

function textIn(entry: Entry, language: string) {
  const text = entry.texts.find((candidate) => candidate.language === language);
  if (!text) throw new SourceError(`ir: messages.${entry.id}: nothing in ${language}`);
  return string(runtimeText(entry, text.parts));
}

function tree(
  entries: readonly Entry[],
  leaf: (entry: Entry) => Expression,
  depth = 0,
): Expression {
  const branches = groupBy(entries, (entry) => entry.path[depth] ?? '');
  return record(
    Object.entries(branches).map(([key, branch]) => {
      const [only] = branch;
      return [
        key,
        branch.length === 1 && only && only.path.length === depth + 1
          ? leaf(only)
          : tree(branch, leaf, depth + 1),
      ];
    }),
  );
}

const inGroups = (entries: readonly Entry[], groups: readonly string[]) =>
  entries.filter((entry) => groups.includes(entry.path[0] ?? ''));

function importSpecifier(from: Output, to: string) {
  const relative = posix.relative(posix.dirname(from.path), to);
  const withoutExtension = posix.join(
    posix.dirname(relative),
    posix.basename(relative, posix.extname(relative)),
  );
  return relativeSpecifier(withoutExtension);
}

export function messageModules(root: URL, ir: Ir): (readonly [Output, string])[] {
  const { messages } = ir;
  const { entries } = messages;
  const fallbackText = (entry: Entry) => textIn(entry, messages.fallback);
  const packageRoot = new URL(ir.packages.ts.directory, root);

  const catalogs = messages.catalogs.map((catalog) => {
    const name = catalog.name.ts.member;
    return [
      outputOf(root, ir, 'ts', name),
      moduleSource([exportConst(name, tree(inGroups(entries, catalog.groups), fallbackText))]),
    ] as const;
  });

  const argumentsOutput = outputOf(root, ir, 'ts', symbolOf(ir, 'messageArguments'));
  const argumentTypes = moduleSource([
    exportConst(
      symbolOf(ir, 'messageArguments'),
      record(
        entries
          .filter((entry) => entry.parameters.length > 0)
          .map((entry) => [
            entry.id,
            record(entry.parameters.map((parameter) => [parameter.name, string(parameter.type)])),
          ]),
      ),
    ),
  ]);

  const directory = outputOf(root, ir, 'ts', 'locales');
  const defineLocale = symbolOf(ir, 'defineLocale');
  const localeModule = fileURLToPath(new URL(moduleOf(ir, 'locale'), packageRoot));
  const locales = messages.locales.map((locale) => {
    const file = new URL(locale.name.ts.member + MODULE_EXTENSION, directory.file);
    const output = { file, path: fileURLToPath(file) };
    return [
      output,
      moduleSource([
        importNamed([defineLocale], importSpecifier(output, localeModule)),
        exportConst(
          locale.name.ts.member,
          call(defineLocale, [
            record([
              ['language', string(locale.language)],
              ['tag', string(locale.tag)],
              ['messages', tree(entries, (entry) => textIn(entry, locale.language))],
            ]),
          ]),
          { readonly: false },
        ),
      ]),
    ] as const;
  });

  return [...catalogs, [argumentsOutput, argumentTypes], ...locales];
}
