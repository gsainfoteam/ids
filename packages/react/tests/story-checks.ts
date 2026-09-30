import {
  composeStories,
  setProjectAnnotations,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import axe, { type AxeResults, type RunOptions } from 'axe-core';
import { configure } from 'storybook/test';
import { beforeAll, describe, expect, test } from 'vitest';

import * as preview from '../.storybook/preview';

type StoryFile = Record<string, StoryObj> & { default: Meta };

type A11yParameters = { options?: RunOptions; disable?: boolean };

export type StoryFiles = Record<string, StoryFile>;

const projectA11y = preview.default.parameters?.a11y as A11yParameters;

const PLAYS_WAIT_LONGER_WHILE_THREE_ENGINES_SHARE_THE_MACHINE = 5000;

configure({ asyncUtilTimeout: PLAYS_WAIT_LONGER_WHILE_THREE_ENGINES_SHARE_THE_MACHINE });

const MODES_ONE_AFTER_THE_OTHER = ['light', 'dark'] as const;

const A_GALLERY_RENDERS_AND_SCANS_EVERY_VARIANT_MS = 30_000;

const FLOATING_UI_FOCUS_GUARDS = '[data-floating-ui-focus-guard]';

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
  const { violations } = await axe.run(
    { include: [document.body], exclude: [[FLOATING_UI_FOCUS_GUARDS]] },
    options,
  );

  expect(violations, `axe found violations:\n${describeViolations(violations)}`).toEqual([]);
}

export function checkEveryStory(storyFiles: StoryFiles) {
  const project = setProjectAnnotations([preview]);
  beforeAll(project.beforeAll);

  for (const mode of MODES_ONE_AFTER_THE_OTHER)
    describe(mode, () => {
      for (const [path, module] of Object.entries(storyFiles))
        describe(path.replace('../src/', ''), () => {
          for (const [name, Story] of Object.entries(composeStories(module)))
            test.skipIf(!Story.tags.includes('test'))(
              name,
              {
                timeout:
                  name === 'Gallery' ? A_GALLERY_RENDERS_AND_SCANS_EVERY_VARIANT_MS : undefined,
              },
              async () => {
                await Story.run({ globals: { ...Story.globals, idsMode: mode } });
                await checkAccessibility(Story.parameters.a11y as A11yParameters | undefined);
              },
            );
        });
    });
}
