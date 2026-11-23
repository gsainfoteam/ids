import { useLayoutEffect, useRef, type ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Button, ButtonGroup, IdsProvider, TextField, Toggle, ToggleGroup } from '../src';
import { paintedLayersOf } from './painted-layers';
import { testTheme } from './theme';

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
    <ButtonGroup aria-label="저장" className="gap-2">
      <ButtonGroup.Separator />
    </ButtonGroup>,
  );
  expect(spaced.classList, 'spaced controls leave no seam').not.toContain('-mx-px');
  for (const name of ['h-5', 'min-h-0', 'self-center'])
    expect(spaced.classList, `a spaced separator is short: ${name}`).toContain(name);

  const tiny = separator(
    <ButtonGroup aria-label="저장" className="gap-2" size="tiny" orientation="vertical">
      <ButtonGroup.Separator />
    </ButtonGroup>,
  );
  for (const name of ['w-4', 'self-center']) expect(tiny.classList, name).toContain(name);
});

test('any gap in className spaces the items apart, gap-0 keeps them joined', () => {
  const joinedWith = (className: string) =>
    separator(
      <ButtonGroup aria-label="저장" className={className}>
        <ButtonGroup.Separator />
      </ButtonGroup>,
    ).classList.contains('-mx-px');

  for (const className of ['gap-1', 'md:gap-2', 'gap-x-3', 'flex-wrap gap-[6px]', '!gap-2'])
    expect(joinedWith(className), className).toBe(false);
  for (const className of ['', 'gap-0', 'flex-wrap', 'has-[>[data-group]]:ms-2'])
    expect(joinedWith(className), className).toBe(true);
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

test('whatever draws the focus ring sits above the joined items beside it', async () => {
  const screen = await render(
    <IdsProvider theme={testTheme}>
      <ButtonGroup aria-label="주소">
        <TextField aria-label="도메인" data-1p-ignore data-lpignore="true">
          <span>https://</span>
        </TextField>
        <Button>이동</Button>
      </ButtonGroup>
    </IdsProvider>,
  );
  const field = screen.getByRole('textbox', { name: '도메인' });
  const go = screen.getByRole('button', { name: '이동' });

  await userEvent.click(field);
  await expect.element(field).toHaveFocus();
  expect(getComputedStyle(field.element().closest('[data-text-field]')!).zIndex).toBe('30');

  await userEvent.keyboard('{Tab}');
  await expect.element(go).toHaveFocus();
  await userEvent.hover(go);
  await expect.element(go).toHaveAttribute('data-hovered');
  expect(getComputedStyle(go.element()).zIndex).toBe('30');
});

const dropShadow = /0px 1px 3px 0px/;

test('joined glossy buttons share one edge and one shadow drawn by the group', async () => {
  const screen = await render(
    <IdsProvider theme={testTheme}>
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
    <IdsProvider theme={testTheme}>
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
  expect(paintedLayersOf(right!)).toEqual([]);
  expect(getComputedStyle(right!).marginInlineStart).toBe('-1px');
});

test('spaced glossy buttons keep their own shadows', async () => {
  const screen = await render(
    <IdsProvider theme={testTheme}>
      <ButtonGroup aria-label="저장" variant="glossy" className="gap-2">
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
