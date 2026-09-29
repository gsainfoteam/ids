import {
  composeStories,
  setProjectAnnotations,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import axe, { type AxeResults, type RunOptions } from 'axe-core';
import { beforeAll, describe, expect, test } from 'vitest';

import * as preview from '../.storybook/preview';

type StoryFile = Record<string, StoryObj> & { default: Meta };

type A11yParameters = { options?: RunOptions; disable?: boolean };

const project = setProjectAnnotations([preview]);
beforeAll(project.beforeAll);

const storyFiles = import.meta.glob<StoryFile>('../src/**/*.stories.tsx', { eager: true });

const projectA11y = preview.default.parameters?.a11y as A11yParameters;

function describeViolations(violations: AxeResults['violations']) {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map(
          (node) =>
            `    ${node.target.join(' ')}\n      ${node.failureSummary?.replace(/\n/g, '\n      ')}`,
        )
        .join('\n');
      return `  [${violation.id}] (${violation.impact}) ${violation.help}\n    ${violation.helpUrl}\n${nodes}`;
    })
    .join('\n');
}

async function checkAccessibility(storyA11y: A11yParameters | undefined) {
  if (storyA11y?.disable) return;

  const options: RunOptions = {
    ...projectA11y.options,
    ...storyA11y?.options,
    rules: { ...projectA11y.options?.rules, ...storyA11y?.options?.rules },
  };
  const { violations } = await axe.run(document.body, options);

  expect(violations, `axe found violations:\n${describeViolations(violations)}`).toEqual([]);
}

for (const [path, module] of Object.entries(storyFiles)) {
  describe(path.replace('../src/', ''), () => {
    for (const [name, Story] of Object.entries(composeStories(module))) {
      test.skipIf(!Story.tags.includes('test'))(name, async () => {
        await Story.run();
        await checkAccessibility(Story.parameters.a11y as A11yParameters | undefined);
      });

      test.skipIf(!Story.tags.includes('test'))(`${name} in dark mode`, async () => {
        await Story.run({ globals: { ...Story.globals, idsMode: 'dark' } });
        await checkAccessibility(Story.parameters.a11y as A11yParameters | undefined);
      });
    }
  });
}
