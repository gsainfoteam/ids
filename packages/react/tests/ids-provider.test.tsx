import { useEffect, useState } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, onTestFinished, test, vi } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { IdsProvider, useTheme } from '../src';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const themeSeenBy: Record<string, ReturnType<typeof useTheme>> = {};
function Probe({ name }: { name: string }) {
  const theme = useTheme();
  useEffect(() => {
    themeSeenBy[name] = theme;
  });
  return <span data-probe={name} />;
}

async function preferColorScheme(value: 'light' | 'dark') {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value }],
  });
  onTestFinished(async () => {
    await cdp().send('Emulation.setEmulatedMedia', { features: [] });
  });
}

function countSchemeListeners() {
  const added = vi.spyOn(MediaQueryList.prototype, 'addEventListener');
  const removed = vi.spyOn(MediaQueryList.prototype, 'removeEventListener');
  onTestFinished(() => {
    added.mockRestore();
    removed.mockRestore();
  });
  return () => added.mock.calls.length - removed.mock.calls.length;
}

test('SSR: the root renders blue and light with a matching color-scheme', () => {
  const element = parse(
    renderToString(
      <IdsProvider>
        <p>x</p>
      </IdsProvider>,
    ),
  ).querySelector<HTMLElement>('[data-color]')!;
  expect(element.dataset.color).toBe('blue');
  expect(element.dataset.mode).toBe('light');
  expect(element.style.colorScheme).toBe('light');
});

test('SSR: system mode renders light because the server cannot see the scheme', () => {
  expect(renderToString(<IdsProvider defaultMode="system" />)).toMatch(/data-mode="light"/);
});

test('uncontrolled: setters change the provider, equal values do not notify', async () => {
  const onColorChange = vi.fn();
  const screen = await render(
    <IdsProvider defaultColor="orange" onColorChange={onColorChange} data-testid="root">
      <Probe name="a" />
    </IdsProvider>,
  );
  const root = screen.getByTestId('root');
  await expect.element(root).toHaveAttribute('data-color', 'orange');
  themeSeenBy.a.setColor('orange');
  expect(onColorChange).not.toHaveBeenCalled();
  themeSeenBy.a.setColor('green');
  await expect.element(root).toHaveAttribute('data-color', 'green');
  expect(onColorChange.mock.calls).toEqual([['green']]);
  themeSeenBy.a.toggleMode();
  await expect.element(root).toHaveAttribute('data-mode', 'dark');
  await expect.poll(() => themeSeenBy.a.mode).toBe('dark');
});

test('controlled: setters only report, the parent value decides', async () => {
  const onModeChange = vi.fn();
  function App() {
    const [mode, setMode] = useState<IdsProvider.Mode>('light');
    return (
      <>
        <IdsProvider mode={mode} onModeChange={onModeChange} data-testid="root">
          <Probe name="a" />
        </IdsProvider>
        <button onClick={() => setMode('dark')}>parent</button>
      </>
    );
  }
  const screen = await render(<App />);
  const root = screen.getByTestId('root');
  themeSeenBy.a.setMode('dark');
  expect(onModeChange.mock.calls).toEqual([['dark']]);
  await expect
    .element(root, { message: 'no change until the parent updates' })
    .toHaveAttribute('data-mode', 'light');
  await userEvent.click(screen.getByRole('button', { name: 'parent' }));
  await expect.element(root).toHaveAttribute('data-mode', 'dark');
  await expect.element(root).toHaveStyle({ colorScheme: 'dark' });
});

test('nested providers inherit the axis they do not set, and its setter reaches the owner', async () => {
  const screen = await render(
    <IdsProvider defaultColor="blue" defaultMode="light" data-testid="outer">
      <IdsProvider mode="dark" data-testid="dark">
        <Probe name="dark" />
      </IdsProvider>
      <IdsProvider color="orange" data-testid="orange">
        <Probe name="orange" />
      </IdsProvider>
    </IdsProvider>,
  );
  const outer = screen.getByTestId('outer');
  const dark = screen.getByTestId('dark');
  const orange = screen.getByTestId('orange');
  await expect.element(dark).toHaveAttribute('data-color', 'blue');
  await expect.element(dark).toHaveAttribute('data-mode', 'dark');
  await expect.element(orange).toHaveAttribute('data-color', 'orange');
  await expect.element(orange).toHaveAttribute('data-mode', 'light');

  await expect
    .element(dark, { message: 'a mode switch paints' })
    .toHaveClass('bg-(--ids-color-surface)');
  await expect.element(orange, { message: 'a color switch does not' }).not.toHaveClass(/bg-/);
  await expect.element(outer, { message: 'the root never paints' }).not.toHaveClass(/bg-/);

  themeSeenBy.dark.setColor('green');
  await expect.element(outer).toHaveAttribute('data-color', 'green');
  await expect.element(dark).toHaveAttribute('data-color', 'green');
  await expect
    .element(orange, { message: 'an owned axis keeps its own value' })
    .toHaveAttribute('data-color', 'orange');

  themeSeenBy.orange.setMode('dark');
  await expect.element(outer).toHaveAttribute('data-mode', 'dark');
  await expect.element(orange).toHaveAttribute('data-mode', 'dark');
  await expect.element(dark, { message: 'same mode as the parent now' }).not.toHaveClass(/bg-/);
});

test('system mode follows prefers-color-scheme live and toggles to an explicit mode', async () => {
  await preferColorScheme('light');
  const listening = countSchemeListeners();
  const screen = await render(
    <IdsProvider defaultMode="system" data-testid="root">
      <Probe name="a" />
    </IdsProvider>,
  );
  const root = screen.getByTestId('root');
  await expect.element(root).toHaveAttribute('data-mode', 'light');
  expect(listening()).toBe(1);
  await preferColorScheme('dark');
  await expect.element(root).toHaveAttribute('data-mode', 'dark');
  await expect.poll(() => themeSeenBy.a.resolvedMode).toBe('dark');
  expect(themeSeenBy.a.mode).toBe('system');
  themeSeenBy.a.toggleMode();
  await expect.poll(() => themeSeenBy.a.mode).toBe('light');
  expect(listening(), 'an explicit mode stops listening').toBe(0);
});

test('a nested provider inherits a system mode already resolved by its parent', async () => {
  await preferColorScheme('dark');
  const screen = await render(
    <IdsProvider defaultMode="system">
      <IdsProvider color="orange" data-testid="inner">
        <Probe name="inner" />
      </IdsProvider>
    </IdsProvider>,
  );
  await expect.element(screen.getByTestId('inner')).toHaveAttribute('data-mode', 'dark');
  expect(themeSeenBy.inner.mode).toBe('system');
});

test('asChild puts the attributes on the child element', async () => {
  const screen = await render(
    <IdsProvider asChild color="green">
      <section id="area" className="x" />
    </IdsProvider>,
  );
  const section = screen.container.querySelector<HTMLElement>('#area')!;
  expect(section.dataset.color).toBe('green');
  expect(section.dataset.mode).toBe('light');
  expect(section.className).toBe('x');
  expect(screen.container.firstElementChild).toBe(section);
});

test('useTheme outside a provider answers with defaults', async () => {
  await render(<Probe name="bare" />);
  expect(themeSeenBy.bare.color).toBe('blue');
  expect(themeSeenBy.bare.resolvedMode).toBe('light');
  expect(() => themeSeenBy.bare.setMode('dark')).not.toThrow();
});
