import { palettes } from '../.storybook/palettes';
import { defineIdsTheme } from '../src/components/utility/ids-provider';

export const testTheme = defineIdsTheme({ palette: palettes.blue });
