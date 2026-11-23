import { type ComponentProps, type ReactElement } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Button, Card, IdsProvider } from '../src';
import { testTheme } from './theme';
import { IDS_STATE_OPACITY } from '../src/tokens/color-roles';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

function anatomy(props: Card.Props = {}) {
  return (
    <Card {...props}>
      <Card.Header>
        <Card.Title>Design review</Card.Title>
        <Card.Description>Today at 3pm</Card.Description>
        <Card.Action>
          <button type="button">Copy</button>
        </Card.Action>
      </Card.Header>
      <Card.Content>Agenda</Card.Content>
      <Card.Footer>
        <button type="button">Like</button>
      </Card.Footer>
    </Card>
  );
}

test('SSR: a static card has no role and every part marks itself', () => {
  const doc = parse(renderToString(anatomy()));
  const root = doc.querySelector<HTMLElement>('[data-card]')!;
  expect(root.hasAttribute('role')).toBe(false);
  expect(root.hasAttribute('tabindex')).toBe(false);
  expect(root.hasAttribute('data-disabled'), 'static is not disabled').toBe(false);
  expect(root.dataset.variant).toBe('outline');
  expect(root.className).toContain('concentric-p-4');
  for (const part of ['header', 'title', 'description', 'action', 'content', 'footer'])
    expect(doc.querySelector(`[data-card-${part}]`), part).not.toBeNull();
  expect(doc.querySelector('[data-card-header]')!.className).toContain(
    'has-[[data-card-action]]:grid-cols-[minmax(0,1fr)_auto]',
  );
});

test('SSR: the title is an h3, asChild picks another tag, and its button sits inside', () => {
  expect(parse(renderToString(anatomy())).querySelector('[data-card-title]')!.tagName).toBe('H3');
  const doc = parse(
    renderToString(
      <Card onClick={() => {}}>
        <Card.Title asChild>
          <h2>Design review</h2>
        </Card.Title>
      </Card>,
    ),
  );
  const button = doc.querySelector('h2[data-card-title] > button[data-surface-trigger]')!;
  expect(button.textContent).toBe('Design review');
});

test('SSR: a pressable card already renders its title as the button, inside a heading given by asChild', () => {
  const doc = parse(
    renderToString(
      <Card onClick={() => {}}>
        <Card.Header>
          <Card.Title asChild>
            <h3>Design review</h3>
          </Card.Title>
        </Card.Header>
      </Card>,
    ),
  );
  expect(doc.querySelector('[data-card]')!.hasAttribute('role')).toBe(false);
  const button = doc.querySelector('h3[data-card-title] > button[data-surface-trigger]')!;
  expect(button.textContent).toBe('Design review');
  expect(button.getAttribute('type')).toBe('button');
});

test('onClick makes the title the button, described by the description, inside a plain card', async () => {
  const screen = await render(anatomy({ onClick: () => {} }));
  const title = screen.getByRole('button', { name: 'Design review' });
  const root = screen.container.querySelector<HTMLElement>('[data-card]')!;
  expect(title.element().closest('[data-card-title]')).not.toBeNull();
  expect(root).not.toHaveAttribute('role');
  expect(root).not.toHaveAttribute('aria-labelledby');
  expect(root).toHaveAttribute('data-interactive');
  await expect.element(title).toHaveAccessibleDescription('Today at 3pm');
  expect(title.element()).toHaveAttribute('data-field-input');
});

test('Enter presses on key down; Space presses on key up, and not after focus leaves', async () => {
  const onClick = vi.fn();
  const screen = await render(anatomy({ onClick }));
  const card = screen.getByRole('button', { name: 'Design review' });
  await userEvent.keyboard('{Tab}');
  await expect.element(card).toHaveFocus();
  await userEvent.keyboard('{Enter>}');
  expect(onClick, 'Enter presses on key down').toHaveBeenCalledTimes(1);
  await userEvent.keyboard('{/Enter}{Enter>2}');
  expect(onClick, 'a held Enter repeats like a native button').toHaveBeenCalledTimes(3);
  await userEvent.keyboard('{/Enter}');
  onClick.mockClear();
  await userEvent.keyboard('[Space>]');
  expect(onClick, 'space waits for key up').not.toHaveBeenCalled();
  await userEvent.keyboard('[/Space]');
  expect(onClick).toHaveBeenCalledTimes(1);
  await userEvent.keyboard('[Space>]{Tab}{Shift>}{Tab}{/Shift}');
  await expect.element(card).toHaveFocus();
  await userEvent.keyboard('[/Space]');
  expect(onClick, 'focus left before the key came up').toHaveBeenCalledTimes(1);
});

test('clicks and keys that start on a control inside the card stay with that control', async () => {
  const onClick = vi.fn();
  const screen = await render(anatomy({ onClick }));
  const like = screen.getByRole('button', { name: 'Like' });
  await userEvent.click(like);
  await userEvent.click(screen.getByRole('button', { name: 'Copy' }));
  expect(onClick).not.toHaveBeenCalled();
  like.element().focus();
  await userEvent.keyboard('{Enter}');
  expect(onClick).not.toHaveBeenCalled();
  await userEvent.click(screen.getByText('Agenda'));
  expect(onClick, 'text inside the card still opens it').toHaveBeenCalledOnce();
});

test('disabled: the title button is disabled, out of the tab order, and nothing presses', async () => {
  const onClick = vi.fn();
  const screen = await render(anatomy({ onClick, disabled: true }));
  const title = screen.getByRole('button', { name: 'Design review' });
  await expect.element(title).toBeDisabled();
  await expect.element(title).toHaveAttribute('disabled');
  const root = screen.container.querySelector('[data-card]');
  expect(root).toHaveAttribute('data-disabled');
  expect(root, 'the whole card reads as inactive').toHaveAttribute('aria-disabled', 'true');
  await userEvent.click(screen.getByText('Today at 3pm'));
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: 'Copy' })).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  expect(onClick).not.toHaveBeenCalled();
});

test('asChild: a link keeps its role, gains the states and is named by the title', async () => {
  const clicks: string[] = [];
  const screen = await render(
    <Card asChild className={(state) => (state.interactive ? 'is-interactive' : '')}>
      <a
        href="#review"
        onClick={(event) => {
          event.preventDefault();
          clicks.push('link');
        }}
      >
        <Card.Header>
          <Card.Title>Design review</Card.Title>
        </Card.Header>
      </a>
    </Card>,
  );
  const link = screen.getByRole('link', { name: 'Design review' });
  await expect.element(link).toHaveAttribute('data-card');
  await expect.element(link).not.toHaveAttribute('role');
  await expect.element(link).not.toHaveAttribute('tabindex');
  await expect.element(link).toHaveClass('is-interactive');
  await expect
    .element(link)
    .toHaveAttribute('aria-labelledby', screen.container.querySelector('[data-card-title]')!.id);
  await userEvent.click(link);
  expect(clicks).toEqual(['link']);
});

const asServerComponentHandsItOver = <T,>(component: T): T =>
  ({
    $$typeof: Symbol.for('react.lazy'),
    _payload: component,
    _init: (payload: T) => payload,
  }) as unknown as T;

function RouterLink({ href, children, ...props }: ComponentProps<'a'>) {
  return (
    <a {...props} href={href} data-router-link="">
      {children}
    </a>
  );
}

test('SSR: asChild is pressable when its child has an href or is a button, and only then', () => {
  const isInteractive = (child: ReactElement) =>
    parse(renderToString(<Card asChild>{child}</Card>))
      .querySelector('[data-card]')!
      .hasAttribute('data-interactive');
  const LazyLink = asServerComponentHandsItOver(RouterLink);

  expect(isInteractive(<a href="/posts/1">Post</a>), 'a link').toBe(true);
  expect(isInteractive(<RouterLink href="/posts/1">Post</RouterLink>), 'a router link').toBe(true);
  expect(
    isInteractive(<LazyLink href="/posts/1">Post</LazyLink>),
    'a router link a Server Component hands over',
  ).toBe(true);
  expect(isInteractive(<button type="button">Open</button>), 'a button').toBe(true);
  expect(isInteractive(<a>Not a link</a>), 'an anchor without href').toBe(false);
  expect(isInteractive(<form />), 'a form').toBe(false);
  expect(isInteractive(<article />), 'an article').toBe(false);
  expect(
    parse(renderToString(anatomy())).querySelector('[data-card]')!.hasAttribute('data-interactive'),
    'a card with no onClick',
  ).toBe(false);
});

test('media bleeds to the edge and takes the corner where it touches one', () => {
  const doc = parse(
    renderToString(
      <Card>
        <Card.Media>
          <img src="/a.png" alt="" />
        </Card.Media>
      </Card>,
    ),
  );
  const media = doc.querySelector('[data-card-media]')!;
  expect(media.className).toContain('first:rounded-t-[inherit]');
  expect(media.className).toContain('-mx-[calc(var(--card-pad)_-_var(--card-ring))]');
  expect(doc.querySelector('[data-card]')!.className).toContain('[--card-ring:1px]');
  const soft = parse(renderToString(<Card variant="soft" />));
  expect(soft.querySelector('[data-card]')!.className).toContain('[--card-ring:0px]');
});

function colorOf(variable: string, inside: Element) {
  const probe = document.createElement('div');
  probe.style.backgroundColor = `var(${variable})`;
  inside.closest('[data-mode]')!.append(probe);
  const color = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return color;
}

function textColorOf(variable: string, inside: Element) {
  const probe = document.createElement('div');
  probe.style.color = `var(${variable})`;
  inside.closest('[data-mode]')!.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

const hoverLayer = `${IDS_STATE_OPACITY.hover * 100}%`;
const layerOf = (element: Element) =>
  getComputedStyle(element).getPropertyValue('--ids-state-opacity');

function withFooter(props: Card.Props = {}, mode: 'light' | 'dark' = 'light') {
  return (
    <IdsProvider theme={testTheme} mode={mode}>
      <Card {...props}>
        <Card.Header>
          <Card.Title>Design review</Card.Title>
          <Card.Action>
            <Button variant="outline">Copy</Button>
          </Card.Action>
        </Card.Header>
        <Card.Content>Agenda</Card.Content>
        <Card.Footer>
          <Button variant="outline">Cancel</Button>
          <Button>Save</Button>
        </Card.Footer>
      </Card>
    </IdsProvider>
  );
}

test.each(['light', 'dark'] as const)(
  'the footer is a band under a neutral line, apart from the card, %s',
  async (mode) => {
    const screen = await render(withFooter({}, mode));
    const root = screen.container.querySelector<HTMLElement>('[data-card]')!;
    const footer = root.querySelector<HTMLElement>('[data-card-footer]')!;

    await expect.element(screen.getByRole('button', { name: 'Save' })).toBeVisible();
    const style = getComputedStyle(footer);
    expect(style.backgroundColor).toBe(colorOf('--ids-color-bg-block', root));
    expect(style.color).toBe(textColorOf('--ids-color-text-neutral-strong', root));
    expect(style.justifyContent).toBe('flex-end');
    expect(style.borderTopWidth).toBe('1px');
    expect(style.borderTopColor).toBe(colorOf('--ids-color-border-neutral', root));
    expect(getComputedStyle(root).backgroundColor).toBe(colorOf('--ids-color-bg-surface', root));
    expect(style.backgroundColor).not.toBe(getComputedStyle(root).backgroundColor);

    const cancel = screen.getByRole('button', { name: 'Cancel' }).element();
    const outlineBorder = colorOf('--ids-color-border-control-outline', root);
    expect(getComputedStyle(cancel).boxShadow).toContain(outlineBorder);
    expect(outlineBorder).not.toBe(style.backgroundColor);
  },
);

test('the footer band fills the card to its outline and lines up with the content', async () => {
  const screen = await render(withFooter());
  const root = screen.container.querySelector<HTMLElement>('[data-card]')!;
  const footer = root.querySelector<HTMLElement>('[data-card-footer]')!.getBoundingClientRect();
  const content = root.querySelector<HTMLElement>('[data-card-content]')!.getBoundingClientRect();
  const edge = root.getBoundingClientRect();

  await expect.element(screen.getByRole('button', { name: 'Save' })).toBeVisible();
  expect(footer.left - edge.left).toBeCloseTo(1, 0);
  expect(edge.right - footer.right).toBeCloseTo(1, 0);
  expect(edge.bottom - footer.bottom).toBeCloseTo(1, 0);

  const save = screen.getByRole('button', { name: 'Save' }).element().getBoundingClientRect();
  expect(save.right).toBeCloseTo(content.right, 0);
});

test('a quiet button on the footer band hovers with the state layer', async () => {
  const screen = await render(withFooter());
  const cancel = () => screen.getByRole('button', { name: 'Cancel' }).element();

  await expect.element(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
  expect(layerOf(cancel())).toBe('0%');
  await userEvent.hover(screen.getByRole('button', { name: 'Cancel' }));
  await expect.poll(() => layerOf(cancel())).toBe(hoverLayer);
});

test('a ghost card keeps only the line of the footer band', async () => {
  const screen = await render(withFooter({ variant: 'ghost' }));
  const root = screen.container.querySelector<HTMLElement>('[data-card]')!;
  const footer = root.querySelector<HTMLElement>('[data-card-footer]')!;

  await expect.element(screen.getByRole('button', { name: 'Save' })).toBeVisible();
  expect(getComputedStyle(footer).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  expect(getComputedStyle(footer).borderTopColor).toBe(colorOf('--ids-color-border-neutral', root));
});

test('the footer band reaches the bottom of an asChild form card', async () => {
  const screen = await render(
    <IdsProvider theme={testTheme}>
      <Card asChild>
        <form>
          <Card.Content>Fields</Card.Content>
          <Card.Footer>
            <Button type="submit">Save</Button>
          </Card.Footer>
        </form>
      </Card>
    </IdsProvider>,
  );
  const form = screen.container.querySelector<HTMLElement>('form[data-card]')!;
  const footer = form.querySelector<HTMLElement>(':scope > [data-card-footer]')!;

  await expect.element(screen.getByRole('button', { name: 'Save' })).toBeVisible();
  expect(form.getBoundingClientRect().bottom - footer.getBoundingClientRect().bottom).toBeCloseTo(
    1,
    0,
  );
});

test('parts outside Card throw', () => {
  expect(() => renderToString(<Card.Title>x</Card.Title>)).toThrow(/inside `<Card>`/);
});
