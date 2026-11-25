import { describe, expect, test } from 'vitest';

import { paletteHues, palettes } from '../.storybook/palettes';
import {
  DISTINCT_FAMILIES,
  distanceBetween,
} from '../src/components/utility/ids-provider/lib/color-distance';
import {
  DERIVED_CHROMA_RATIO,
  TERTIARY_HUE_TURN,
  derivedTertiary,
} from '../src/components/utility/ids-provider/lib/derived-brands';
import { IDS_NEUTRAL_PALETTE } from '../src/components/utility/ids-provider/lib/palette-scales';
import {
  chromaOf,
  chromaRatioOf,
  createIdsRamp,
  hueOf,
  rampAtHue,
  rampFromSteps,
  shadeOf,
  signedHueDelta,
} from '../src/components/utility/ids-provider/lib/palette-seed';
import {
  HARMONIZE_LIMIT,
  STATUS_HUES,
  STATUS_PALETTE_NAMES,
  fixedStatusPalette,
  harmonizedStatusPalettes,
  readsAs,
} from '../src/components/utility/ids-provider/lib/status';
import {
  TINTED_NEUTRAL_CHROMA,
  neutralPalette,
  resolveColors,
} from '../src/components/utility/ids-provider/lib/theme-roles';
import { checkIdsTheme } from '../src/components/utility/ids-provider/lib/theme-variables';
import { IDS_STATUS_FAMILIES } from '../src/tokens/color-roles';
import { IDS_STATUS_PALETTES } from '../src/tokens/palette-model';

import type { IdsStatusFamily } from '../src/components/utility/ids-provider/lib/theme';

const statusReference = (family: IdsStatusFamily) =>
  rampFromSteps(IDS_STATUS_PALETTES[STATUS_PALETTE_NAMES[family]]);

describe('status references', () => {
  test('every status reference reads as its status', () => {
    for (const family of IDS_STATUS_FAMILIES)
      expect(readsAs(family, hueOf(statusReference(family)))).toBe(true);
  });

  test('the status hue ranges cover the circle once', () => {
    const ranges = Object.values(STATUS_HUES).sort((a, b) => a.from - b.from);
    ranges.slice(1).forEach((range, index) => expect(range.from).toBe(ranges[index]!.to));
  });
});

describe('harmonized status', () => {
  test.each(paletteHues)('rotates toward %s by at most the limit and stays in range', (hue) => {
    const primary = palettes[hue];
    const harmonized = harmonizedStatusPalettes(primary);

    for (const family of IDS_STATUS_FAMILIES) {
      const before = hueOf(fixedStatusPalette(family));
      const after = hueOf(harmonized[family]);
      const moved = signedHueDelta(before, after);
      const toward = signedHueDelta(before, hueOf(primary));

      expect(Math.abs(moved)).toBeLessThanOrEqual(HARMONIZE_LIMIT + 0.5);
      if (Math.abs(moved) > 0.5) expect(Math.sign(moved)).toBe(Math.sign(toward));
      expect(readsAs(family, after)).toBe(true);
    }
  });

  test.each(paletteHues)('keeps the lightness and chroma of each step for %s', (hue) => {
    const harmonized = harmonizedStatusPalettes(palettes[hue]);

    for (const family of IDS_STATUS_FAMILIES) {
      const fixed = fixedStatusPalette(family);
      for (const step of [100, 600, 900] as const) {
        expect(shadeOf(harmonized[family][step]).l).toBeCloseTo(shadeOf(fixed[step]).l, 2);
        expect(shadeOf(harmonized[family][step]).c).toBeCloseTo(shadeOf(fixed[step]).c, 1);
      }
    }
  });

  test('a gray primary leaves the status colors fixed', () => {
    const gray = createIdsRamp('#737373')!;

    expect(chromaOf(gray)).toBeLessThan(0.02);
    expect(harmonizedStatusPalettes(gray)).toEqual(
      Object.fromEntries(IDS_STATUS_FAMILIES.map((family) => [family, fixedStatusPalette(family)])),
    );
  });

  test("'fixed' uses the core palettes", () => {
    const { colors } = resolveColors({ primary: palettes.violet, status: 'fixed' });

    for (const family of IDS_STATUS_FAMILIES)
      expect(colors!.ramps[family]).toEqual(statusReference(family));
  });

  test('a status the app gives replaces only that status', () => {
    const { colors } = resolveColors({ primary: palettes.violet, status: { danger: '#be123c' } });

    expect(colors!.ramps.danger[600]).not.toEqual(statusReference('danger')[600]);
    expect(colors!.ramps.success).toEqual(harmonizedStatusPalettes(palettes.violet).success);
  });

  test.each(paletteHues)('%s as primary keeps every status apart under red-green CVD', (hue) => {
    const issues = checkIdsTheme({ primary: palettes[hue] });

    expect(issues.filter((issue) => !issue.message.includes('too close'))).toEqual([]);
  });
});

describe('tinted neutral', () => {
  test.each(paletteHues)('keeps the lightness of the pure neutral and takes the %s hue', (hue) => {
    const tinted = neutralPalette('tinted', palettes[hue]);

    for (const mode of ['light', 'dark'] as const)
      IDS_NEUTRAL_PALETTE[mode].forEach((pure, index) => {
        const shade = shadeOf(tinted[mode][index]!);
        expect(shade.l).toBeCloseTo(shadeOf(pure).l, 2);
        expect(shade.c).toBeLessThanOrEqual(TINTED_NEUTRAL_CHROMA + 0.002);
        if (shade.c > TINTED_NEUTRAL_CHROMA / 2)
          expect(Math.abs(signedHueDelta(shade.h!, hueOf(palettes[hue])))).toBeLessThan(12);
      });
  });

  test('pure is the IDS neutral', () => {
    expect(neutralPalette('pure', palettes.blue)).toEqual(IDS_NEUTRAL_PALETTE);
  });

  test('white stays white', () => {
    expect(neutralPalette('tinted', palettes.blue).light[0]).toBe('#ffffff');
  });
});

describe('checkIdsTheme color distinction', () => {
  test('reports two brand families too close to tell apart', () => {
    expect(
      checkIdsTheme({ primary: palettes.blue, secondary: '#1d5ff5' }).map((issue) => issue.path),
    ).toEqual(['secondary']);
  });

  test('reports a brand family too close to a status', () => {
    const issues = checkIdsTheme({
      primary: palettes.blue,
      secondary: palettes.red,
      status: 'fixed',
    });

    expect(issues.map((issue) => issue.path)).toEqual(['secondary']);
    expect(issues[0]!.message).toMatch(/too close to danger/);
  });

  test('reports a status whose hue reads as another status', () => {
    expect(
      checkIdsTheme({ primary: palettes.blue, status: { danger: '#16a34a' } }).map((issue) =>
        issue.message.split(' ').slice(0, 3).join(' '),
      ),
    ).toContain('danger has the');
  });

  test('reports success and danger that look alike under red-green CVD', () => {
    expect(checkIdsTheme({ primary: palettes.blue, status: { danger: '#ca2356' } })).toEqual([
      expect.objectContaining({
        path: 'status.success',
        message: expect.stringMatching(/success and danger look alike/),
      }),
    ]);
  });

  test('a fixed status set passes with any reference primary but the same hue', () => {
    for (const hue of paletteHues) {
      const issues = checkIdsTheme({ primary: palettes[hue], status: 'fixed' });
      for (const issue of issues) expect(issue.message).toMatch(/^primary is too close to/);
    }
  });
});

describe('derived secondary and tertiary', () => {
  const ratioOf = (palette: Parameters<typeof chromaRatioOf>[0]) => chromaRatioOf(palette);

  test.each(paletteHues)(
    'primary %s alone derives a quieter secondary and a turned tertiary',
    (hue) => {
      const primary = palettes[hue];
      const { colors } = resolveColors({ primary });
      const { secondary, tertiary } = colors!.ramps;
      const expected = ratioOf(primary) * DERIVED_CHROMA_RATIO;
      const turn = signedHueDelta(hueOf(primary), hueOf(tertiary));

      expect(Math.abs(signedHueDelta(hueOf(primary), hueOf(secondary)))).toBeLessThan(6);
      expect(ratioOf(secondary)).toBeCloseTo(expected, 1);
      expect(Math.abs(Math.abs(turn) - TERTIARY_HUE_TURN)).toBeLessThan(8);
      expect(ratioOf(tertiary)).toBeCloseTo(expected, 1);
      expect(colors!.given).toEqual(['primary']);
    },
  );

  test.each(paletteHues)('primary %s alone gives three distinct brand fills', (hue) => {
    const { colors } = resolveColors({ primary: palettes[hue] });
    const fills = (['primary', 'secondary', 'tertiary'] as const).map(
      (family) => colors!.ramps[family][600],
    );

    expect(distanceBetween(fills[0]!, fills[1]!)).toBeGreaterThanOrEqual(DISTINCT_FAMILIES);
    expect(distanceBetween(fills[0]!, fills[2]!)).toBeGreaterThanOrEqual(DISTINCT_FAMILIES);
    expect(distanceBetween(fills[1]!, fills[2]!)).toBeGreaterThanOrEqual(DISTINCT_FAMILIES);
  });

  test('a given secondary is kept, and tertiary is still derived from primary', () => {
    const alone = resolveColors({ primary: palettes.blue }).colors!;
    const { colors } = resolveColors({ primary: palettes.blue, secondary: palettes.violet });

    expect(colors!.ramps.secondary).toEqual(palettes.violet);
    expect(colors!.ramps.tertiary).toEqual(alone.ramps.tertiary);
    expect(colors!.given).toEqual(['primary', 'secondary']);
  });

  test('a given tertiary is kept, and secondary is still derived from primary', () => {
    const alone = resolveColors({ primary: palettes.blue }).colors!;
    const { colors } = resolveColors({ primary: palettes.blue, tertiary: palettes.teal });

    expect(colors!.ramps.tertiary).toEqual(palettes.teal);
    expect(colors!.ramps.secondary).toEqual(alone.ramps.secondary);
  });

  test('all three given are used as they are', () => {
    const { colors } = resolveColors({
      primary: palettes.blue,
      secondary: palettes.violet,
      tertiary: palettes.teal,
    });

    expect(colors!.ramps.secondary).toEqual(palettes.violet);
    expect(colors!.ramps.tertiary).toEqual(palettes.teal);
    expect(colors!.given).toEqual(['primary', 'secondary', 'tertiary']);
  });

  test('a tertiary that lands on a status turns the other way', () => {
    const primary = palettes.blue;
    const chroma = chromaRatioOf(primary) * DERIVED_CHROMA_RATIO;
    const turned = rampAtHue(hueOf(primary) + TERTIARY_HUE_TURN, chroma);
    const statuses = {
      ...harmonizedStatusPalettes(primary),
      info: turned,
    };

    const flipped = derivedTertiary(primary, statuses);

    expect(flipped).toEqual(rampAtHue(hueOf(primary) - TERTIARY_HUE_TURN, chroma));
    expect(derivedTertiary(primary, harmonizedStatusPalettes(primary))).toEqual(turned);
  });
});
