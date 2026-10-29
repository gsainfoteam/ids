import { checkEveryStory, type StoryFiles } from './story-checks';

checkEveryStory(
  'dark',
  import.meta.glob<StoryFiles[string]>('../src/components/navigation/**/*.stories.tsx', {
    eager: true,
  }),
);
