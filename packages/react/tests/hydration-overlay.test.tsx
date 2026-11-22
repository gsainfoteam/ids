import { checkEveryStoryHydrates } from './hydration-checks';

import type { StoryFiles } from './story-checks';

checkEveryStoryHydrates(
  import.meta.glob<StoryFiles[string]>('../src/components/overlay/**/*.stories.tsx', {
    eager: true,
  }),
);
