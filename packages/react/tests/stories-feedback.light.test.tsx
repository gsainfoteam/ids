import { checkEveryStory, type StoryFiles } from './story-checks';

checkEveryStory(
  'light',
  import.meta.glob<StoryFiles[string]>('../src/components/feedback/**/*.stories.tsx', {
    eager: true,
  }),
);
