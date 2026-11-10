import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { beforeEach, expect, onTestFinished, test, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { CodeBlock, IdsProvider } from '../src';
import { skipWithoutCdp } from './engines';
import { isLazy, LAZY_NAMES } from '../src/components/data/code-block/highlight';
import { LAZY_LANGUAGES } from '../src/components/data/code-block/lazy-languages';

const SAVE = `export function Save() {
  return <Button>저장</Button>;
}`;

const LONG_LINE = `const query = new URLSearchParams({ page: '1', size: '20', sort: 'createdAt,desc', filter: 'status:open' });`;

const RUST = `fn main() {
    println!("hello");
}`;

async function acceptClipboardWritePrompt() {
  const session = cdp();
  const { targetInfo } = await session.send('Target.getTargetInfo');
  const { browserContextId } = targetInfo;
  await session.send('Browser.grantPermissions', {
    permissions: ['clipboardSanitizedWrite'],
    browserContextId,
  });
  return async () => {
    await session.send('Browser.resetPermissions', { browserContextId });
  };
}

async function pastedText() {
  const scratch = document.createElement('textarea');
  document.body.append(scratch);
  scratch.focus();
  await userEvent.paste();
  const text = scratch.value;
  scratch.remove();
  return text;
}

const tokensIn = (root: ParentNode, token: string) =>
  Array.from(root.querySelectorAll(`[data-token="${token}"]`), (element) => element.textContent);

beforeEach(async () => {
  await page.viewport(1024, 768);
});

test('SSR: figure named by its caption, built-in languages highlighted, lines joined by newlines', () => {
  const doc = new DOMParser().parseFromString(
    renderToString(
      <CodeBlock language="tsx" title="save.tsx" lineNumbers highlight={[2]}>
        {`\n${SAVE}\n`}
      </CodeBlock>,
    ),
    'text/html',
  );

  const figure = doc.querySelector('figure')!;
  expect(figure.firstElementChild!.tagName).toBe('FIGCAPTION');
  expect(figure.querySelector('figcaption')!.textContent).toBe('save.tsxtsx');
  expect(figure.querySelector('figcaption button')).toBeNull();
  expect(doc.querySelector('code')!.textContent).toBe(SAVE);
  expect(tokensIn(doc, 'keyword')).toEqual(
    expect.arrayContaining(['export', 'function', 'return']),
  );
  expect(
    Array.from(doc.querySelectorAll('[data-highlighted]'), (line) =>
      line.getAttribute('data-line'),
    ),
  ).toEqual(['2']);
});

test('the copy button writes the code, without line numbers, to the clipboard', async (context) => {
  skipWithoutCdp(context);
  const revokeClipboardWrite = await acceptClipboardWritePrompt();
  onTestFinished(revokeClipboardWrite);
  const screen = await render(
    <CodeBlock language="tsx" lineNumbers>
      {SAVE}
    </CodeBlock>,
  );

  await userEvent.click(screen.getByRole('button', { name: '코드 복사' }));
  await expect.element(screen.getByRole('status')).toHaveTextContent('복사했습니다');
  await expect
    .element(screen.getByRole('button', { name: '복사했습니다' }))
    .toHaveAttribute('data-copied');
  expect(await pastedText()).toBe(SAVE);
});

test('selecting the code and copying it leaves the line numbers out', async () => {
  const screen = await render(
    <CodeBlock language="tsx" lineNumbers>
      {SAVE}
    </CodeBlock>,
  );
  const code = screen.container.querySelector('code')!;

  const selection = getSelection()!;
  selection.selectAllChildren(code);
  await userEvent.copy();
  selection.removeAllRanges();

  expect(await pastedText()).toBe(SAVE);
});

test('without a caption, the first line wraps before the copy button', async () => {
  const screen = await render(
    <div className="w-72">
      <CodeBlock wrap>{'x'.repeat(200)}</CodeBlock>
    </div>,
  );
  const firstRow = screen.container.querySelector('[data-line="1"] > span')!.getClientRects()[0]!;
  const button = screen.getByRole('button', { name: '코드 복사' }).element();

  expect(firstRow.right).toBeLessThanOrEqual(button.getBoundingClientRect().left);
});

test('a long line scrolls sideways from the keyboard once Tab reaches the code', async () => {
  const screen = await render(
    <>
      <button type="button">앞</button>
      <div className="w-72">
        <CodeBlock language="ts">{LONG_LINE}</CodeBlock>
      </div>
    </>,
  );
  const pre = screen.container.querySelector('pre')!;
  await expect.element(pre).toHaveAttribute('tabindex', '0');

  await userEvent.click(screen.getByRole('button', { name: '앞' }));
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: '코드 복사' })).toHaveFocus();
  await userEvent.keyboard('{Tab}');
  expect(document.activeElement).toBe(pre);

  for (let step = 0; step < 5; step++) await userEvent.keyboard('{ArrowRight}');
  await expect.poll(() => pre.scrollLeft).toBeGreaterThan(0);
});

test('wrap keeps the code inside the block', async () => {
  const screen = await render(
    <div className="w-72">
      <CodeBlock language="ts" wrap>
        {LONG_LINE}
      </CodeBlock>
    </div>,
  );
  const pre = screen.container.querySelector('pre')!;

  expect(pre.scrollWidth).toBe(pre.clientWidth);
  expect(pre.hasAttribute('tabindex')).toBe(false);
});

test('a lazily loaded language hydrates as plain text, then highlights', async () => {
  const errors = vi.spyOn(console, 'error');
  const tree = (
    <IdsProvider>
      <CodeBlock language="rust">{RUST}</CodeBlock>
    </IdsProvider>
  );
  const html = renderToString(tree);
  expect(html).not.toMatch(/data-token="/);

  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.append(container);
  const root = hydrateRoot(container, tree, { onRecoverableError: (error) => errors(error) });

  await expect.poll(() => tokensIn(container, 'keyword')).toContain('fn');
  expect(container.querySelector('code')!.textContent).toBe(RUST);
  expect(errors).not.toHaveBeenCalled();

  root.unmount();
  container.remove();
  errors.mockRestore();
});

test('only the names in the lazy bundle ask for it', () => {
  const bundled = LAZY_LANGUAGES.flatMap((syntax) => [
    syntax.displayName,
    ...(syntax.aliases ?? []),
  ]);

  expect([...LAZY_NAMES].sort()).toEqual(bundled.sort());
  expect(isLazy('Rust')).toBe(true);
  expect(isLazy('brainfuck')).toBe(false);
  expect(isLazy('tsx')).toBe(false);
});

test('an unknown language stays plain and keeps its name in the caption', async () => {
  const screen = await render(<CodeBlock language="brainfuck">{'++[>+<-]'}</CodeBlock>);

  await expect.element(screen.getByText('brainfuck')).toBeVisible();
  expect(screen.container.querySelector('[data-token]')).toBeNull();
});
