import type { ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';

import { Button, ButtonGroup, IconButton, Toggle } from '../src';

const ssr = (node: ReactNode) => new DOMParser().parseFromString(renderToString(node), 'text/html');
const svg = <svg aria-hidden />;

test('a named group that hands its size and variant down unless a control sets its own', () => {
  const doc = ssr(
    <ButtonGroup aria-label="편집" size="tiny" variant="outline">
      <Button id="button">저장</Button>
      <IconButton id="icon" icon={svg} aria-label="더보기" />
      <Toggle id="toggle">굵게</Toggle>
      <Button id="own" size="standard" variant="solid">
        게시
      </Button>
    </ButtonGroup>,
  );
  const group = doc.querySelector('[role="group"]')!;
  expect(group.getAttribute('aria-label')).toBe('편집');
  expect(group.getAttribute('data-orientation')).toBe('horizontal');
  for (const id of ['button', 'icon', 'toggle']) {
    const control = doc.getElementById(id)!;
    expect(control.dataset.size, id).toBe('tiny');
    expect(control.dataset.variant, id).toBe('outline');
  }
  expect(doc.getElementById('own')!.dataset.size).toBe('standard');
  expect(doc.getElementById('own')!.dataset.variant).toBe('solid');
});

test('an inner group inherits the outer size and variant', () => {
  const doc = ssr(
    <ButtonGroup aria-label="편집" size="tiny" variant="soft">
      <ButtonGroup>
        <Button id="inner">복사</Button>
      </ButtonGroup>
    </ButtonGroup>,
  );
  expect(doc.getElementById('inner')!.dataset.size).toBe('tiny');
  expect(doc.getElementById('inner')!.dataset.variant).toBe('soft');
  expect(doc.querySelectorAll('[role="group"]')).toHaveLength(2);
});

test('the separator is announced across the group direction', () => {
  const horizontal = ssr(
    <ButtonGroup aria-label="저장">
      <Button>저장</Button>
      <ButtonGroup.Separator />
    </ButtonGroup>,
  );
  expect(horizontal.querySelector('[role="separator"]')!.getAttribute('aria-orientation')).toBe(
    'vertical',
  );
  const vertical = ssr(
    <ButtonGroup aria-label="저장" orientation="vertical">
      <ButtonGroup.Separator />
    </ButtonGroup>,
  );
  expect(vertical.querySelector('[role="separator"]')!.getAttribute('aria-orientation')).toBe(
    'horizontal',
  );
  expect(() => renderToString(<ButtonGroup.Separator />)).toThrow(/inside ButtonGroup/);
});

test('Text joins like an outline control and can render as its child', () => {
  const doc = ssr(
    <ButtonGroup aria-label="주소" size="tiny">
      <ButtonGroup.Text id="text">https://</ButtonGroup.Text>
      <ButtonGroup.Text asChild>
        <label id="label" htmlFor="url">
          URL
        </label>
      </ButtonGroup.Text>
    </ButtonGroup>,
  );
  expect(doc.getElementById('text')!.dataset.variant).toBe('outline');
  expect(doc.getElementById('text')!.className).toMatch(/text-button-tiny/);
  expect(doc.getElementById('label')!.tagName).toBe('LABEL');
  expect(doc.getElementById('label')!.dataset.variant).toBe('outline');
});
