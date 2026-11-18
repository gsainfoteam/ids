import { differenceEuclidean } from 'culori';
import { describe, expect, test } from 'vitest';

import { paletteHues, palettes } from '../.storybook/palettes';
import { lightnessContrast } from '../src/components/utility/ids-provider/contrast';
import {
  ACCENT_TEXT_LC,
  MODES,
  TEXT_LC,
  resolveColors,
} from '../src/components/utility/ids-provider/theme-roles';
import { IDS_COLOR_FAMILIES } from '../src/tokens/color-roles';
import { IDS_COMPONENT_COLORS, IDS_COMPONENT_SHADOWS } from '../src/tokens/component-tokens';

import type { IdsNeutral } from '../src/components/utility/ids-provider/theme';
import type { IdsMode } from '../src/tokens/types';

type ComponentColor = keyof typeof IDS_COMPONENT_COLORS;

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

const STRENGTHS = ['subtlest', 'subtler', 'subtle', 'bold', 'bolder', 'boldest'];

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

const tokenIn = (roles: Record<IdsMode, Record<string, string>>, mode: IdsMode) => (token: ComponentColor) =>
  roles[mode][IDS_COMPONENT_COLORS[token][mode]]!;

describe('component token names', () => {
  test.each(TOKEN_NAMES)('%s is {property}-{group}[-{part}][-{variant}]', (name) => {
    const [property, group, ...rest] = name.split('-');

    expect(PROPERTIES).toContain(property);
    expect(group).toBeDefined();
    expect(WORDS_A_GROUP_CANNOT_TAKE).not.toContain(group);
    expect(name.split('-').filter((word) => WORDS_THAT_NAME_A_USE_OR_A_ROLE.includes(word))).toEqual([]);
    expect(rest.slice(0, -1).filter((word) => VARIANT_ONLY_WORDS.includes(word))).toEqual([]);
  });

  test('a color token carries a color property and a shadow token the shadow property', () => {
    for (const name of Object.keys(IDS_COMPONENT_COLORS)) expect(name).toMatch(/^(bg|text|border)-/);
    for (const name of Object.keys(IDS_COMPONENT_SHADOWS)) expect(name).toMatch(/^shadow-/);
  });
});

describe.each(themes)('component tokens for $name', ({ roles }) => {
  test('bg-panel stands apart from the page in dark mode', () => {
    const token = tokenIn(roles, 'dark');

    expect(differenceInOklab(token('bg-panel'), roles.dark['bg-neutral-subtlest']!)).toBeGreaterThan(
      SURFACES_APART_IN_OKLAB,
    );
  });

  test.each(MODES)('an outline control reads apart from bg-panel and bg-band in %s mode', (mode) => {
    const token = tokenIn(roles, mode);

    for (const surface of ['bg-panel', 'bg-band'] as const) {
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
  });

  test.each(MODES)('text on every component background reaches its contrast in %s mode', (mode) => {
    const token = tokenIn(roles, mode);
    const pairs = [
      ...(['bg-panel', 'bg-band', 'bg-control-outline', 'bg-field-outline'] as const).flatMap(
        (background) => [
          { text: roles[mode]['text-neutral-bold']!, background, lc: TEXT_LC },
          { text: roles[mode]['text-neutral']!, background, lc: ACCENT_TEXT_LC },
        ],
      ),
      { text: token('text-qr-code-light'), background: 'bg-qr-code-light' as const, lc: TEXT_LC },
      { text: token('text-qr-code-dark'), background: 'bg-qr-code-dark' as const, lc: TEXT_LC },
    ];

    for (const { text, background, lc } of pairs)
      expect(Math.abs(lightnessContrast(text, token(background))), `${text} on ${background}`).toBeGreaterThanOrEqual(lc);
  });
});
