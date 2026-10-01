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
