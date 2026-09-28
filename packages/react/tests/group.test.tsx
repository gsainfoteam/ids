import type { ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';

import { Button, ButtonGroup, Toggle, ToggleGroup } from '../src';

const separator = (node: ReactNode) =>
  new DOMParser()
    .parseFromString(renderToString(node), 'text/html')
    .querySelector<HTMLElement>('[data-group-separator]')!;

test('the separator is a Divider across the group that overlaps the joined borders', () => {
  const line = separator(
    <ButtonGroup aria-label="저장">
      <Button>저장</Button>
      <ButtonGroup.Separator id="line" />
      <Button>더보기</Button>
    </ButtonGroup>,
  );
  expect(line.hasAttribute('data-divider')).toBe(true);
  expect(line.id).toBe('line');
  expect(line.getAttribute('role')).toBe('separator');
  expect(line.getAttribute('aria-orientation')).toBe('vertical');
  expect(line.dataset.orientation).toBe('vertical');
  for (const name of ['w-px', 'z-25', '-mx-px']) expect(line.classList, name).toContain(name);

  const vertical = separator(
    <ButtonGroup aria-label="저장" orientation="vertical">
      <ButtonGroup.Separator />
    </ButtonGroup>,
  );
  expect(vertical.getAttribute('aria-orientation')).toBe('horizontal');
  for (const name of ['h-px', '-my-px']) expect(vertical.classList, name).toContain(name);

  const spaced = separator(
    <ButtonGroup aria-label="저장" attached={false}>
      <ButtonGroup.Separator />
    </ButtonGroup>,
  );
  expect(spaced.classList, 'spaced controls leave no seam').not.toContain('-mx-px');
});

test('inside a single-select ToggleGroup the separator only draws a line', () => {
  const line = separator(
    <ToggleGroup aria-label="정렬" defaultValue="left">
      <Toggle value="left">왼쪽</Toggle>
      <ToggleGroup.Separator />
      <Toggle value="right">오른쪽</Toggle>
    </ToggleGroup>,
  );
  expect(line.hasAttribute('data-divider')).toBe(true);
  expect(line.getAttribute('aria-hidden')).toBe('true');
  expect(line.hasAttribute('role')).toBe(false);
});
