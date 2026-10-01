import {
  composeStories,
  setProjectAnnotations,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { renderToString } from 'react-dom/server';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import * as preview from '../.storybook/preview';

type StoryFile = Record<string, StoryObj> & { default: Meta };

const project = setProjectAnnotations([preview]);
beforeAll(project.beforeAll);

const storyFiles = import.meta.glob<StoryFile>('../src/**/*.stories.tsx', { eager: true });

test('the server has no DOM', () => {
  expect(typeof window).toBe('undefined');
  expect(typeof document).toBe('undefined');
});

for (const [path, module] of Object.entries(storyFiles)) {
  describe(path.replace('../src/', ''), () => {
    for (const [name, Story] of Object.entries(composeStories(module))) {
      test(name, () => {
        const complaints = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')];

        expect(renderToString(<Story />)).not.toBe('');
        expect(complaints.flatMap((spy) => spy.mock.calls)).toEqual([]);

        for (const spy of complaints) spy.mockRestore();
      });
    }
  });
}
