import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});
for (const name of ['window', 'document', 'HTMLElement', 'Event', 'getComputedStyle'])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, useState } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { ThemeProvider, useTheme } = await import('../dist/index.js');

let root, host;
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  root = undefined;
  host?.remove();
  delete window.matchMedia;
});
async function render(node) {
  if (!root) {
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  }
  await act(async () => root.render(node));
}

const seen = {};
function Probe({ name }) {
  seen[name] = useTheme();
  return h('span', { 'data-probe': name });
}
const region = (testId) => host.querySelector(`[data-testid="${testId}"]`);

function fakeScheme(dark) {
  const listeners = new Set();
  const query = {
    get matches() {
      return dark;
    },
    addEventListener: (_type, listener) => listeners.add(listener),
    removeEventListener: (_type, listener) => listeners.delete(listener),
  };
  window.matchMedia = () => query;
  return {
    listeners,
    set(next) {
      dark = next;
      for (const listener of listeners) listener();
    },
  };
}

test('SSR: the root renders blue and light with a matching color-scheme', () => {
  const doc = new JSDOM(renderToString(h(ThemeProvider, null, h('p', null, 'x')))).window.document;
  const element = doc.querySelector('[data-color]');
  assert.equal(element.dataset.color, 'blue');
  assert.equal(element.dataset.mode, 'light');
  assert.equal(element.style.colorScheme, 'light');
});

test('SSR: system mode renders light because the server cannot see the scheme', () => {
  const html = renderToString(h(ThemeProvider, { defaultMode: 'system' }));
  assert.match(html, /data-mode="light"/);
});

test('uncontrolled: setters change the provider, equal values do not notify', async () => {
  const colors = [];
  await render(
    h(
      ThemeProvider,
      { defaultColor: 'orange', onColorChange: (c) => colors.push(c), 'data-testid': 'root' },
      h(Probe, { name: 'a' }),
    ),
  );
  assert.equal(region('root').dataset.color, 'orange');
  await act(async () => seen.a.setColor('orange'));
  assert.deepEqual(colors, []);
  await act(async () => seen.a.setColor('green'));
  assert.equal(region('root').dataset.color, 'green');
  assert.deepEqual(colors, ['green']);
  await act(async () => seen.a.toggleMode());
  assert.equal(region('root').dataset.mode, 'dark');
  assert.equal(seen.a.mode, 'dark');
});

test('controlled: setters only report, the parent value decides', async () => {
  const modes = [];
  let setParent;
  function App() {
    const [mode, setMode] = useState('light');
    setParent = setMode;
    return h(
      ThemeProvider,
      { mode, onModeChange: (m) => modes.push(m), 'data-testid': 'root' },
      h(Probe, { name: 'a' }),
    );
  }
  await render(h(App));
  await act(async () => seen.a.setMode('dark'));
  assert.deepEqual(modes, ['dark']);
  assert.equal(region('root').dataset.mode, 'light', 'no change until the parent updates');
  await act(async () => setParent('dark'));
  assert.equal(region('root').dataset.mode, 'dark');
  assert.equal(region('root').style.colorScheme, 'dark');
});

test('nested providers inherit the axis they do not set, and its setter reaches the owner', async () => {
  await render(
    h(
      ThemeProvider,
      { defaultColor: 'blue', defaultMode: 'light', 'data-testid': 'outer' },
      h(ThemeProvider, { mode: 'dark', 'data-testid': 'dark' }, h(Probe, { name: 'dark' })),
      h(ThemeProvider, { color: 'orange', 'data-testid': 'orange' }, h(Probe, { name: 'orange' })),
    ),
  );
  assert.equal(region('dark').dataset.color, 'blue');
  assert.equal(region('dark').dataset.mode, 'dark');
  assert.equal(region('orange').dataset.color, 'orange');
  assert.equal(region('orange').dataset.mode, 'light');

  assert.match(region('dark').className, /bg-\(--ids-color-surface\)/, 'a mode switch paints');
  assert.doesNotMatch(region('orange').className, /bg-/, 'a color switch does not');
  assert.doesNotMatch(region('outer').className, /bg-/, 'the root never paints');

  await act(async () => seen.dark.setColor('green'));
  assert.equal(region('outer').dataset.color, 'green');
  assert.equal(region('dark').dataset.color, 'green');
  assert.equal(region('orange').dataset.color, 'orange', 'an owned axis keeps its own value');

  await act(async () => seen.orange.setMode('dark'));
  assert.equal(region('outer').dataset.mode, 'dark');
  assert.equal(region('orange').dataset.mode, 'dark');
  assert.doesNotMatch(region('dark').className, /bg-/, 'same mode as the parent now');
});

test('system mode follows prefers-color-scheme live and toggles to an explicit mode', async () => {
  const scheme = fakeScheme(false);
  await render(
    h(ThemeProvider, { defaultMode: 'system', 'data-testid': 'root' }, h(Probe, { name: 'a' })),
  );
  assert.equal(region('root').dataset.mode, 'light');
  assert.equal(scheme.listeners.size, 1);
  await act(async () => scheme.set(true));
  assert.equal(region('root').dataset.mode, 'dark');
  assert.equal(seen.a.mode, 'system');
  assert.equal(seen.a.resolvedMode, 'dark');
  await act(async () => seen.a.toggleMode());
  assert.equal(seen.a.mode, 'light');
  assert.equal(scheme.listeners.size, 0, 'an explicit mode stops listening');
});

test('a nested provider inherits a system mode already resolved by its parent', async () => {
  fakeScheme(true);
  await render(
    h(
      ThemeProvider,
      { defaultMode: 'system' },
      h(ThemeProvider, { color: 'orange', 'data-testid': 'inner' }, h(Probe, { name: 'inner' })),
    ),
  );
  assert.equal(region('inner').dataset.mode, 'dark');
  assert.equal(seen.inner.mode, 'system');
});

test('asChild puts the attributes on the child element', async () => {
  await render(
    h(
      ThemeProvider,
      { asChild: true, color: 'green' },
      h('section', { id: 'area', className: 'x' }),
    ),
  );
  const section = host.querySelector('#area');
  assert.equal(section.dataset.color, 'green');
  assert.equal(section.dataset.mode, 'light');
  assert.equal(section.className, 'x');
  assert.equal(host.firstElementChild, section);
});

test('useTheme outside a provider answers with defaults', async () => {
  await render(h(Probe, { name: 'bare' }));
  assert.equal(seen.bare.color, 'blue');
  assert.equal(seen.bare.resolvedMode, 'light');
  assert.doesNotThrow(() => seen.bare.setMode('dark'));
});
