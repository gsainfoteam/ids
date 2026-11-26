import type { ReactNode } from 'react';

import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, onTestFinished, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Avatar, Timeline } from '../src';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const rectOf = (element: Element | null) => element!.getBoundingClientRect();

const middleOf = (rect: DOMRect) => rect.top + rect.height / 2;

function linesOf(element: Element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  return Array.from(range.getClientRects());
}

function silenceWarnings() {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  onTestFinished(() => warn.mockRestore());
  return warn;
}

function events(names: string[], marks: Timeline.Item.Props[] = []) {
  return names.map((name, index) => (
    <Timeline.Item key={name} {...marks[index]}>
      <Timeline.Title>{name}</Timeline.Title>
      <Timeline.Description>{`${name} details`}</Timeline.Description>
    </Timeline.Item>
  ));
}

test('SSR: a vertical list of events with no current one; unmarked events are neutral and read no status', () => {
  const doc = parse(
    renderToString(
      <Timeline aria-label="Activity" className={(state) => `axis-${state.orientation}`}>
        {events(
          ['Commented', 'Deployed', 'Failed'],
          [{}, { status: 'completed' }, { status: 'error' }],
        )}
      </Timeline>,
    ),
  );
  const list = doc.querySelector('ol')!;
  const items = Array.from(list.children);

  expect(doc.querySelector('[data-stepper]')!.className).toContain('axis-vertical');
  expect(doc.querySelector('[data-stepper]')!.getAttribute('data-orientation')).toBe('vertical');
  expect(list.getAttribute('aria-label')).toBe('Activity');
  expect(items.map((item) => item.getAttribute('data-state'))).toEqual([
    'neutral',
    'completed',
    'error',
  ]);
  expect(doc.querySelectorAll('button')).toHaveLength(0);
  expect(doc.querySelector('[aria-current]')).toBeNull();
  expect(items.map((item) => item.textContent)).toEqual([
    'CommentedCommented details',
    'DeployedDeployed details완료',
    'FailedFailed details오류',
  ]);

  const neutralParts = items[0]!.querySelectorAll(
    '[data-stepper-trigger], [data-stepper-indicator], [data-stepper-title], [data-stepper-description], [data-stepper-separator]',
  );
  expect(neutralParts).toHaveLength(5);
  for (const part of [items[0]!, ...neutralParts]) {
    expect(part.getAttribute('data-state')).toBe('neutral');
    expect(part.hasAttribute('data-neutral')).toBe(true);
    expect(part.hasAttribute('data-upcoming')).toBe(false);
  }
  expect(items[0]!.querySelector('[data-stepper-indicator]')!.childNodes).toHaveLength(0);
  expect(items[1]!.querySelector('[data-stepper-indicator] svg'), 'a check').not.toBeNull();
});

test('a plain event is a dot on the first line of its title, and the lines stay neutral', async () => {
  await render(
    <div className="w-48">
      <Timeline aria-label="Activity">
        <Timeline.Item status="completed">
          <Timeline.Title>Deployed</Timeline.Title>
        </Timeline.Item>
        <Timeline.Item>
          <Timeline.Title>A title long enough to wrap onto another line</Timeline.Title>
        </Timeline.Item>
        <Timeline.Item>
          <Timeline.Title>Created</Timeline.Title>
        </Timeline.Item>
      </Timeline>
    </div>,
  );

  const [deployed, wrapped] = document.querySelectorAll('[data-stepper-item]');
  const dot = wrapped!.querySelector('[data-stepper-indicator]')!;
  const lines = linesOf(wrapped!.querySelector('[data-stepper-title]')!);
  const drawn = getComputedStyle(dot, '::before');

  expect(lines.length).toBeGreaterThan(1);
  expect([drawn.width, drawn.height]).toEqual(['10px', '10px']);
  expect(getComputedStyle(dot).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  expect(Math.abs(middleOf(rectOf(dot)) - middleOf(lines[0]!))).toBeLessThanOrEqual(1);

  const lineAfter = (item: Element) =>
    getComputedStyle(item.querySelector('[data-stepper-separator]')!).backgroundColor;
  expect(lineAfter(deployed!)).toBe(lineAfter(wrapped!));
});

test('the parts print their Timeline names', () => {
  expect(Timeline.Item.displayName).toBe('Timeline.Item');
  expect(Timeline.Indicator.displayName).toBe('Timeline.Indicator');
  expect(Timeline.Title.displayName).toBe('Timeline.Title');
  expect(Timeline.Description.displayName).toBe('Timeline.Description');
  expect(Timeline.Body.displayName).toBe('Timeline.Body');
  expect(Timeline.Separator.displayName).toBe('Timeline.Separator');
});

test('a Timeline has no default list name and warns in development until it gets one', async () => {
  const warn = silenceWarnings();
  const Unnamed = Timeline as (props: Omit<Timeline.Props, 'aria-label'>) => ReactNode;
  const unnamed = await render(<Unnamed>{events(['A', 'B'])}</Unnamed>);

  expect(document.querySelector('ol')!.hasAttribute('aria-label')).toBe(false);
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('Timeline: it has no accessible name'));

  await unnamed.unmount();
  warn.mockClear();
  await render(
    <>
      <h2 id="activity-heading">Activity</h2>
      <Timeline aria-labelledby="activity-heading">{events(['A', 'B'])}</Timeline>
    </>,
  );

  await expect.element(page.getByRole('list', { name: 'Activity' })).toBeInTheDocument();
  expect(warn).not.toHaveBeenCalled();
});

test('a child that is not a Timeline.Item warns in development', async () => {
  const warn = silenceWarnings();
  await render(
    <Timeline aria-label="Activity">
      {events(['A'])}
      <div>stray</div>
    </Timeline>,
  );

  expect(warn).toHaveBeenCalledWith(expect.stringContaining('Timeline: only Timeline.Item'));
});

test('Indicator asChild draws an Avatar at the indicator size, hidden from screen readers', async () => {
  for (const [size, side] of [
    ['standard', 32],
    ['tiny', 24],
  ] as const) {
    const screen = await render(
      <Timeline size={size} aria-label="Activity">
        <Timeline.Item>
          <Timeline.Indicator asChild>
            <Avatar name="Alice Kim" />
          </Timeline.Indicator>
          <Timeline.Title>Alice commented</Timeline.Title>
        </Timeline.Item>
        <Timeline.Item>
          <Timeline.Title>Bob joined</Timeline.Title>
        </Timeline.Item>
      </Timeline>,
    );

    const avatar = document.querySelector<HTMLElement>('[data-avatar]')!;
    const [avatarColumn, dotColumn] = document.querySelectorAll('[data-stepper-indicator]');
    expect(avatar).toBe(avatarColumn);
    expect(avatar.getAttribute('aria-hidden')).toBe('true');
    expect(avatar.hasAttribute('role')).toBe(false);
    expect([rectOf(avatar).width, rectOf(avatar).height]).toEqual([side, side]);
    expect(rectOf(dotColumn!).width).toBe(side);
    expect(getComputedStyle(avatar).borderRadius).not.toBe('0px');
    await expect.element(page.getByText('AK')).toBeVisible();

    await screen.unmount();
  }
});

test('Body asChild hands its attributes and indent to the child, which takes the event state', async () => {
  await render(
    <Timeline aria-label="Activity">
      <Timeline.Item status="error">
        <Timeline.Title>Tests failed</Timeline.Title>
        <Timeline.Body asChild className={(state) => `body-${state.status}`}>
          <section aria-label="Failure report">3 tests failed</section>
        </Timeline.Body>
      </Timeline.Item>
    </Timeline>,
  );

  const report = page.getByRole('region', { name: 'Failure report' }).element();
  expect(report.hasAttribute('data-stepper-body')).toBe(true);
  expect(report.getAttribute('data-state')).toBe('error');
  expect(report.className).toContain('body-error');
  expect(rectOf(report).left).toBeCloseTo(
    rectOf(document.querySelector('[data-stepper-title]')).left,
    0,
  );
});

test('the connector line runs from one indicator to the next, beside the Body', async () => {
  await render(
    <div className="w-80">
      <Timeline aria-label="Activity">
        <Timeline.Item>
          <Timeline.Title>First</Timeline.Title>
          <Timeline.Body>
            <div className="h-40">A tall body</div>
          </Timeline.Body>
        </Timeline.Item>
        <Timeline.Item>
          <Timeline.Title>Second</Timeline.Title>
        </Timeline.Item>
      </Timeline>
    </div>,
  );

  const [first, second] = document.querySelectorAll('[data-stepper-item]');
  const line = rectOf(first!.querySelector('[data-stepper-separator]'));
  const body = rectOf(first!.querySelector('[data-stepper-body]'));
  const indicator = rectOf(first!.querySelector('[data-stepper-indicator]'));
  const next = rectOf(second!.querySelector('[data-stepper-indicator]'));

  expect(line.top).toBeCloseTo(indicator.bottom, 0);
  expect(line.bottom).toBeCloseTo(next.top, 0);
  expect(line.bottom).toBeGreaterThan(body.bottom);
  expect(line.right).toBeLessThan(body.left);
  expect(body.left).toBeCloseTo(rectOf(first!.querySelector('[data-stepper-title]')).left, 0);
});

test('Body is hidden in a horizontal Timeline, with a development warning', async () => {
  const warn = silenceWarnings();
  await render(
    <Timeline orientation="horizontal" aria-label="Activity">
      <Timeline.Item>
        <Timeline.Title>Deployed</Timeline.Title>
        <Timeline.Body>Deploy body</Timeline.Body>
      </Timeline.Item>
    </Timeline>,
  );

  await expect.element(page.getByText('Deploy body')).not.toBeVisible();
  expect(warn).toHaveBeenCalledWith(
    expect.stringContaining('Timeline.Body is hidden in a horizontal Timeline'),
  );
});

test('a timeline with avatars and a Body hydrates the server HTML without a mismatch', async () => {
  const tree = (
    <Timeline aria-label="Activity">
      <Timeline.Item>
        <Timeline.Indicator asChild>
          <Avatar name="Alice Kim" />
        </Timeline.Indicator>
        <Timeline.Title>Alice commented</Timeline.Title>
        <Timeline.Description>
          <time dateTime="2026-09-30T09:12">5 minutes ago</time>
        </Timeline.Description>
        <Timeline.Body>
          <a href="#comment">Open the comment</a>
        </Timeline.Body>
      </Timeline.Item>
      <Timeline.Item status="error">
        <Timeline.Title>Tests failed</Timeline.Title>
      </Timeline.Item>
    </Timeline>
  );
  const container = document.body.appendChild(document.createElement('div'));
  container.innerHTML = renderToString(tree);
  const errors = vi.spyOn(console, 'error');
  const recoverable: unknown[] = [];
  const root = hydrateRoot(container, tree, {
    onRecoverableError: (error) => recoverable.push(error),
  });
  onTestFinished(() => {
    root.unmount();
    container.remove();
    errors.mockRestore();
  });

  const link = page.getByRole('link', { name: 'Open the comment' });
  await expect.element(link).toBeVisible();
  expect(link.element().closest('[data-stepper-trigger]')).toBeNull();
  expect(recoverable).toEqual([]);
  expect(errors).not.toHaveBeenCalled();
});
