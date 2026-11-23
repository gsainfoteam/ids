import { mapValues } from 'es-toolkit/object';
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

  const name = (segments: Segments, sub: Segments = []): Name => {
    const merged = [...segments, ...sub];
    const css = spellAll(targets.targets.css.names, segments);
    return {
      segments: [...segments],
      ...(sub.length === 0 ? {} : { sub: [...sub] }),
      css:
        sub.length === 0
          ? css
          : mapValues(css, (base) =>
              [base, CASES.kebab(sub)].join(targets.targets.css.subSeparator),
            ),
      ts: spellAll(targets.targets.ts.names, merged),
      dart: spellAll(targets.targets.dart.names, merged),
    };
  };

  const symbols = (declared: Record<string, Segments>) =>
    Object.fromEntries(Object.entries(declared).map(([key, segments]) => [key, name(segments)]));

  return { name, symbols, key: CASES.kebab };
}

export type Naming = ReturnType<typeof createNaming>;
