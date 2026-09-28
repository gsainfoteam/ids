import type { ReactNode } from 'react';

import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, onTestFinished, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { Field, Kbd } from '../src';

const devices = {
  mac: { platform: 'MacIntel', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
  iPhone: {
    platform: 'iPhone',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
  },
  windows: { platform: 'Win32', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
  linux: { platform: 'Linux x86_64', userAgent: 'Mozilla/5.0 (X11; Linux x86_64)' },
};

function presentDevice(device: keyof typeof devices) {
  const platform = vi.spyOn(navigator, 'platform', 'get');
  const userAgent = vi.spyOn(navigator, 'userAgent', 'get');
  const present = (next: keyof typeof devices) => {
    platform.mockReturnValue(devices[next].platform);
    userAgent.mockReturnValue(devices[next].userAgent);
  };
  onTestFinished(() => {
    platform.mockRestore();
    userAgent.mockRestore();
  });
  present(device);
  return present;
}

const doc = (node: ReactNode) => new DOMParser().parseFromString(renderToString(node), 'text/html');
const visible = (element: Element) => {
  const copy = element.cloneNode(true) as Element;
  copy.querySelectorAll('.sr-only').forEach((node) => node.remove());
  copy
    .querySelectorAll('[data-kbd-glyph]')
    .forEach((icon) => icon.replaceWith(icon.getAttribute('data-kbd-glyph')!));
  return copy.textContent;
};
const hiddenFromReaders = (node: Node) =>
  node instanceof Element && node.getAttribute('aria-hidden') === 'true';
const spoken = (element: Element) => {
  const parts: string[] = [];
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent!.trim();
      if (text) parts.push(text);
    } else if (!hiddenFromReaders(node)) {
      node.childNodes.forEach(walk);
    }
  };
  walk(element);
  return parts.join(' ');
};

const group = (node: ReactNode) => doc(node).querySelector<HTMLElement>('[data-kbd-group]')!;

test('Mod is ⌘ on a Mac and Ctrl elsewhere, with platform order and joiners', () => {
  const mac = group(<Kbd keys="Mod+Shift+K" platform="mac" />);
  expect(visible(mac)).toBe('⇧⌘K');
  expect(spoken(mac)).toBe('시프트 커맨드 K');
  expect(mac.querySelectorAll('kbd[data-kbd]')).toHaveLength(3);
  expect(mac.querySelector('[data-kbd-separator]')).toBeNull();
  expect(mac.dataset.platform).toBe('mac');

  for (const platform of ['windows', 'linux'] as const) {
    const elsewhere = group(<Kbd keys="Mod+Shift+K" platform={platform} />);
    expect(visible(elsewhere), platform).toBe('Ctrl+Shift+K');
    expect(spoken(elsewhere), platform).toBe('컨트롤 + 시프트 + K');
    expect(elsewhere.dataset.platform).toBe(platform);
  }
});

test('Meta is ⌘ on a Mac, Win on Windows and Super on Linux, each in its menu order', () => {
  const all = (platform: Kbd.Platform) =>
    group(<Kbd keys="Control+Alt+Shift+Meta+K" platform={platform} />);

  expect(visible(all('mac'))).toBe('⌃⌥⇧⌘K');
  expect(spoken(all('mac'))).toBe('컨트롤 옵션 시프트 커맨드 K');
  expect(visible(all('windows'))).toBe('Win+Ctrl+Alt+Shift+K');
  expect(spoken(all('windows'))).toBe('윈도우 + 컨트롤 + 알트 + 시프트 + K');
  expect(visible(all('linux'))).toBe('Super+Ctrl+Alt+Shift+K');
  expect(spoken(all('linux'))).toBe('슈퍼 + 컨트롤 + 알트 + 시프트 + K');
});

test('the server renders the Windows form, the client switches to ⌘ on a Mac', async () => {
  const markup = renderToString(<Kbd keys="Mod+K" />);
  expect(markup).toMatch(/Ctrl/);
  expect(markup).toMatch(/data-platform="windows"/);
  presentDevice('mac');
  const host = document.createElement('div');
  host.innerHTML = markup;
  document.body.append(host);
  const errors: unknown[] = [];
  const root = hydrateRoot(host, <Kbd keys="Mod+K" />, {
    onRecoverableError: (error) => errors.push(error),
  });
  onTestFinished(() => {
    root.unmount();
    host.remove();
  });
  await expect.poll(() => visible(host.querySelector('[data-kbd-group]')!)).toBe('⌘K');
  expect(errors).toEqual([]);
});

test('client rendering detects the platform', async () => {
  const present = presentDevice('windows');
  const screen = await render(<Kbd keys="Meta" />);
  const cap = () => visible(screen.container.querySelector('[data-kbd]')!);
  expect(cap()).toBe('Win');

  present('iPhone');
  await screen.rerender(<Kbd key="iPhone" keys="Meta" />);
  expect(cap()).toBe('⌘');

  present('linux');
  await screen.rerender(<Kbd key="linux" keys="Meta" />);
  expect(cap()).toBe('Super');
});

test('keys are drawn by their TanStack names, and unknown keys as written', () => {
  const text = (keys: Kbd.Keys, platform: Kbd.Platform = 'windows') =>
    visible(doc(<Kbd keys={keys} platform={platform} />).body.firstElementChild!);
  expect(text('Control+Alt+ArrowUp')).toBe('Ctrl+Alt+↑');
  expect(text('Mod+1', 'mac')).toBe('⌘1');
  expect(text('Mod+[KeyK]')).toBe('Ctrl+K');
  expect(text('Mod+[Comma]', 'mac')).toBe('⌘,');
  expect(text('Mod++')).toBe('Ctrl++');
  expect(text('Escape')).toBe('Esc');
  expect(text('F5')).toBe('F5');
  expect(text('/')).toBe('/');
  expect(text('Backspace', 'mac')).toBe('⌫');
  expect(text('Backspace')).toBe('Backspace');
  expect(text('Delete', 'linux')).toBe('Del');
  expect(text('Shift', 'mac')).toBe('⇧');
  expect(text('Mod')).toBe('Ctrl');
});

test('glyphs written as children are hidden and named', () => {
  const kbd = doc(<Kbd platform="mac">⇧⌘P</Kbd>).querySelector('kbd')!;
  expect(visible(kbd)).toBe('⇧⌘P');
  expect(spoken(kbd)).toBe('시프트 커맨드 P');
  const plain = doc(<Kbd>Ctrl+C</Kbd>).querySelector('kbd')!;
  expect(plain.firstElementChild!.innerHTML, 'text without glyphs stays as it is').toBe('Ctrl+C');
});

test('labels override the spoken names, separator overrides the joiner', () => {
  const kbd = doc(
    <Kbd keys="Mod+K" platform="windows" separator={null} labels={{ control: 'Control' }} />,
  ).querySelector('[data-kbd-group]')!;
  expect(spoken(kbd)).toBe('Control K');
  expect(kbd.querySelector('[data-kbd-separator]')).toBeNull();
});

test('size comes from the prop, then the group, then a Field', () => {
  const group = doc(
    <Kbd.Group size="tiny" platform="mac">
      <Kbd keys="Mod" />
      <Kbd>G</Kbd>
    </Kbd.Group>,
  );
  const caps = [...group.querySelectorAll<HTMLElement>('kbd[data-kbd]')];
  expect(caps.map((cap) => cap.dataset.size)).toEqual(['tiny', 'tiny']);
  expect(visible(caps[0]), 'the group platform reaches its keys').toBe('⌘');
  const field = doc(
    <Field size="tiny">
      <Field.Label>Search</Field.Label>
      <input />
      <Field.Hint>
        <Kbd>K</Kbd>
      </Field.Hint>
    </Field>,
  );
  expect(field.querySelector('kbd')!.dataset.size).toBe('tiny');
  expect(doc(<Kbd>K</Kbd>).querySelector('kbd')!.dataset.size).toBe('standard');
});

test('className may read the state', () => {
  const kbd = doc(
    <Kbd
      keys="Mod+K"
      platform="mac"
      className={(state) => `${state.platform}-${state.combination}`}
    />,
  ).querySelector('[data-kbd-group]')!;
  expect(kbd.className).toMatch(/mac-true/);
});

test('Apple key symbols are drawn as icons, so no fallback font decides where they sit', () => {
  const mac = doc(<Kbd keys="Mod+Shift+Enter" platform="mac" />);
  const icons = [...mac.querySelectorAll('svg[data-kbd-glyph]')];
  expect(icons.map((icon) => icon.getAttribute('data-kbd-glyph'))).toEqual(['⇧', '⌘', '↩']);
  expect(icons.every((icon) => icon.getAttribute('aria-hidden') === 'true')).toBe(true);

  const windows = doc(<Kbd keys="Mod+K" platform="windows" />);
  expect(windows.querySelector('svg'), 'other platforms spell the keys out').toBeNull();
});

test('an icon sits in the middle of its keycap at both sizes', async () => {
  const screen = await render(
    <div>
      <Kbd keys="Mod+Shift+Enter" platform="mac" />
      <Kbd keys="Alt+Backspace" platform="mac" size="tiny" />
    </div>,
  );
  const icons = [...screen.container.querySelectorAll('svg[data-kbd-glyph]')];
  expect(icons.length).toBe(5);
  for (const icon of icons) {
    const cap = icon.closest('[data-kbd]')!.getBoundingClientRect();
    const box = icon.getBoundingClientRect();
    const middle = (rect: DOMRect) => [rect.left + rect.width / 2, rect.top + rect.height / 2];
    const [capX, capY] = middle(cap);
    const [iconX, iconY] = middle(box);
    expect(Math.abs(iconX - capX), icon.getAttribute('data-kbd-glyph')!).toBeLessThan(0.51);
    expect(Math.abs(iconY - capY), icon.getAttribute('data-kbd-glyph')!).toBeLessThan(0.51);
  }
});

function hangulInkCenter(line: HTMLElement) {
  const text = [...line.childNodes].find(
    (node) => node.nodeType === 3 && node.textContent!.trim(),
  )!;
  const range = document.createRange();
  range.selectNodeContents(text);
  const box = range.getClientRects()[0]!;
  const style = getComputedStyle(line);
  const context = document.createElement('canvas').getContext('2d')!;
  context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const ink = context.measureText('저장');
  const baseline = box.top + ink.fontBoundingBoxAscent;
  return baseline - (ink.actualBoundingBoxAscent - ink.actualBoundingBoxDescent) / 2;
}

test('a key sits level with the Hangul around it, in running text and in a flex row', async () => {
  const lines: Array<[string, string, ReactNode]> = [
    ['caption', 'text-caption-c1-medium', <Kbd keys="Mod+S" platform="mac" size="tiny" />],
    ['body', 'text-body-b3-regular', <Kbd keys="Mod+S" platform="windows" />],
    ['lone key', 'text-body-b3-regular', <Kbd keys="K" />],
    ['lone icon', 'text-body-b3-regular', <Kbd platform="mac">⌘</Kbd>],
  ];
  const screen = await render(
    <div>
      {lines.map(([label, className, kbd]) => (
        <div key={label}>
          <p data-line={label} className={className}>
            저장 {kbd}
          </p>
          <p
            data-line={`${label} in a flex row`}
            className={`flex items-center gap-1 ${className}`}
          >
            저장 {kbd}
          </p>
        </div>
      ))}
    </div>,
  );
  await document.fonts.ready;
  for (const line of screen.container.querySelectorAll<HTMLElement>('[data-line]')) {
    const cap = line.querySelector('[data-kbd]')!.getBoundingClientRect();
    const offset = cap.top + cap.height / 2 - hangulInkCenter(line);
    expect(Math.abs(offset), line.dataset.line).toBeLessThan(0.5);
  }
});

test('a key icon keeps its size inside a row that sizes every icon', async () => {
  const screen = await render(
    <div className="[&_svg]:size-(--ids-size-icon-standard)">
      <Kbd keys="Mod" platform="mac" size="tiny" />
    </div>,
  );
  const icon = screen.container.querySelector('svg[data-kbd-glyph]')!;
  expect(icon.getBoundingClientRect().width).toBe(10);
});
