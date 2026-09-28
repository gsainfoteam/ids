import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Card } from '../src';

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

test('onClick makes it a button named by its title and described by its description', async () => {
  const screen = await render(anatomy({ onClick: () => {} }));
  const card = screen.getByRole('button', { name: 'Design review' });
  const title = screen.container.querySelector('[data-card-title]')!;
  const description = screen.container.querySelector('[data-card-description]')!;
  await expect.element(card).toHaveAttribute('tabindex', '0');
  await expect.element(card).toHaveAttribute('aria-labelledby', title.id);
  await expect.element(card).toHaveAttribute('aria-describedby', description.id);
  await expect.element(card).toHaveAccessibleDescription('Today at 3pm');
  await expect.element(card).toHaveAttribute('data-interactive');
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

test('disabled: aria-disabled, out of the tab order, and no press', async () => {
  const onClick = vi.fn();
  const screen = await render(anatomy({ onClick, disabled: true }));
  const card = screen.getByRole('button', { name: 'Design review' });
  await expect.element(card).toHaveAttribute('aria-disabled', 'true');
  await expect.element(card).not.toHaveAttribute('tabindex');
  await expect.element(card).toHaveAttribute('data-disabled');
  await userEvent.click(card, { force: true });
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

test('parts outside Card throw', () => {
  expect(() => renderToString(<Card.Title>x</Card.Title>)).toThrow(/inside `<Card>`/);
});
