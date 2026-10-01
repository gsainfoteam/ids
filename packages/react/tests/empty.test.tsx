import { type ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Button, Empty, IdsProvider } from '../src';

const html = (node: ReactNode) =>
  new DOMParser().parseFromString(renderToString(node), 'text/html');

const center = (element: Element) => {
  const rect = element.getBoundingClientRect();
  return rect.left + rect.width / 2;
};

function anatomy(props: Empty.Props = {}) {
  return (
    <Empty {...props}>
      <Empty.Media>
        <svg data-testid="glyph" />
      </Empty.Media>
      <Empty.Title>No projects yet</Empty.Title>
      <Empty.Description>Create one to get started.</Empty.Description>
      <Empty.Actions>
        <Button>Create</Button>
        <Button variant="outline">Import</Button>
      </Empty.Actions>
    </Empty>
  );
}

test('SSR: static content with no role or live region, every part marks itself', () => {
  const doc = html(anatomy());
  const root = doc.querySelector<HTMLElement>('[data-empty]')!;
  expect(root.hasAttribute('role')).toBe(false);
  expect(root.hasAttribute('aria-live')).toBe(false);
  expect(root.dataset.variant).toBe('ghost');
  expect(root.dataset.size).toBe('standard');
  expect(root.dataset.align).toBe('center');
  expect(root.className).toContain('concentric-p-8');
  for (const part of ['media', 'title', 'description', 'actions'])
    expect(doc.querySelectorAll(`[data-empty-${part}]`), part).toHaveLength(1);
  expect(doc.querySelector('[data-empty-media]')!.getAttribute('data-variant')).toBe('soft');
});

test('without Empty.Media an inbox icon stands in, hidden removes it, and a nested Media is not doubled', () => {
  const media = (extra?: ReactNode) =>
    html(
      <Empty>
        {extra}
        <Empty.Title>Nothing here</Empty.Title>
      </Empty>,
    ).querySelectorAll('[data-empty-media]');

  const fallback = media();
  expect(fallback).toHaveLength(1);
  expect(fallback[0]!.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  expect(media(<Empty.Media hidden />)).toHaveLength(0);
  expect(
    media(
      <div>
        <Empty.Media>
          <i id="custom" />
        </Empty.Media>
      </div>,
    ),
  ).toHaveLength(1);
});

test('the title becomes a heading through asChild, and every part takes asChild', async () => {
  const screen = await render(
    <IdsProvider>
      <Empty>
        <Empty.Title asChild>
          <h3>No members</h3>
        </Empty.Title>
        <Empty.Description asChild>
          <p>Invite someone.</p>
        </Empty.Description>
        <Empty.Actions asChild>
          <nav aria-label="Next steps">
            <a href="#invite">Invite</a>
          </nav>
        </Empty.Actions>
      </Empty>
    </IdsProvider>,
  );

  const heading = screen.getByRole('heading', { level: 3, name: 'No members' });
  await expect.element(heading).toHaveAttribute('data-empty-title');
  await expect
    .element(screen.getByText('Invite someone.'))
    .toHaveAttribute('data-empty-description');
  await expect
    .element(screen.getByRole('navigation', { name: 'Next steps' }))
    .toHaveAttribute('data-empty-actions');
});

test('parts stack in order and sit on the center line; align start moves them to the start edge', async () => {
  const screen = await render(
    <IdsProvider>
      <div className="w-96">{anatomy()}</div>
      <div className="w-96">{anatomy({ align: 'start' })}</div>
    </IdsProvider>,
  );
  const [centered, start] = [...screen.container.querySelectorAll<HTMLElement>('[data-empty]')];

  const parts = (root: HTMLElement) =>
    ['media', 'title', 'description', 'actions'].map(
      (part) => root.querySelector<HTMLElement>(`[data-empty-${part}]`)!,
    );

  const stacked = parts(centered!).map((part) => part.getBoundingClientRect());
  for (let index = 1; index < stacked.length; index++)
    expect(stacked[index]!.top).toBeGreaterThanOrEqual(stacked[index - 1]!.bottom);
  for (const part of parts(centered!)) expect(center(part)).toBeCloseTo(center(centered!), 0);
  expect(getComputedStyle(centered!).textAlign).toBe('center');

  const startLeft =
    start!.getBoundingClientRect().left + parseFloat(getComputedStyle(start!).paddingLeft);
  for (const part of parts(start!))
    expect(part.getBoundingClientRect().left).toBeCloseTo(startLeft, 0);
  expect(getComputedStyle(start!).textAlign).toBe('start');
});

test('size tiny tightens the padding and the media box; outline draws a dashed neutral border', async () => {
  const screen = await render(
    <IdsProvider>
      {anatomy({ variant: 'outline' })}
      {anatomy({ size: 'tiny', variant: 'soft' })}
    </IdsProvider>,
  );
  const [standard, tiny] = [...screen.container.querySelectorAll<HTMLElement>('[data-empty]')];

  expect(getComputedStyle(standard!).paddingTop).toBe('32px');
  expect(getComputedStyle(tiny!).paddingTop).toBe('16px');
  expect(getComputedStyle(standard!).borderTopStyle).toBe('dashed');
  expect(getComputedStyle(standard!).borderTopLeftRadius).toBe('16px');
  expect(getComputedStyle(tiny!).borderTopWidth).toBe('0px');
  expect(standard!.querySelector('[data-empty-media]')!.getBoundingClientRect().width).toBe(48);
  expect(tiny!.querySelector('[data-empty-media]')!.getBoundingClientRect().width).toBe(40);
});

test('the actions are ordinary buttons in the tab order', async () => {
  const onCreate = vi.fn();
  const screen = await render(
    <IdsProvider>
      <Empty>
        <Empty.Title>No projects yet</Empty.Title>
        <Empty.Actions>
          <Button onClick={onCreate}>Create</Button>
          <Button variant="outline">Import</Button>
        </Empty.Actions>
      </Empty>
    </IdsProvider>,
  );

  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: 'Create' })).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  expect(onCreate).toHaveBeenCalledOnce();
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: 'Import' })).toHaveFocus();
});

test('warns in development when there is no Empty.Title', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

  await render(
    <Empty>
      <Empty.Description>Only a description</Empty.Description>
    </Empty>,
  );
  expect(warn).toHaveBeenCalledWith('[IDS] Empty: give it an Empty.Title.');

  warn.mockClear();
  await render(anatomy());
  expect(warn).not.toHaveBeenCalled();
  warn.mockRestore();
});

test('a part outside Empty throws', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => renderToString(<Empty.Title>Orphan</Empty.Title>)).toThrow(
    '`<Empty.Title>` must be used inside `<Empty>`.',
  );
  vi.restoreAllMocks();
});
