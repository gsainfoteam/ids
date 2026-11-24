import { useEffect, useState } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, onTestFinished, test, vi } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { palettes } from '../.storybook/palettes';
import { Button, IdsProvider, createIdsPalette, useTheme } from '../src';
import { skipWithoutCdp } from './engines';
import { testTheme } from './theme';
import { paletteFromRamp } from '../src/components/utility/ids-provider/lib/palette-scales';

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

test('SSR: the root writes both modes of the theme into its style', () => {
  const element = parse(
    renderToString(
      <IdsProvider theme={testTheme}>
        <p>x</p>
      </IdsProvider>,
    ),
  ).querySelector<HTMLElement>('[data-mode]')!;
  expect(element.dataset.mode).toBe('light');
  expect(element.hasAttribute('data-color')).toBe(false);
  expect(element.style.colorScheme).toBe('light');
  expect(element.style.getPropertyValue('--ids-theme-light-bg-primary-solid')).toBe(
    palettes.blue[600],
  );
  expect(element.style.getPropertyValue('--ids-theme-light-bg-primary-soft')).toBe(
    palettes.blue[100],
  );
  expect(element.style.getPropertyValue('--ids-theme-dark-bg-primary-soft')).toBe(
    paletteFromRamp(palettes.blue).dark[3],
  );
  expect(element.style.getPropertyValue('--ids-theme-dark-text-on-primary-soft')).toBe(
    paletteFromRamp(palettes.blue).dark[8],
  );
  expect(element.style.getPropertyValue('--ids-theme-light-bg-danger-solid')).toMatch(/^#/);
  expect(element.style.getPropertyValue('--ids-theme-light-bg-secondary-solid')).toMatch(/^#/);
  expect(element.getAttribute('style')).not.toMatch(/--ids-theme-light-bg-base/);
});

test('SSR: a pure neutral leaves its steps to ids.css but writes the text it computes', () => {
  const element = parse(
    renderToString(
      <IdsProvider theme={testTheme}>
        <p>x</p>
      </IdsProvider>,
    ),
  ).querySelector<HTMLElement>('[data-mode]')!;

  expect(element.getAttribute('style')).not.toMatch(/--ids-theme-dark-bg-neutral-solid/);
  expect(element.style.getPropertyValue('--ids-theme-dark-text-on-neutral-solid')).toBe('#0a0a0a');
  expect(element.style.getPropertyValue('--ids-theme-light-text-on-neutral-solid')).toBe('#ffffff');
  expect(element.style.getPropertyValue('--ids-theme-light-text-on-base')).toBe('#0a0a0a');
  expect(element.style.getPropertyValue('--ids-theme-dark-text-on-block')).toBe('#fafafa');
});

test('SSR: radius and corner shape become variables on the element', () => {
  const element = parse(
    renderToString(
      <IdsProvider
        theme={{
          ...testTheme,
          radius: 12,
          cornerShape: 'squircle',
        }}
      />,
    ),
  ).querySelector<HTMLElement>('[data-mode]')!;
  expect(element.style.getPropertyValue('--ids-theme-radius-standard')).toBe('12px');
  expect(element.style.getPropertyValue('--ids-theme-radius-indicator')).toBe('5px');
  expect(element.style.getPropertyValue('--ids-theme-radius-container')).toBe('19px');
  expect(element.style.getPropertyValue('--ids-font-family-sans')).toBe('');
  expect(element.style.fontFamily).toBe('');
  expect(element.style.getPropertyValue('--ids-corner-shape')).toBe('squircle');
  expect(element.style.getPropertyValue('--ids-theme-corner-radius-scale')).toBe('1.84');
});

test('SSR: one color is enough, the provider builds the palette from it', () => {
  const element = parse(
    renderToString(<IdsProvider theme={{ primary: palettes.violet[500] }} />),
  ).querySelector<HTMLElement>('[data-mode]')!;
  const built = createIdsPalette(palettes.violet[500])!;
  expect(element.style.getPropertyValue('--ids-theme-light-bg-primary-solid')).toBe(built.light[6]);
  expect(element.style.getPropertyValue('--ids-theme-dark-bg-primary-soft')).toBe(built.dark[3]);
});

test('SSR: a scale is an attribute, and no scale writes none', () => {
  const html = renderToString(
    <IdsProvider theme={testTheme}>
      <IdsProvider.Scope theme={{ scale: 1.5 }} />
    </IdsProvider>,
  );
  expect(html.match(/data-scale="[^"]*"/g)).toEqual(['data-scale="1.5"']);
  expect(html).toMatch(/--ids-scale:1\.5/);
});

test('SSR: system mode renders light because the server cannot see the scheme', () => {
  expect(renderToString(<IdsProvider theme={testTheme} defaultMode="system" />)).toMatch(
    /data-mode="light"/,
  );
});

test('uncontrolled: the mode setters change the provider', async () => {
  const onModeChange = vi.fn();
  const screen = await render(
    <IdsProvider theme={testTheme} onModeChange={onModeChange} data-testid="root">
      <Probe name="a" />
    </IdsProvider>,
  );
  const root = screen.getByTestId('root');
  themeSeenBy.a.setMode('light');
  expect(onModeChange).not.toHaveBeenCalled();
  themeSeenBy.a.toggleMode();
  await expect.element(root).toHaveAttribute('data-mode', 'dark');
  await expect.poll(() => themeSeenBy.a.mode).toBe('dark');
  expect(onModeChange.mock.calls).toEqual([['dark']]);
});

test('the primary role follows the mode the element shows', async () => {
  const screen = await render(
    <IdsProvider theme={testTheme} data-testid="light">
      <IdsProvider.Scope mode="dark" data-testid="dark" />
    </IdsProvider>,
  );
  const role = (testId: string, name: string) =>
    getComputedStyle(screen.getByTestId(testId).element()).getPropertyValue(`--ids-color-${name}`);

  await expect.poll(() => role('light', 'bg-primary-soft')).toBe(palettes.blue[100]);
  expect(role('dark', 'bg-primary-soft')).toBe(paletteFromRamp(palettes.blue).dark[3]);
  expect(role('dark', 'bg-secondary-soft'), 'secondary is derived from primary').not.toBe(
    paletteFromRamp(palettes.blue).dark[3],
  );
});

test('a Scope with one color key keeps the colors it inherits', async () => {
  const screen = await render(
    <IdsProvider theme={testTheme}>
      <IdsProvider.Scope theme={{ secondary: palettes.violet }} data-testid="secondary">
        <IdsProvider.Scope theme={{ neutral: 'tinted' }} data-testid="tinted" />
      </IdsProvider.Scope>
    </IdsProvider>,
  );
  const value = (testId: string, name: string) =>
    getComputedStyle(screen.getByTestId(testId).element()).getPropertyValue(`--ids-color-${name}`);

  await expect.poll(() => value('secondary', 'bg-secondary-solid')).toBe(palettes.violet[600]);
  expect(value('secondary', 'bg-primary-solid')).toBe(palettes.blue[600]);
  expect(value('secondary', 'bg-base')).toBe('#ffffff');
  expect(value('tinted', 'bg-secondary-solid')).toBe(palettes.violet[600]);
  expect(value('tinted', 'border-neutral')).not.toBe('#e5e5e5');
});

test('controlled: setters only report, the parent value decides', async () => {
  const onModeChange = vi.fn();
  function App() {
    const [mode, setMode] = useState<IdsProvider.Mode>('light');
    return (
      <>
        <IdsProvider theme={testTheme} mode={mode} onModeChange={onModeChange} data-testid="root">
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

test('a Scope inherits what it does not set, and the mode setter reaches the owner', async () => {
  const screen = await render(
    <IdsProvider theme={testTheme} defaultMode="light" data-testid="outer">
      <IdsProvider.Scope mode="dark" data-testid="dark">
        <Probe name="dark" />
      </IdsProvider.Scope>
      <IdsProvider.Scope theme={{ primary: palettes.orange }} data-testid="orange">
        <Probe name="orange" />
      </IdsProvider.Scope>
    </IdsProvider>,
  );
  const outer = screen.getByTestId('outer');
  const dark = screen.getByTestId('dark');
  const orange = screen.getByTestId('orange');
  const primary = (element: Element) =>
    getComputedStyle(element).getPropertyValue('--ids-color-bg-primary-solid');

  await expect.poll(() => primary(dark.element())).toBe(palettes.blue[600]);
  await expect.element(dark).toHaveAttribute('data-mode', 'dark');
  expect(dark.element().getAttribute('style')).not.toMatch(/--ids-theme/);
  expect(primary(orange.element()), 'orange 600 is too light for Lc 75').toBe(palettes.orange[700]);
  await expect.element(orange).toHaveAttribute('data-mode', 'light');
  expect(themeSeenBy.orange.theme.primary).toBe(palettes.orange);
  expect(themeSeenBy.dark.theme.primary).toBe(palettes.blue);

  await expect.element(dark, { message: 'a mode switch paints' }).toHaveClass('bg-base');
  await expect.element(orange, { message: 'a palette switch does not' }).not.toHaveClass(/bg-/);
  await expect.element(outer, { message: 'the root never paints' }).not.toHaveClass(/bg-/);

  themeSeenBy.orange.setMode('dark');
  await expect.element(outer).toHaveAttribute('data-mode', 'dark');
  await expect.element(orange).toHaveAttribute('data-mode', 'dark');
  await expect.element(dark, { message: 'same mode as the parent now' }).not.toHaveClass(/bg-/);
});

test('radius and corner shape reach the components under the provider', async () => {
  const screen = await render(
    <IdsProvider theme={testTheme}>
      <IdsProvider.Scope theme={{ radius: 14, cornerShape: 'squircle' }}>
        <Button>themed</Button>
        <span data-testid="circle" className="size-4 rounded-full" />
        <span
          data-testid="overlaid"
          className="rounded-standard relative size-8 before:absolute before:inset-0 before:rounded-[inherit] after:absolute after:inset-x-0 after:h-1 after:rounded-full"
        />
        <IdsProvider.Scope theme={{ cornerShape: 'round' }}>
          <Button>round again</Button>
        </IdsProvider.Scope>
      </IdsProvider.Scope>
      <Button>default</Button>
    </IdsProvider>,
  );
  const radiusOf = (name: string) =>
    getComputedStyle(screen.getByRole('button', { name }).element()).borderTopLeftRadius;
  const themed = getComputedStyle(screen.getByRole('button', { name: 'themed' }).element());
  const plain = getComputedStyle(screen.getByRole('button', { name: 'default' }).element());
  const squircleDrawn = CSS.supports('corner-shape', 'squircle');

  expect(radiusOf('themed'), 'a squircle grows to the depth of a round corner').toBe(
    squircleDrawn ? '26px' : '14px',
  );
  expect(radiusOf('round again')).toBe('14px');
  expect(radiusOf('default')).toBe('10px');

  if (squircleDrawn) {
    const circle = screen.getByTestId('circle').element();
    const round = plain.getPropertyValue('corner-shape');

    expect(themed.getPropertyValue('corner-shape')).not.toBe(round);
    expect(getComputedStyle(circle).getPropertyValue('corner-shape')).toBe(round);

    const overlaid = screen.getByTestId('overlaid').element();
    expect(
      getComputedStyle(overlaid, '::before').getPropertyValue('corner-shape'),
      'a pseudo-element painting over its element takes the same corner',
    ).toBe(themed.getPropertyValue('corner-shape'));
    expect(getComputedStyle(overlaid, '::after').getPropertyValue('corner-shape')).toBe(round);
  }
});

test('a scale multiplies sizes, spacing, text and radius, and a nested scale replaces it', async () => {
  const screen = await render(
    <IdsProvider theme={testTheme}>
      <Button>default</Button>
      <IdsProvider.Scope theme={{ scale: 1.5 }}>
        <Button>1.5</Button>
        <IdsProvider.Scope theme={{ radius: 12 }}>
          <Button>1.5, radius 12</Button>
        </IdsProvider.Scope>
        <IdsProvider.Scope theme={{ scale: 1.25 }}>
          <Button>1.25</Button>
        </IdsProvider.Scope>
        <IdsProvider.Scope theme={{ scale: 1.1 }}>
          <Button>1.1</Button>
        </IdsProvider.Scope>
      </IdsProvider.Scope>
    </IdsProvider>,
  );
  const measure = (name: string) => {
    const element = screen.getByRole('button', { name, exact: true }).element();
    const style = getComputedStyle(element);
    return {
      height: element.getBoundingClientRect().height,
      fontSize: style.fontSize,
      radius: style.borderTopLeftRadius,
    };
  };

  expect(measure('default')).toEqual({ height: 36, fontSize: '14px', radius: '10px' });
  expect(measure('1.5')).toEqual({ height: 54, fontSize: '21px', radius: '15px' });
  expect(measure('1.5, radius 12')).toEqual({ height: 54, fontSize: '21px', radius: '18px' });
  expect(measure('1.25')).toEqual({ height: 45, fontSize: '18px', radius: '13px' });
  expect(measure('1.1')).toEqual({ height: 40, fontSize: '15px', radius: '11px' });
});

test('a theme without a primary is reported in development', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  onTestFinished(() => {
    error.mockRestore();
    warn.mockRestore();
  });

  await render(<IdsProvider theme={{} as never} />);
  await expect
    .poll(() => error.mock.calls.flat().join())
    .toMatch(/needs a theme with a primary color/);

  await render(
    <IdsProvider theme={testTheme}>
      <IdsProvider.Scope theme={{ radius: 99 }} />
    </IdsProvider>,
  );
  await expect.poll(() => warn.mock.calls.flat().join()).toMatch(/theme\.radius/);
});

test('system mode follows prefers-color-scheme live and toggles to an explicit mode', async (context) => {
  skipWithoutCdp(context);
  await preferColorScheme('light');
  const listening = countSchemeListeners();
  const screen = await render(
    <IdsProvider theme={testTheme} defaultMode="system" data-testid="root">
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

test('a nested provider inherits a system mode already resolved by its parent', async (context) => {
  skipWithoutCdp(context);
  await preferColorScheme('dark');
  const screen = await render(
    <IdsProvider theme={testTheme} defaultMode="system">
      <IdsProvider.Scope theme={{ primary: palettes.orange }} data-testid="inner">
        <Probe name="inner" />
      </IdsProvider.Scope>
    </IdsProvider>,
  );
  await expect.element(screen.getByTestId('inner')).toHaveAttribute('data-mode', 'dark');
  expect(themeSeenBy.inner.mode).toBe('system');
});

test('asChild puts the attributes on the child element', async () => {
  const screen = await render(
    <IdsProvider theme={testTheme} asChild>
      <section id="area" className="x" />
    </IdsProvider>,
  );
  const section = screen.container.querySelector<HTMLElement>('#area')!;
  expect(section.style.getPropertyValue('--ids-theme-light-bg-primary-solid')).toBe(
    palettes.blue[600],
  );
  expect(section.dataset.mode).toBe('light');
  expect([...section.classList].sort()).toEqual(['scheme-primary', 'x']);
  expect(screen.container.firstElementChild).toBe(section);
});

test('useTheme outside a provider answers with defaults', async () => {
  await render(<Probe name="bare" />);
  expect(themeSeenBy.bare.theme).toEqual({});
  expect(themeSeenBy.bare.resolvedMode).toBe('light');
  expect(() => themeSeenBy.bare.setMode('dark')).not.toThrow();
});
