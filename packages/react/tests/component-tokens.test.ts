import { differenceEuclidean } from 'culori';
import { describe, expect, test } from 'vitest';

import { paletteHues, palettes } from '../.storybook/palettes';
import { lightnessContrast } from '../src/components/utility/ids-provider/lib/contrast';
import {
  ACCENT_TEXT_LC,
  MODES,
  TEXT_LC,
  resolveColors,
} from '../src/components/utility/ids-provider/lib/theme-roles';
import { IDS_COLOR_FAMILIES } from '../src/tokens/color-roles';
import { IDS_COMPONENT_COLORS, IDS_COMPONENT_SHADOWS } from '../src/tokens/component-tokens';

import type { IdsNeutral } from '../src/components/utility/ids-provider/lib/theme';
import type { IdsMode } from '../src/tokens/types';

type ComponentColor = keyof typeof IDS_COMPONENT_COLORS;

type Background = ComponentColor | 'bg-surface' | 'bg-block';

const TOKEN_NAMES = [...Object.keys(IDS_COMPONENT_COLORS), ...Object.keys(IDS_COMPONENT_SHADOWS)];

const PROPERTIES = ['bg', 'text', 'border', 'shadow'];

const WORDS_THAT_NAME_A_USE_OR_A_ROLE = [
  'fill',
  'tint',
  'strong',
  'accent',
  'on',
  'line',
  'quiet',
  'glyph',
  'foreground',
  'background',
];

const STRENGTHS = ['strong', 'subtlest', 'subtler', 'subtle', 'bold', 'bolder', 'boldest'];

const WORDS_A_GROUP_CANNOT_TAKE = [...IDS_COLOR_FAMILIES, 'scheme', ...STRENGTHS];

const VARIANT_ONLY_WORDS = ['soft'];

const NEUTRALS: IdsNeutral[] = ['pure', 'tinted'];

const SURFACES_APART_IN_OKLAB = 0.05;

const differenceInOklab = differenceEuclidean('oklab');

const themes = paletteHues.flatMap((primary) =>
  NEUTRALS.map((neutral) => ({
    name: `${primary}, ${neutral}`,
    roles: resolveColors({ primary: palettes[primary], neutral }).colors!.roles,
  })),
);

const isComponentColor = (name: Background): name is ComponentColor => name in IDS_COMPONENT_COLORS;

const tokenIn =
  (roles: Record<IdsMode, Record<string, string>>, mode: IdsMode) => (name: Background) =>
    roles[mode][isComponentColor(name) ? IDS_COMPONENT_COLORS[name][mode] : name]!;

describe('component token names', () => {
  test.each(TOKEN_NAMES)('%s is {property}-{group}[-{part}][-{variant}]', (name) => {
    const [property, group, ...rest] = name.split('-');

    expect(PROPERTIES).toContain(property);
    expect(group).toBeDefined();
    expect(WORDS_A_GROUP_CANNOT_TAKE).not.toContain(group);
    expect(
      name.split('-').filter((word) => WORDS_THAT_NAME_A_USE_OR_A_ROLE.includes(word)),
    ).toEqual([]);
    expect(rest.slice(0, -1).filter((word) => VARIANT_ONLY_WORDS.includes(word))).toEqual([]);
  });

  test('a color token carries a color property and a shadow token the shadow property', () => {
    for (const name of Object.keys(IDS_COMPONENT_COLORS))
      expect(name).toMatch(/^(bg|text|border)-/);
    for (const name of Object.keys(IDS_COMPONENT_SHADOWS)) expect(name).toMatch(/^shadow-/);
  });
});

describe.each(themes)('component tokens for $name', ({ roles }) => {
  test('bg-surface stands apart from the page in dark mode, and bg-block from both', () => {
    const token = tokenIn(roles, 'dark');

    expect(differenceInOklab(token('bg-surface'), roles.dark['bg-base']!)).toBeGreaterThan(
      SURFACES_APART_IN_OKLAB,
    );
    expect(differenceInOklab(token('bg-block'), roles.dark['bg-base']!)).toBeGreaterThan(
      SURFACES_APART_IN_OKLAB,
    );
  });

  test.each(MODES)(
    'an outline control reads apart from bg-surface and bg-block in %s mode',
    (mode) => {
      const token = tokenIn(roles, mode);

      for (const surface of ['bg-surface', 'bg-block'] as const) {
        for (const [fill, border] of [
          ['bg-control-outline', 'border-control-outline'],
          ['bg-field-outline', 'border-field-outline'],
        ] as const) {
          const apart = Math.max(
            differenceInOklab(token(fill), token(surface)),
            differenceInOklab(token(border), token(surface)),
          );

          expect(apart, `${fill} on ${surface}`).toBeGreaterThan(SURFACES_APART_IN_OKLAB);
        }
      }
    },
  );

  test.each(MODES)('text on every component background reaches its contrast in %s mode', (mode) => {
    const token = tokenIn(roles, mode);
    const pairs = [
      ...(
        [
          'bg-surface',
          'bg-block',
          'bg-control-outline',
          'bg-field-outline',
          'bg-field-code-outline',
        ] as const
      ).flatMap((background) => [
        { text: roles[mode]['text-neutral-strong']!, background, lc: TEXT_LC },
        { text: roles[mode]['text-neutral']!, background, lc: ACCENT_TEXT_LC },
      ]),
      { text: token('text-qr-code'), background: 'bg-qr-code' as const, lc: TEXT_LC },
      {
        text: token('text-qr-code-inverse'),
        background: 'bg-qr-code-inverse' as const,
        lc: TEXT_LC,
      },
    ];

    for (const { text, background, lc } of pairs)
      expect(
        Math.abs(lightnessContrast(text, token(background))),
        `${text} on ${background}`,
      ).toBeGreaterThanOrEqual(lc);
  });
});
