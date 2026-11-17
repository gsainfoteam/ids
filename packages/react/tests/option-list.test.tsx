import { useState } from 'react';

import { beforeEach, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { ChipField, IdsProvider, Menu, Select } from '../src';
import { testTheme } from './theme';

beforeEach(async () => {
  await page.viewport(1024, 768);
});

function colorOf(variable: string) {
  const probe = document.createElement('div');
  probe.style.backgroundColor = `var(${variable})`;
  document.querySelector('[data-mode]')!.append(probe);
  const color = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return color;
}

const option = (name: string) => page.getByRole('option', { name, exact: true }).element();
const background = (element: Element) => getComputedStyle(element).backgroundColor;
const text = (element: Element) => getComputedStyle(element).color;
const indicatorOf = (element: Element) =>
  element.querySelector('[data-select-item-indicator], [data-menu-item-indicator], [aria-hidden]')!;

test('Select: a selected option is primary soft with a primary check, the highlight stays neutral', async () => {
  const screen = await render(
    <IdsProvider theme={testTheme}>
      <p>Outside</p>
      <Select
        aria-label="Fruit"
        selectionMode="multiple"
        defaultValue={['apple', 'banana', 'grape']}
        defaultOpen
      >
        <Select.Item value="apple">Apple</Select.Item>
        <Select.Item value="banana">Banana</Select.Item>
        <Select.Item value="cherry">Cherry</Select.Item>
        <Select.Item value="grape">Grape</Select.Item>
      </Select>
    </IdsProvider>,
  );
  await expect.element(screen.getByRole('option', { name: 'Grape' })).toBeVisible();

  expect(option('Apple').hasAttribute('data-highlighted')).toBe(true);
  expect(background(option('Apple'))).toBe(colorOf('--ids-color-bg-primary-soft-hover'));
  expect(background(option('Grape'))).toBe(colorOf('--ids-color-bg-primary-soft'));
  expect(text(option('Grape'))).toBe(colorOf('--ids-color-text-on-primary-soft'));
  expect(text(indicatorOf(option('Grape')))).toBe(colorOf('--ids-color-text-primary'));
  expect(background(option('Cherry'))).toBe('rgba(0, 0, 0, 0)');

  await userEvent.hover(option('Cherry'));
  await expect
    .poll(() => background(option('Cherry')))
    .toBe(colorOf('--ids-color-bg-neutral-soft'));
  await userEvent.hover(option('Banana'));
  await expect
    .poll(() => background(option('Banana')))
    .toBe(colorOf('--ids-color-bg-primary-soft-hover'));
});

test('Select: neighbouring selected options join into one shape', async () => {
  const screen = await render(
    <IdsProvider theme={testTheme}>
      <Select
        aria-label="Fruit"
        selectionMode="multiple"
        defaultValue={['apple', 'banana', 'grape']}
        defaultOpen
      >
        <Select.Item value="apple">Apple</Select.Item>
        <Select.Item value="banana">Banana</Select.Item>
        <Select.Item value="cherry">Cherry</Select.Item>
        <Select.Item value="grape">Grape</Select.Item>
      </Select>
    </IdsProvider>,
  );
  await expect.element(screen.getByRole('option', { name: 'Grape' })).toBeVisible();

  const corners = (name: string) => {
    const style = getComputedStyle(option(name));
    return [style.borderTopLeftRadius, style.borderBottomLeftRadius];
  };
  const [rounded] = corners('Grape');

  expect(rounded).not.toBe('0px');
  expect(corners('Apple')).toEqual([rounded, '0px']);
  expect(corners('Banana')).toEqual(['0px', rounded]);
  expect(corners('Grape')).toEqual([rounded, rounded]);
});

test('Menu: checked checkbox and radio items are primary soft, unchecked ones hover neutral', async () => {
  function Demo() {
    const [grid, setGrid] = useState(true);
    const [ruler, setRuler] = useState(false);
    const [zoom, setZoom] = useState('100');

    return (
      <IdsProvider theme={testTheme}>
        <Menu defaultOpen>
          <Menu.Trigger>View</Menu.Trigger>
          <Menu.Content>
            <Menu.CheckboxItem checked={grid} onCheckedChange={setGrid}>
              Grid
            </Menu.CheckboxItem>
            <Menu.CheckboxItem checked={ruler} onCheckedChange={setRuler}>
              Ruler
            </Menu.CheckboxItem>
            <Menu.RadioGroup value={zoom} onValueChange={setZoom}>
              <Menu.RadioItem value="100">100%</Menu.RadioItem>
              <Menu.RadioItem value="150">150%</Menu.RadioItem>
            </Menu.RadioGroup>
          </Menu.Content>
        </Menu>
      </IdsProvider>
    );
  }

  const screen = await render(<Demo />);
  const grid = screen.getByRole('menuitemcheckbox', { name: 'Grid' });
  const ruler = screen.getByRole('menuitemcheckbox', { name: 'Ruler' });
  const zoom = screen.getByRole('menuitemradio', { name: '100%' });
  await expect.element(grid).toBeVisible();

  expect(background(grid.element())).toBe(colorOf('--ids-color-bg-primary-soft'));
  expect(text(grid.element())).toBe(colorOf('--ids-color-text-on-primary-soft'));
  expect(text(indicatorOf(grid.element()))).toBe(colorOf('--ids-color-text-primary'));
  expect(background(zoom.element())).toBe(colorOf('--ids-color-bg-primary-soft'));
  expect(background(indicatorOf(zoom.element()).firstElementChild!)).toBe(
    colorOf('--ids-color-text-primary'),
  );

  await userEvent.hover(ruler);
  await expect.poll(() => background(ruler.element())).toBe(colorOf('--ids-color-bg-neutral-soft'));
  await userEvent.hover(grid);
  await expect
    .poll(() => background(grid.element()))
    .toBe(colorOf('--ids-color-bg-primary-soft-hover'));
});

test('ChipField: a chosen option is primary soft with a primary check', async () => {
  const screen = await render(
    <IdsProvider theme={testTheme}>
      <ChipField aria-label="Stack" defaultValue={['svelte']} defaultOpen>
        <ChipField.Item value="react">React</ChipField.Item>
        <ChipField.Item value="vue">Vue</ChipField.Item>
        <ChipField.Item value="svelte">Svelte</ChipField.Item>
      </ChipField>
    </IdsProvider>,
  );
  await expect.element(screen.getByRole('option', { name: 'Svelte' })).toBeVisible();

  expect(option('Svelte').hasAttribute('data-highlighted')).toBe(false);
  expect(background(option('Svelte'))).toBe(colorOf('--ids-color-bg-primary-soft'));
  expect(text(option('Svelte'))).toBe(colorOf('--ids-color-text-on-primary-soft'));
  expect(text(indicatorOf(option('Svelte')))).toBe(colorOf('--ids-color-text-primary'));

  await userEvent.hover(option('Vue'));
  await expect.poll(() => background(option('Vue'))).toBe(colorOf('--ids-color-bg-neutral-soft'));
});
