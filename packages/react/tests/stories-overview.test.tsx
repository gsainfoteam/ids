import { checkEveryStory, type StoryFiles } from './story-checks';

checkEveryStory(
  import.meta.glob<StoryFiles[string]>('../src/overview/**/*.stories.tsx', { eager: true }),
);
