import { act } from 'react';

import {
  composeStories,
  setProjectAnnotations,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

import * as preview from '../.storybook/preview';

type StoryFile = Record<string, StoryObj> & { default: Meta };

const project = setProjectAnnotations([preview]);
beforeAll(project.beforeAll);
beforeAll(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});

const storyFiles = import.meta.glob<StoryFile>('../src/**/*.stories.tsx', { eager: true });

let mounted: { root: Root; host: HTMLElement } | undefined;

afterEach(() => {
  act(() => mounted?.root.unmount());
  mounted?.host.remove();
  mounted = undefined;
});

for (const [path, module] of Object.entries(storyFiles)) {
  describe(path.replace('../src/', ''), () => {
    for (const [name, Story] of Object.entries(composeStories(module))) {
      test(name, async () => {
        const host = document.createElement('div');
        host.innerHTML = renderToString(<Story />);
        document.body.append(host);

        const errors = vi.spyOn(console, 'error');
        const recoverable: unknown[] = [];
        await act(async () => {
          mounted = {
            host,
            root: hydrateRoot(host, <Story />, {
              onRecoverableError: (error) => recoverable.push(error),
            }),
          };
        });

        expect(recoverable).toEqual([]);
        expect(errors.mock.calls).toEqual([]);
        errors.mockRestore();
      });
    }
  });
}
