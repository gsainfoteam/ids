import { checkEveryStory, type StoryFiles } from './story-checks';

checkEveryStory(
  'dark',
  import.meta.glob<StoryFiles[string]>('../src/components/layout/**/*.stories.tsx', {
    eager: true,
  }),
);
