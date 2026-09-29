import { useLayoutEffect, useRef, type ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

import { Button, ButtonGroup, IdsProvider, Toggle, ToggleGroup } from '../src';

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

function OpenPopover() {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => ref.current?.showPopover(), []);
  return (
    <div ref={ref} popover="manual" data-testid="popover" className="rounded-standard fixed m-0">
      메뉴
    </div>
  );
}

test('an open popover and its focus guards beside the joined items stay apart from them', async () => {
  const screen = await render(
    <ButtonGroup aria-label="저장">
      <Button variant="outline">저장</Button>
      <Button variant="outline">더보기</Button>
      <span data-floating-ui-focus-guard="" tabIndex={0} />
      <OpenPopover />
      <span data-floating-ui-focus-guard="" tabIndex={0} />
    </ButtonGroup>,
  );
  const [save, more] = screen.container.querySelectorAll('button');
  const popover = screen.getByTestId('popover').element() as HTMLElement;
  expect(getComputedStyle(save).borderEndEndRadius).toBe('0px');
  expect(getComputedStyle(more).borderStartStartRadius).toBe('0px');
  expect(getComputedStyle(more).borderEndEndRadius, 'the last item keeps its corner').toBe('10px');
  expect(getComputedStyle(popover).borderStartStartRadius).toBe('10px');
  expect(getComputedStyle(popover).borderEndEndRadius).toBe('10px');
  expect(getComputedStyle(popover).position, 'the top layer box stays fixed').toBe('fixed');
});

test('outline items either side of an open popover still share one border', async () => {
  const screen = await render(
    <ButtonGroup aria-label="저장">
      <Button variant="outline">저장</Button>
      <OpenPopover />
      <Button variant="outline">더보기</Button>
    </ButtonGroup>,
  );
  const [save, more] = screen.container.querySelectorAll('button');
  expect(getComputedStyle(save).borderEndEndRadius).toBe('0px');
  expect(getComputedStyle(more).borderStartStartRadius).toBe('0px');
  expect(getComputedStyle(more).marginInlineStart).toBe('-1px');
});

const dropShadow = /0px 1px 3px 0px/;

test('joined glossy buttons share one edge and one shadow drawn by the group', async () => {
  const screen = await render(
    <IdsProvider>
      <ButtonGroup aria-label="저장" variant="glossy">
        <Button>저장</Button>
        <Button>더보기</Button>
      </ButtonGroup>
    </IdsProvider>,
  );
  const group = screen.getByRole('group', { name: '저장' }).element();
  const [save, more] = group.querySelectorAll('button');
  await expect.element(save!).toHaveAttribute('data-variant', 'glossy');

  expect(getComputedStyle(more!).marginInlineStart).toBe('-1px');
  expect(getComputedStyle(save!).boxShadow).not.toMatch(dropShadow);
  expect(getComputedStyle(more!).boxShadow).not.toMatch(dropShadow);
  expect(getComputedStyle(group).boxShadow).toMatch(dropShadow);
  expect(getComputedStyle(group).borderStartStartRadius).toBe('10px');
});

test('a glossy ToggleGroup draws no group shadow, and the pressed item keeps its own', async () => {
  const screen = await render(
    <IdsProvider>
      <ToggleGroup aria-label="정렬" variant="glossy" defaultValue="left">
        <Toggle value="left">왼쪽</Toggle>
        <Toggle value="right">오른쪽</Toggle>
      </ToggleGroup>
    </IdsProvider>,
  );
  const group = screen.getByRole('radiogroup', { name: '정렬' }).element();
  const [left, right] = group.querySelectorAll('button');
  await expect.element(left!).toHaveAttribute('data-pressed');

  expect(getComputedStyle(group).boxShadow).not.toMatch(dropShadow);
  expect(getComputedStyle(left!).boxShadow).toMatch(dropShadow);
  expect(getComputedStyle(right!).backgroundImage).toBe('none');
  expect(getComputedStyle(right!).marginInlineStart).toBe('-1px');
});

test('spaced glossy buttons keep their own shadows', async () => {
  const screen = await render(
    <IdsProvider>
      <ButtonGroup aria-label="저장" variant="glossy" attached={false}>
        <Button>저장</Button>
        <Button>더보기</Button>
      </ButtonGroup>
    </IdsProvider>,
  );
  const group = screen.getByRole('group', { name: '저장' }).element();
  for (const button of group.querySelectorAll('button'))
    expect(getComputedStyle(button).boxShadow).toMatch(dropShadow);
  expect(getComputedStyle(group).boxShadow).not.toMatch(dropShadow);
});
