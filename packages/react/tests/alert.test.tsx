import { useState, type ReactElement, type ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Alert } from '../src';

const html = (node: ReactNode) =>
  new DOMParser().parseFromString(renderToString(node), 'text/html');
const nextFrame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve));
const fadeUntilFinished = { transition: 'opacity 60s' };
const finishFade = (element: Element) => {
  for (const animation of element.getAnimations()) animation.finish();
};

test('role follows the meaning: warning and danger interrupt, the rest wait', () => {
  const cases: Array<[Alert.ColorScheme, string, string]> = [
    ['neutral', 'status', 'polite'],
    ['info', 'status', 'polite'],
    ['success', 'status', 'polite'],
    ['warning', 'alert', 'assertive'],
    ['danger', 'alert', 'assertive'],
  ];
  for (const [colorScheme, role, live] of cases) {
    const element = html(
      <Alert colorScheme={colorScheme}>
        <Alert.Title>x</Alert.Title>
      </Alert>,
    ).querySelector<HTMLElement>('[data-alert]')!;
    expect(element.getAttribute('role'), colorScheme).toBe(role);
    expect(element.getAttribute('aria-live'), colorScheme).toBe(live);
    expect(element.dataset.colorScheme).toBe(colorScheme);
  }
  const note = html(<Alert colorScheme="danger" role="note" />).querySelector('[data-alert]')!;
  expect(note.getAttribute('role')).toBe('note');
  expect(note.hasAttribute('aria-live')).toBe(false);
});

test('a default icon per meaning, none for neutral unless asked, hidden removes it', () => {
  const icon = (props: Alert.Props, extra?: ReactNode) =>
    html(
      <Alert {...props}>
        <Alert.Title>x</Alert.Title>
        {extra}
      </Alert>,
    ).querySelector('[data-alert-icon]');
  expect(icon({ colorScheme: 'danger' })?.querySelector('svg')).not.toBeNull();
  expect(icon({ colorScheme: 'danger' })!.getAttribute('aria-hidden')).toBe('true');
  expect(icon({ colorScheme: 'neutral' })).toBeNull();
  expect(icon({ colorScheme: 'neutral' }, <Alert.Icon />)?.querySelector('svg')).not.toBeNull();
  expect(icon({ colorScheme: 'info' }, <Alert.Icon hidden />)).toBeNull();
  const custom = icon(
    {},
    <Alert.Icon>
      <i id="glyph" />
    </Alert.Icon>,
  );
  expect(custom!.querySelector('#glyph')).not.toBeNull();
});

test('the icon, content and close button land in their own columns', () => {
  const doc = html(
    <Alert variant="outline">
      <Alert.Close />
      <Alert.Title>Title</Alert.Title>
      <Alert.Description>Body</Alert.Description>
    </Alert>,
  );
  const [first, content, last] = Array.from(doc.querySelector('[data-alert]')!.children);
  expect(first!.hasAttribute('data-alert-icon')).toBe(true);
  expect(content!.textContent).toBe('TitleBody');
  expect(last!.hasAttribute('data-alert-close')).toBe(true);
  expect(last!.getAttribute('aria-label')).toBe('닫기');
  expect(last!.getAttribute('type')).toBe('button');
  expect(doc.querySelector('[data-alert]')!.className).toMatch(
    /grid-cols-\[auto_minmax\(0,1fr\)_auto\]/,
  );
});

test('Close is a ghost IconButton in the alert scheme, and its child replaces the glyph', () => {
  const close = (props: Alert.Props, glyph?: ReactElement) =>
    html(
      <Alert {...props}>
        <Alert.Title>x</Alert.Title>
        <Alert.Close>{glyph}</Alert.Close>
      </Alert>,
    ).querySelector<HTMLElement>('[data-alert-close]')!;
  const danger = close({ colorScheme: 'danger' });
  expect(danger.dataset.variant).toBe('ghost');
  expect(danger.className).toMatch(/\[--control-quiet:var\(--ids-color-danger-strong\)\]/);
  expect(danger.className).toMatch(/rounded-full/);
  expect(
    close({ colorScheme: 'danger', variant: 'solid' }).className,
    'on the fill it takes the fill contrast color',
  ).toMatch(/\[--control-quiet:var\(--alert-on\)\]/);
  expect(close({}, <svg id="glyph" />).querySelector('#glyph')).not.toBeNull();
});

test('uncontrolled: Close hides it, focus moves on to the next element', async () => {
  const onOpenChange = vi.fn();
  const screen = await render(
    <div>
      <Alert onOpenChange={onOpenChange} style={fadeUntilFinished}>
        <Alert.Title>Saved</Alert.Title>
        <Alert.Close />
      </Alert>
      <button type="button">After</button>
    </div>,
  );
  const alert = screen.getByRole('status');
  await userEvent.click(screen.getByRole('button', { name: '닫기' }));
  expect(onOpenChange.mock.calls).toEqual([[false]]);
  await expect.element(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  await expect
    .element(alert, { message: 'stays mounted while it fades' })
    .toHaveAttribute('data-ending-style');
  finishFade(alert.element());
  await expect.element(alert).not.toBeInTheDocument();
});

test('focus falls back to the element before when nothing follows', async () => {
  const screen = await render(
    <div>
      <button type="button">Before</button>
      <Alert>
        <Alert.Title>x</Alert.Title>
        <Alert.Close />
      </Alert>
    </div>,
  );
  await userEvent.click(screen.getByRole('button', { name: '닫기' }));
  await expect.element(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
});

test('Escape inside closes, except while composing or when already handled', async () => {
  const screen = await render(
    <Alert>
      <Alert.Title>x</Alert.Title>
      <input aria-label="entry" data-1p-ignore data-lpignore="true" />
      <Alert.Close />
    </Alert>,
  );
  await userEvent.click(screen.getByRole('textbox', { name: 'entry' }));
  await cdp().send('Input.imeSetComposition', { text: 'ㅎ', selectionStart: 1, selectionEnd: 1 });
  await userEvent.keyboard('{Escape}');
  await expect.element(screen.getByRole('status')).toBeInTheDocument();
  await expect
    .element(screen.getByRole('status'), { message: 'composition keeps it open' })
    .not.toHaveAttribute('data-ending-style');
  await cdp().send('Input.insertText', { text: 'ㅎ' });

  await screen.rerender(
    <Alert key="b" onKeyDown={(event) => event.preventDefault()}>
      <Alert.Title>x</Alert.Title>
      <Alert.Close />
    </Alert>,
  );
  screen.getByRole('button', { name: '닫기' }).element().focus();
  await userEvent.keyboard('{Escape}');
  await expect
    .element(screen.getByRole('status'), { message: 'a handled Escape is left alone' })
    .not.toHaveAttribute('data-ending-style');

  const prevented: boolean[] = [];
  await screen.rerender(
    <div onKeyDown={(event) => prevented.push(event.defaultPrevented)}>
      <Alert key="c">
        <Alert.Title>x</Alert.Title>
        <Alert.Close />
      </Alert>
    </div>,
  );
  screen.getByRole('button', { name: '닫기' }).element().focus();
  await userEvent.keyboard('{Escape}');
  expect(prevented).toEqual([true]);
  await expect.element(screen.getByRole('status')).not.toBeInTheDocument();
});

test('without Alert.Close, Escape does nothing', async () => {
  const prevented: boolean[] = [];
  const screen = await render(
    <div onKeyDown={(event) => prevented.push(event.defaultPrevented)}>
      <Alert>
        <Alert.Title>x</Alert.Title>
        <button type="button">Action</button>
      </Alert>
    </div>,
  );
  screen.getByRole('button', { name: 'Action' }).element().focus();
  await userEvent.keyboard('{Escape}');
  expect(prevented).toEqual([false]);
  await nextFrame();
  await expect.element(screen.getByRole('status')).toBeInTheDocument();
  await expect.element(screen.getByRole('status')).not.toHaveAttribute('data-ending-style');
});

test('controlled: the parent decides, and reopening works', async () => {
  function App() {
    const [open, setOpen] = useState(true);
    return (
      <div>
        <Alert open={open} onOpenChange={setOpen}>
          <Alert.Title>x</Alert.Title>
          <Alert.Close />
        </Alert>
        <button type="button" onClick={() => setOpen(true)}>
          Reopen
        </button>
      </div>
    );
  }
  const screen = await render(<App />);
  await userEvent.click(screen.getByRole('button', { name: '닫기' }));
  await expect.element(screen.getByRole('status')).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Reopen' }));
  await expect.element(screen.getByRole('status')).toBeInTheDocument();
  await expect.element(screen.getByRole('status')).not.toHaveAttribute('data-ending-style');
});

test('a Close onClick that prevents default keeps the alert open', async () => {
  const onOpenChange = vi.fn();
  const screen = await render(
    <Alert onOpenChange={onOpenChange}>
      <Alert.Title>x</Alert.Title>
      <Alert.Close onClick={(event) => event.preventDefault()} />
    </Alert>,
  );
  await userEvent.click(screen.getByRole('button', { name: '닫기' }));
  expect(onOpenChange).not.toHaveBeenCalled();
  await expect.element(screen.getByRole('status')).toBeInTheDocument();
  await expect.element(screen.getByRole('status')).not.toHaveAttribute('data-ending-style');
});

test('className and style read the state; parts accept asChild', () => {
  const doc = html(
    <Alert
      colorScheme="success"
      variant="solid"
      className={(state) => `${state.variant}-${state.dismissible}`}
      style={(state) => ({ opacity: state.open ? 1 : 0 })}
    >
      <Alert.Title asChild>
        <h3>Done</h3>
      </Alert.Title>
      <Alert.Close />
    </Alert>,
  );
  const element = doc.querySelector<HTMLElement>('[data-alert]')!;
  expect(element.className).toMatch(/solid-true/);
  expect(element.style.opacity).toBe('1');
  expect(element.dataset.variant).toBe('solid');
  expect(element.hasAttribute('data-dismissible')).toBe(true);
  expect(doc.querySelector('h3[data-alert-title]')).not.toBeNull();
});

test('defaultOpen false renders nothing', () => {
  expect(
    renderToString(
      <Alert defaultOpen={false}>
        <Alert.Title>x</Alert.Title>
      </Alert>,
    ),
  ).toBe('');
});

test('focus is handed on when the parent closes or drops the alert from an action inside it', async () => {
  function App() {
    const [open, setOpen] = useState(true);
    const [shown, setShown] = useState(true);
    return (
      <div>
        {shown && (
          <Alert open={open} onOpenChange={setOpen}>
            <Alert.Title>x</Alert.Title>
            <Alert.Actions>
              <button type="button" onClick={() => setOpen(false)}>
                Dismiss
              </button>
              <button type="button" onClick={() => setShown(false)}>
                Drop
              </button>
            </Alert.Actions>
          </Alert>
        )}
        <button type="button" onClick={() => setOpen(true)}>
          After
        </button>
      </div>
    );
  }
  const screen = await render(<App />);
  const after = screen.getByRole('button', { name: 'After' });
  await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
  await expect.element(after, { message: 'a controlled close moves focus on' }).toHaveFocus();
  await expect.element(screen.getByRole('status')).not.toBeInTheDocument();

  await userEvent.click(after);
  await userEvent.click(screen.getByRole('button', { name: 'Drop' }));
  await expect.element(screen.getByRole('status')).not.toBeInTheDocument();
  await expect.element(after, { message: 'an unmount moves focus on' }).toHaveFocus();
});
