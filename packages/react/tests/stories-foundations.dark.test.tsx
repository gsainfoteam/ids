import { checkEveryStory, type StoryFiles } from './story-checks';

checkEveryStory(
  'dark',
  import.meta.glob<StoryFiles[string]>('../src/foundations/**/*.stories.tsx', { eager: true }),
);
