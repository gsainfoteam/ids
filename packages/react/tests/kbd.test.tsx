import type { ReactNode } from 'react';

import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, onTestFinished, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { Field, Kbd } from '../src';

function presentPlatform(platform: string) {
  const agent = navigator as Navigator & { userAgentData?: unknown };
  const withoutHints = vi.spyOn(agent, 'userAgentData', 'get').mockReturnValue(undefined);
  const reported = vi.spyOn(agent, 'platform', 'get').mockReturnValue(platform);
  onTestFinished(() => {
    withoutHints.mockRestore();
    reported.mockRestore();
  });
  return reported;
}

const doc = (node: ReactNode) => new DOMParser().parseFromString(renderToString(node), 'text/html');
const visible = (element: Element) => {
  const copy = element.cloneNode(true) as Element;
  copy.querySelectorAll('.sr-only').forEach((node) => node.remove());
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

test('mod is ⌘ on Apple and Ctrl elsewhere, with platform order and joiners', () => {
  const apple = doc(<Kbd keys="k+shift+mod" platform="apple" />).querySelector<HTMLElement>(
    '[data-kbd-group]',
  )!;
  expect(visible(apple)).toBe('⇧⌘K');
  expect(spoken(apple)).toBe('시프트 커맨드 K');
  expect(apple.querySelectorAll('kbd[data-kbd]')).toHaveLength(3);
  expect(apple.querySelector('[data-kbd-separator]')).toBeNull();

  const other = doc(<Kbd keys="k+shift+mod" platform="other" />).querySelector<HTMLElement>(
    '[data-kbd-group]',
  )!;
  expect(visible(other)).toBe('Ctrl+Shift+K');
  expect(spoken(other)).toBe('컨트롤 + 시프트 + K');
  expect(other.dataset.platform).toBe('other');
});

test('the server renders the portable form, the client switches to ⌘ on Apple', async () => {
  const markup = renderToString(<Kbd keys="mod+k" />);
  expect(markup).toMatch(/Ctrl/);
  presentPlatform('MacIntel');
  const host = document.createElement('div');
  host.innerHTML = markup;
  document.body.append(host);
  const errors: unknown[] = [];
  const root = hydrateRoot(host, <Kbd keys="mod+k" />, {
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
  const platform = presentPlatform('Win32');
  const screen = await render(<Kbd keys="mod" />);
  expect(visible(screen.container.querySelector('[data-kbd]')!)).toBe('Ctrl');
  platform.mockReturnValue('iPhone');
  await screen.rerender(<Kbd key="b" keys="mod" />);
  expect(visible(screen.container.querySelector('[data-kbd]')!)).toBe('⌘');
});

test('key names, aliases and tinykeys codes all normalise', () => {
  const text = (keys: string | string[], platform: Kbd.Platform = 'other') =>
    visible(doc(<Kbd keys={keys} platform={platform} />).body.firstElementChild!);
  expect(text('$mod+KeyK')).toBe('Ctrl+K');
  expect(text(['Control', 'Option', 'ArrowUp'])).toBe('Ctrl+Alt+↑');
  expect(text('cmd+Digit1', 'apple')).toBe('⌘1');
  expect(text('mod++')).toBe('Ctrl++');
  expect(text('esc')).toBe('Esc');
  expect(text('F5')).toBe('F5');
  expect(text('backspace', 'apple')).toBe('⌫');
  expect(text('backspace')).toBe('Backspace');
});

test('glyphs written as children are hidden and named', () => {
  const kbd = doc(<Kbd platform="apple">⇧⌘P</Kbd>).querySelector('kbd')!;
  expect(visible(kbd)).toBe('⇧⌘P');
  expect(spoken(kbd)).toBe('시프트 커맨드 P');
  const plain = doc(<Kbd>Ctrl+C</Kbd>).querySelector('kbd')!;
  expect(plain.innerHTML, 'text without glyphs stays as it is').toBe('Ctrl+C');
});

test('labels override the spoken names, separator overrides the joiner', () => {
  const kbd = doc(
    <Kbd keys="mod+k" platform="other" separator={null} labels={{ control: 'Control' }} />,
  ).querySelector('[data-kbd-group]')!;
  expect(spoken(kbd)).toBe('Control K');
  expect(kbd.querySelector('[data-kbd-separator]')).toBeNull();
});

test('size comes from the prop, then the group, then a Field', () => {
  const group = doc(
    <Kbd.Group size="tiny" platform="apple">
      <Kbd keys="mod" />
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
      keys="mod+k"
      platform="apple"
      className={(state) => `${state.platform}-${state.combination}`}
    />,
  ).querySelector('[data-kbd-group]')!;
  expect(kbd.className).toMatch(/apple-true/);
});
