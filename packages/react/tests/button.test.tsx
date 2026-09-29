import { blend, wcagContrast } from 'culori';
import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import enums from '../../core/tokens/enums.json';
import { Button, ButtonGroup, IdsProvider, type IdsColor } from '../src';
import { skipWithoutCdp } from './engines';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

test('SSR: a native button that never submits by accident and names its variant and size', () => {
  const button = parse(
    renderToString(
      <Button colorScheme="danger" size="tiny">
        삭제
      </Button>,
    ),
  ).querySelector('button')!;
  expect(button.type).toBe('button');
  expect(button.dataset.variant).toBe('solid');
  expect(button.dataset.size).toBe('tiny');
  expect(button.className).toMatch(/\[--control-fill:var\(--ids-color-danger\)\]/);
  expect(button.textContent).toBe('삭제');
});

test('type defaults to button inside a form; type="submit" submits', async () => {
  const submitted = vi.fn();
  const screen = await render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitted();
      }}
    >
      <Button>미리보기</Button>
      <Button type="submit">제출</Button>
    </form>,
  );
  await userEvent.click(screen.getByRole('button', { name: '미리보기' }));
  expect(submitted).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: '제출' }));
  expect(submitted).toHaveBeenCalledOnce();
});

test('disabled uses the native attribute and blocks clicks', async () => {
  const onClick = vi.fn();
  const screen = await render(
    <Button disabled onClick={onClick}>
      저장
    </Button>,
  );
  const button = screen.getByRole('button', { name: '저장' });
  await expect.element(button).toBeDisabled();
  await expect.element(button).toHaveAttribute('data-disabled');
  await userEvent.click(button, { force: true });
  expect(onClick).not.toHaveBeenCalled();
});

test('focusableWhenDisabled keeps focus and the tab stop but blocks clicks, keys and submit', async () => {
  const onClick = vi.fn();
  const submitted = vi.fn();
  const screen = await render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitted();
      }}
    >
      <Button type="submit" disabled focusableWhenDisabled onClick={onClick}>
        저장 중
      </Button>
    </form>,
  );
  const button = screen.getByRole('button', { name: '저장 중' });
  await expect.element(button).not.toHaveAttribute('disabled');
  await expect.element(button).toHaveAttribute('aria-disabled', 'true');
  await userEvent.keyboard('{Tab}');
  await expect.element(button).toHaveFocus();
  await userEvent.click(button, { force: true });
  await userEvent.keyboard('{Enter}');
  await userEvent.keyboard('[Space]');
  expect(onClick).not.toHaveBeenCalled();
  expect(submitted).not.toHaveBeenCalled();
});

test('asChild renders the child with the button style; the child class and handlers go first', async () => {
  const events: string[] = [];
  const refs: Array<[string, string | undefined]> = [];
  const screen = await render(
    <Button
      asChild
      variant="outline"
      ref={(node) => {
        refs.push(['root', node?.tagName]);
      }}
      onClick={() => events.push('root')}
    >
      <a
        href="#docs"
        className="px-8"
        ref={(node) => {
          refs.push(['child', node?.tagName]);
        }}
        onClick={(event) => {
          event.preventDefault();
          events.push('child');
        }}
      >
        문서
      </a>
    </Button>,
  );
  const link = screen.getByRole('link', { name: '문서' });
  await expect.element(link).toHaveAttribute('href', '#docs');
  await expect.element(link).not.toHaveAttribute('type');
  await expect.element(link).toHaveAttribute('data-variant', 'outline');
  await expect.element(link).toHaveClass('px-8');
  await expect.element(link).not.toHaveClass('px-4');
  expect(refs.filter(([, tag]) => tag)).toEqual([
    ['root', 'A'],
    ['child', 'A'],
  ]);
  await userEvent.click(link);
  expect(events).toEqual(['child']);
});

test('a disabled asChild link drops href and the tab stop and blocks every activation', async () => {
  const calls: string[] = [];
  const recordInsteadOfThrow = (name: string) => () => {
    calls.push(name);
  };
  const screen = await render(
    <Button
      asChild
      disabled
      onClick={recordInsteadOfThrow('root click')}
      onKeyDown={recordInsteadOfThrow('root key')}
    >
      <a
        href="#danger"
        onClick={recordInsteadOfThrow('child click')}
        onKeyDown={recordInsteadOfThrow('child key')}
      >
        준비 중
      </a>
    </Button>,
  );
  const link = screen.getByRole('link', { name: '준비 중' });
  await expect.element(link).not.toHaveAttribute('href');
  await expect.element(link).toHaveAttribute('aria-disabled', 'true');
  await expect.element(link).toHaveAttribute('tabindex', '-1');
  await userEvent.click(link, { force: true });
  link.element().focus();
  await userEvent.keyboard('{Enter}');
  expect(calls).toEqual([]);
  await userEvent.keyboard('{Tab}');
  expect(calls).toEqual(['child key', 'root key']);
});

test('a disabled router component keeps the href it may require; its click is blocked', async () => {
  const onClick = vi.fn();
  const Link = (props: React.ComponentProps<'a'>) => <a {...props} />;
  const screen = await render(
    <Button asChild disabled onClick={onClick}>
      <Link href="/settings" onClick={onClick}>
        설정
      </Link>
    </Button>,
  );
  const link = screen.getByRole('link', { name: '설정' });
  await expect.element(link).toHaveAttribute('href', '/settings');
  await expect.element(link).toHaveAttribute('aria-disabled', 'true');
  await expect.element(link).toHaveAttribute('tabindex', '-1');
  const navigationWouldLeaveThePage = new MouseEvent('click', { bubbles: true, cancelable: true });
  link.element().dispatchEvent(navigationWouldLeaveThePage);
  expect(navigationWouldLeaveThePage.defaultPrevented).toBe(true);
  expect(onClick).not.toHaveBeenCalled();
});

test('asChild on a plain element adds button semantics and keyboard activation', async () => {
  const onClick = vi.fn();
  const screen = await render(
    <Button asChild onClick={onClick}>
      <span>카드</span>
    </Button>,
  );
  const card = screen.getByRole('button', { name: '카드' });
  await expect.element(card).toHaveAttribute('tabindex', '0');
  await userEvent.keyboard('{Tab}');
  await expect.element(card).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  expect(onClick).toHaveBeenCalledTimes(1);
  await userEvent.keyboard('[Space>]');
  expect(onClick).toHaveBeenCalledTimes(1);
  await userEvent.keyboard('[/Space]');
  expect(onClick).toHaveBeenCalledTimes(2);
});

test('an element button presses only on a Space that started on it, and not for a nested control', async () => {
  const onClick = vi.fn();
  const screen = await render(
    <Button asChild onClick={onClick}>
      <div>
        행<a href="#more">더보기</a>
      </div>
    </Button>,
  );
  const row = screen.getByRole('button');
  row.element().focus();
  await userEvent.keyboard('[/Space]');
  expect(onClick).not.toHaveBeenCalled();
  await userEvent.click(page.getByRole('link', { name: '더보기' }));
  expect(onClick).not.toHaveBeenCalled();
  await userEvent.click(row, { position: { x: 8, y: 18 } });
  expect(onClick).toHaveBeenCalledOnce();
});

test('className, children and variant accept a function of the interaction state', async () => {
  const screen = await render(
    <Button
      variant={(state) => (state.focusVisible ? 'solid' : 'ghost')}
      className={(state) => (state.focused ? 'is-focused' : undefined)}
    >
      {(state) => (state.focusVisible ? '키보드' : '기본')}
    </Button>,
  );
  const button = screen.getByRole('button');
  await expect.element(button).toHaveTextContent('기본');
  await expect.element(button).toHaveAttribute('data-variant', 'ghost');
  await userEvent.keyboard('{Tab}');
  await expect.element(button).toHaveTextContent('키보드');
  await expect.element(button).toHaveAttribute('data-variant', 'solid');
  await expect.element(button).toHaveClass('is-focused');
  await expect.element(button).toHaveAttribute('data-focus-visible');
});

test('a group size reaches its buttons unless a button sets its own', async () => {
  const screen = await render(
    <ButtonGroup size="tiny">
      <Button>가</Button>
      <Button size="standard">나</Button>
    </ButtonGroup>,
  );
  await expect
    .element(screen.getByRole('button', { name: '가' }))
    .toHaveAttribute('data-size', 'tiny');
  await expect
    .element(screen.getByRole('button', { name: '나' }))
    .toHaveAttribute('data-size', 'standard');
});

test.each([false, true])(
  'a button disabled under the pointer or mid-press drops its hover and press state (focusableWhenDisabled: %s)',
  async (focusableWhenDisabled) => {
    const screen = await render(
      <Button focusableWhenDisabled={focusableWhenDisabled}>Next</Button>,
    );
    const button = screen.getByRole('button', { name: 'Next' });
    await userEvent.hover(button);
    await expect.element(button).toHaveAttribute('data-hovered');
    button.element().focus();
    await userEvent.keyboard('[Space>]');
    await expect.element(button).toHaveAttribute('data-active');
    await screen.rerender(
      <Button focusableWhenDisabled={focusableWhenDisabled} disabled>
        Next
      </Button>,
    );
    await expect.element(button).toHaveAttribute('data-disabled');
    await expect.element(button).not.toHaveAttribute('data-hovered');
    await expect.element(button).not.toHaveAttribute('data-active');
    await userEvent.keyboard('[/Space]');
    await screen.rerender(<Button focusableWhenDisabled={focusableWhenDisabled}>Next</Button>);
    await expect.element(button).not.toHaveAttribute('data-hovered');
    await userEvent.unhover(button);
  },
);

async function holdMouseOn(element: Element) {
  const frame = window.frameElement!.getBoundingClientRect();
  const scale = frame.width / window.innerWidth;
  const rect = element.getBoundingClientRect();
  const point = {
    x: frame.left + (rect.left + rect.width / 2) * scale,
    y: frame.top + (rect.top + rect.height / 2) * scale,
  };
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point });
  await cdp().send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    ...point,
    button: 'left',
    buttons: 1,
    clickCount: 1,
  });
  return () =>
    cdp().send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      ...point,
      button: 'left',
      buttons: 0,
      clickCount: 1,
    });
}

test('glossy lays a highlight over the fill with a darker edge and a shadow, still rings on focus and sinks on press', async (context) => {
  skipWithoutCdp(context);
  const screen = await render(
    <IdsProvider>
      <Button variant="glossy">저장</Button>
    </IdsProvider>,
  );
  const button = screen.getByRole('button', { name: '저장' });
  await expect.element(button).toHaveAttribute('data-variant', 'glossy');
  const element = button.element();

  const rest = getComputedStyle(element);
  expect(rest.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(rest.backgroundImage).toMatch(/^linear-gradient\(/);
  expect(rest.boxShadow).toMatch(/rgba\(255, 255, 255, 0\.35\) 0px 1px 0px 0px inset/);
  expect(rest.boxShadow).toMatch(/0px 0px 0px 1px inset/);
  expect(rest.boxShadow).toMatch(/0px 1px 3px 0px/);

  await userEvent.keyboard('{Tab}');
  await expect.element(button).toHaveFocus();
  expect(getComputedStyle(element).boxShadow).toMatch(/0px 0px 0px 3px/);
  (element as HTMLElement).blur();

  const release = await holdMouseOn(element);
  await expect.element(button).toHaveAttribute('data-active');
  const pressed = getComputedStyle(element);
  expect(pressed.boxShadow).toMatch(/rgba\(0, 0, 0, 0\.2\) 0px 1px 2px 0px inset/);
  expect(pressed.boxShadow).not.toMatch(/0px 1px 3px 0px/);
  await release();
  await expect.element(button).not.toHaveAttribute('data-active');
});

const brandColors = enums.ids.color.values.$value as IdsColor[];
const statusSchemes = ['danger', 'success', 'warning', 'info'] as const;
const FORTY_TWO_HOVERS = 45_000;

test(
  'hovering a solid fill moves it away from its text, keeping 4.5:1 in every color and mode',
  { timeout: FORTY_TWO_HOVERS },
  async () => {
    const cases = (['light', 'dark'] as const).flatMap((mode) => [
      ...brandColors.map((color) => ({ mode, color, scheme: 'primary' as const })),
      ...statusSchemes.map((scheme) => ({ mode, color: 'blue' as const, scheme })),
    ]);
    const name = ({ mode, color, scheme }: (typeof cases)[number]) => `${mode} ${color} ${scheme}`;
    const screen = await render(
      <div>
        {cases.map((entry) => (
          <IdsProvider
            key={name(entry)}
            color={entry.color}
            mode={entry.mode}
            className="bg-(--ids-color-surface)"
          >
            <Button colorScheme={entry.scheme}>{name(entry)}</Button>
          </IdsProvider>
        ))}
      </div>,
    );
    const failing: string[] = [];

    for (const entry of cases) {
      const button = screen.getByRole('button', { name: name(entry) });
      await userEvent.hover(button);
      await expect.element(button).toHaveAttribute('data-hovered');
      const style = getComputedStyle(button.element());
      const page = getComputedStyle(button.element().parentElement!).backgroundColor;
      const shown = blend([page, style.backgroundColor], 'normal', 'rgb');
      const ratio = wcagContrast(style.color, shown);
      if (ratio < 4.5) failing.push(`${name(entry)}: ${ratio.toFixed(2)}`);
    }

    expect(failing).toEqual([]);
  },
);
