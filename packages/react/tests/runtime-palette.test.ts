import { readFileSync } from 'node:fs';

import { converter, interpolate, wcagContrast } from 'culori';
import { expect, test } from 'vitest';

type Fixture = {
  name: string;
  shades: Record<string, string>;
  modes: Record<'light' | 'dark', { roles: Record<string, string>; tints: number[][] }>;
};

const fixtures = JSON.parse(
  readFileSync(new URL('../../core/tests/fixtures/runtime-themes.json', import.meta.url), 'utf8'),
) as Fixture[];

test.each(fixtures)('$name shares the Flutter contrast reference', ({ shades, modes }) => {
  for (const mode of ['light', 'dark'] as const) {
    const { roles, tints } = modes[mode];
    const mix = interpolate([roles.secondary, roles.primary], 'oklab');
    for (const [index, amount] of [0.06, 0.12].entries()) {
      const tint = converter('rgb')(mix(amount))!;
      for (const [channel, value] of [tint.r, tint.g, tint.b].entries())
        expect(value).toBeCloseTo(tints[index][channel], 6);
    }
    const firstPassing = (steps: number[], backgrounds: string[]) =>
      steps
        .map((step) => shades[step])
        .find((shade) => backgrounds.every((background) => wcagContrast(shade, background) >= 4.5));
    const onPrimary = wcagContrast('#ffffff', shades[600]) >= 4.5 ? '#ffffff' : '#0a0a0a';
    expect(roles['on-primary'].toLowerCase()).toBe(onPrimary);
    const candidates = mode === 'light' ? [700, 800, 900] : [400, 300, 200];
    const onSecondary = candidates
      .map((step) => shades[step])
      .find((shade) => [0, 0.06, 0.12].every((amount) => wcagContrast(shade, mix(amount)) >= 4.5));
    expect(roles['on-secondary'].toLowerCase()).toBe(onSecondary);
    expect(roles.accent.toLowerCase()).toBe(
      firstPassing(mode === 'light' ? [600, 700, 800, 900] : [500, 400, 300], [
        mode === 'light' ? '#ffffff' : '#0a0a0a',
        roles.secondary,
      ]),
    );
  }
});
