import { checkEveryStoryInEnglish } from './translation-checks';

import type { StoryFiles } from './story-checks';

checkEveryStoryInEnglish(
  import.meta.glob<StoryFiles[string]>('../src/components/form/**/*.stories.tsx', { eager: true }),
  import.meta.glob<string>('../src/components/form/**/*.stories.tsx', {
    eager: true,
    query: '?raw',
    import: 'default',
  }),
);
