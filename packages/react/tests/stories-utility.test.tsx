import { checkEveryStory, type StoryFiles } from './story-checks';

checkEveryStory(
  import.meta.glob<StoryFiles[string]>('../src/components/utility/**/*.stories.tsx', {
    eager: true,
  }),
);
