import { checkEveryStoryInEnglish } from './translation-checks';

import type { StoryFiles } from './story-checks';

checkEveryStoryInEnglish(
  import.meta.glob<StoryFiles[string]>('../src/foundations/**/*.stories.tsx', { eager: true }),
  import.meta.glob<string>('../src/foundations/**/*.stories.tsx', {
    eager: true,
    query: '?raw',
    import: 'default',
  }),
);
