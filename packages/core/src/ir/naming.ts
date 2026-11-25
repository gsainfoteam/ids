import { upperFirst } from 'es-toolkit/string';

import type { NameCase, Spelling, TargetsConfig } from '../sources/config.ts';
import type { Name } from './schema.ts';

export type Segments = readonly string[];

const CASES: Record<NameCase, (segments: Segments) => string> = {
  kebab: (segments) => segments.join('-'),
  camel: ([first = '', ...rest]) => [first, ...rest.map(upperFirst)].join(''),
  pascal: (segments) => segments.map(upperFirst).join(''),
  constant: (segments) => segments.map((segment) => segment.toUpperCase()).join('_'),
  customProperty: (segments) => ['', '', ...segments].join('-'),
};

export function createNaming(targets: TargetsConfig) {
  const spellAll = <Roles extends string>(spellings: Record<Roles, Spelling>, segments: Segments) =>
    Object.fromEntries(
      Object.entries<Spelling>(spellings).map(([role, spelling]) => [
        role,
        CASES[spelling.case](spelling.prefixed ? [...targets.prefix, ...segments] : segments),
      ]),
    ) as Record<Roles, string>;

  const name = (segments: Segments): Name => ({
    segments: [...segments],
    css: spellAll(targets.targets.css.names, segments),
    ts: spellAll(targets.targets.ts.names, segments),
    dart: spellAll(targets.targets.dart.names, segments),
  });

  const symbols = (declared: Record<string, Segments>) =>
    Object.fromEntries(Object.entries(declared).map(([key, segments]) => [key, name(segments)]));

  return { name, symbols, key: CASES.kebab };
}

export type Naming = ReturnType<typeof createNaming>;
