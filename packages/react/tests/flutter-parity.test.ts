import { expect, test } from 'vitest';

import { paletteHues, palettes, paletteSeeds } from '../.storybook/palettes';
import { MODES, resolveColors, slotsOf } from '../src/components/utility/ids-provider/theme-roles';
import { IDS_COLOR_FAMILIES } from '../src/tokens/color-roles';

import type { IdsNeutral, IdsStatus } from '../src/components/utility/ids-provider/theme';

const ROLES = IDS_COLOR_FAMILIES.flatMap(slotsOf);

const NEUTRALS: IdsNeutral[] = ['pure', 'tinted'];

const STATUSES: IdsStatus[] = ['harmonized', 'fixed'];

const FIXTURE = '../../core/tests/fixtures/theme-roles.json';

function resolvedRoles(primary: (typeof paletteHues)[number], neutral: IdsNeutral, status: IdsStatus) {
  const { colors } = resolveColors({ primary: palettes[primary], neutral, status });
  return {
    primary,
    seed: paletteSeeds[primary],
    neutral,
    status,
    ...Object.fromEntries(MODES.map((mode) => [mode, ROLES.map((role) => colors!.roles[mode][role])])),
  };
}

test('the fixture ids_flutter checks its roles against is what React resolves', async () => {
  const themes = paletteHues.flatMap((primary) =>
    NEUTRALS.flatMap((neutral) => STATUSES.map((status) => resolvedRoles(primary, neutral, status))),
  );
  const fixture = `{\n"roles": ${JSON.stringify(ROLES)},\n"themes": [\n${themes
    .map((theme) => JSON.stringify(theme))
    .join(',\n')}\n]\n}\n`;

  await expect(fixture).toMatchFileSnapshot(FIXTURE);
});
