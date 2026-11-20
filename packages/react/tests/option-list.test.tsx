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

const transparent = 'rgba(0, 0, 0, 0)';

function layerAlpha(element: Element) {
  const image = getComputedStyle(element).backgroundImage;
  const color = image.match(/linear-gradient\(((?:color|rgba?)\([^)]*\))/)?.[1];
  if (!color) return 0;
  const alpha =
    color.match(/\/\s*([\d.]+)\)$/)?.[1] ?? color.match(/rgba\([^)]*,\s*([\d.]+)\)$/)?.[1];
  return alpha === undefined ? 1 : Number(alpha);
}

test('Select: a selected option keeps the surface and a primary check, the highlight is the hover layer', async () => {
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

  expect(option('Apple').hasAttribute('data-highlighted')).toBe(true);
  expect(layerAlpha(option('Apple'))).toBeGreaterThan(0);
  expect(background(option('Grape'))).toBe(transparent);
  expect(layerAlpha(option('Grape'))).toBe(0);
  expect(text(option('Grape'))).toBe(text(option('Cherry')));
  expect(text(indicatorOf(option('Grape')))).toBe(colorOf('--ids-color-text-primary'));
  expect(background(option('Cherry'))).toBe(transparent);

  await userEvent.hover(option('Cherry'));
  await expect.poll(() => layerAlpha(option('Cherry'))).toBeGreaterThan(0);
  const hoverLayer = getComputedStyle(option('Cherry')).backgroundImage;
  await userEvent.hover(option('Banana'));
  await expect.poll(() => getComputedStyle(option('Banana')).backgroundImage).toBe(hoverLayer);
  expect(background(option('Banana'))).toBe(transparent);
});

test('Menu: checked checkbox and radio items keep the surface and a primary indicator', async () => {
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

  expect(grid.element().hasAttribute('data-highlighted')).toBe(false);
  expect(background(grid.element())).toBe(transparent);
  expect(layerAlpha(grid.element())).toBe(0);
  expect(text(grid.element())).toBe(text(ruler.element()));
  expect(text(indicatorOf(grid.element()))).toBe(colorOf('--ids-color-text-primary'));
  expect(background(zoom.element())).toBe(transparent);
  expect(background(indicatorOf(zoom.element()).firstElementChild!)).toBe(
    colorOf('--ids-color-text-primary'),
  );

  await userEvent.hover(ruler);
  await expect.poll(() => layerAlpha(ruler.element())).toBeGreaterThan(0);
  const hoverLayer = getComputedStyle(ruler.element()).backgroundImage;
  await userEvent.hover(grid);
  await expect.poll(() => getComputedStyle(grid.element()).backgroundImage).toBe(hoverLayer);
  expect(background(grid.element())).toBe(transparent);
});

test('ChipField: a chosen option keeps the surface and a primary check', async () => {
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
  expect(background(option('Svelte'))).toBe(transparent);
  expect(layerAlpha(option('Svelte'))).toBe(0);
  expect(text(option('Svelte'))).toBe(text(option('React')));
  expect(text(indicatorOf(option('Svelte')))).toBe(colorOf('--ids-color-text-primary'));

  await userEvent.hover(option('Vue'));
  await expect.poll(() => layerAlpha(option('Vue'))).toBeGreaterThan(0);
});
