import { expect, test } from 'vitest';

import { paletteHues, palettes, paletteSeeds } from '../.storybook/palettes';
import { MODES, resolveColors, slotsOf } from '../src/components/utility/ids-provider/theme-roles';
import { IDS_COLOR_FAMILIES } from '../src/tokens/color-roles';
import { IDS_COMPONENT_COLORS } from '../src/tokens/component-tokens';

import type { IdsNeutral, IdsStatus } from '../src/components/utility/ids-provider/theme';

const ROLES = IDS_COLOR_FAMILIES.flatMap(slotsOf);

const COLORED_FAMILIES = IDS_COLOR_FAMILIES.filter((family) => family !== 'neutral');

const COMPONENT_COLORS = Object.keys(IDS_COMPONENT_COLORS) as (keyof typeof IDS_COMPONENT_COLORS)[];

const NEUTRALS: IdsNeutral[] = ['pure', 'tinted'];

const STATUSES: IdsStatus[] = ['harmonized', 'fixed'];

const FIXTURE = '../../core/tests/fixtures/theme-roles.json';

const EVERY_PALETTE_RESOLVES_ON_A_RUNNER_SHARED_WITH_THE_BROWSER_TESTS_MS = 30_000;

function resolvedRoles(primary: (typeof paletteHues)[number], neutral: IdsNeutral, status: IdsStatus) {
  const { colors } = resolveColors({ primary: palettes[primary], neutral, status });
  return {
    primary,
    seed: paletteSeeds[primary],
    neutral,
    status,
    ...Object.fromEntries(MODES.map((mode) => [mode, ROLES.map((role) => colors!.roles[mode][role])])),
    scales: Object.fromEntries(
      MODES.map((mode) => [
        mode,
        [colors!.neutral[mode], ...COLORED_FAMILIES.map((family) => colors!.palettes[family][mode])],
      ]),
    ),
    components: Object.fromEntries(
      MODES.map((mode) => [
        mode,
        COMPONENT_COLORS.map((token) => colors!.roles[mode][IDS_COMPONENT_COLORS[token][mode]]),
      ]),
    ),
  };
}

test(
  'the fixture ids_flutter checks its roles against is what React resolves',
  { timeout: EVERY_PALETTE_RESOLVES_ON_A_RUNNER_SHARED_WITH_THE_BROWSER_TESTS_MS },
  async () => {
    const themes = paletteHues.flatMap((primary) =>
      NEUTRALS.flatMap((neutral) => STATUSES.map((status) => resolvedRoles(primary, neutral, status))),
    );
    const fixture = `{\n"roles": ${JSON.stringify(ROLES)},\n"families": ${JSON.stringify(IDS_COLOR_FAMILIES)},\n"components": ${JSON.stringify(COMPONENT_COLORS)},\n"themes": [\n${themes
      .map((theme) => JSON.stringify(theme))
      .join(',\n')}\n]\n}\n`;

    await expect(fixture).toMatchFileSnapshot(FIXTURE);
  },
);
