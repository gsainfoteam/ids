import {
  composeStories,
  setProjectAnnotations,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { beforeAll, describe, test } from 'vitest';

import * as preview from '../.storybook/preview';

type StoryFile = Record<string, StoryObj> & { default: Meta };

const project = setProjectAnnotations([preview]);
beforeAll(project.beforeAll);

const storyFiles = import.meta.glob<StoryFile>('../src/**/*.stories.tsx', { eager: true });

for (const [path, module] of Object.entries(storyFiles)) {
  describe(path.replace('../src/', ''), () => {
    for (const [name, Story] of Object.entries(composeStories(module))) {
      test.skipIf(!Story.tags.includes('test'))(name, () => Story.run());
    }
  });
}
