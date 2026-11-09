import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { Highlight, IdsProvider } from '../src';

const marksIn = (element: Element) =>
  Array.from(element.querySelectorAll('mark'), (mark) => mark.textContent);

test('renders the text in a span and each match in a mark', async () => {
  const screen = await render(
    <p>
      <Highlight query="셔틀" data-testid="root">
        셔틀 막차와 셔틀 첫차
      </Highlight>
    </p>,
  );
  const root = screen.getByTestId('root').element();

  expect(root.tagName).toBe('SPAN');
  expect(root.textContent).toBe('셔틀 막차와 셔틀 첫차');
  expect(marksIn(root)).toEqual(['셔틀', '셔틀']);
});

test('colors soft marks with secondary and solid marks with primary', async () => {
  const screen = await render(
    <IdsProvider color="yellow">
      <Highlight query="a" data-testid="soft">
        a
      </Highlight>
      <Highlight query="a" variant="solid" data-testid="solid">
        a
      </Highlight>
    </IdsProvider>,
  );
  const soft = screen.getByTestId('soft').element().querySelector('mark')!;
  const solid = screen.getByTestId('solid').element().querySelector('mark')!;
  const color = (name: string) => {
    const probe = document.createElement('span');
    probe.style.color = `var(--ids-color-${name})`;
    soft.parentElement!.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  };

  expect(getComputedStyle(soft).backgroundColor).toBe(color('secondary'));
  expect(getComputedStyle(soft).color).toBe(color('on-secondary'));
  expect(getComputedStyle(solid).backgroundColor).toBe(color('primary'));
  expect(getComputedStyle(solid).color).toBe(color('on-primary'));
});

test('takes the props of a Highlight.Mark child for every match', async () => {
  const screen = await render(
    <Highlight query={['react', 'flutter']} data-testid="root">
      React and Flutter
      <Highlight.Mark className="font-semibold" data-kind="term" />
    </Highlight>,
  );
  const marks = screen.getByTestId('root').element().querySelectorAll('mark');

  expect(Array.from(marks, (mark) => mark.textContent)).toEqual(['React', 'Flutter']);
  for (const mark of marks) {
    expect(mark).toHaveClass('font-semibold');
    expect(mark).toHaveAttribute('data-kind', 'term');
  }
  expect(screen.getByTestId('root').element().textContent).toBe('React and Flutter');
});

test('reads text from fragments and numbers', async () => {
  const screen = await render(
    <Highlight query="12" data-testid="root">
      <>셔틀 </>
      {12}
      {'시'}
    </Highlight>,
  );

  expect(marksIn(screen.getByTestId('root').element())).toEqual(['12']);
});

test('follows a changing query', async () => {
  const screen = await render(
    <Highlight query="셔틀" data-testid="root">
      광주송정역행 셔틀
    </Highlight>,
  );
  await screen.rerender(
    <Highlight query={['광주', '역행']} data-testid="root">
      광주송정역행 셔틀
    </Highlight>,
  );

  expect(marksIn(screen.getByTestId('root').element())).toEqual(['광주', '역행']);
});

test('hydrates the server HTML without a mismatch', async () => {
  const tree = (
    <Highlight query={['cafe', 'gist', '(a+b)']} variant="solid">
      Café ＧＩＳＴ (a+b) 셔틀
      <Highlight.Mark className="font-semibold" />
    </Highlight>
  );
  const container = document.createElement('div');
  container.innerHTML = renderToString(tree);
  document.body.append(container);
  const serverHTML = container.innerHTML;
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  const recoverable = vi.fn();

  const root = hydrateRoot(container, tree, { onRecoverableError: recoverable });
  await vi.waitFor(() => expect(container.querySelectorAll('mark')).toHaveLength(3));

  expect(recoverable).not.toHaveBeenCalled();
  expect(errors).not.toHaveBeenCalled();
  expect(container.innerHTML).toBe(serverHTML);

  root.unmount();
  container.remove();
  errors.mockRestore();
});
