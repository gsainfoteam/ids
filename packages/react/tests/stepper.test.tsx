import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, onTestFinished, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Avatar, Stepper } from '../src';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const step = (name: string) => page.getByRole('button', { name: new RegExp(`^${name}`) });

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

function steps(names = ['Account', 'Profile', 'Review'], marks: Stepper.Item.Props[] = []) {
  return names.map((name, index) => (
    <Stepper.Item key={name} {...marks[index]}>
      <Stepper.Title>{name}</Stepper.Title>
      <Stepper.Description>{`${name} details`}</Stepper.Description>
    </Stepper.Item>
  ));
}

test('SSR: an ordered list of step buttons, the current one marked with aria-current', () => {
  const doc = parse(renderToString(<Stepper defaultValue={1}>{steps()}</Stepper>));
  const list = doc.querySelector('ol')!;
  const items = Array.from(list.children);

  expect(list.getAttribute('aria-label')).toBe('진행 단계');
  expect(items.map((item) => item.tagName)).toEqual(['LI', 'LI', 'LI']);
  expect(items.map((item) => item.getAttribute('data-state'))).toEqual([
    'completed',
    'current',
    'upcoming',
  ]);

  const buttons = Array.from(doc.querySelectorAll<HTMLButtonElement>('li > button'));
  expect(buttons.map((button) => button.getAttribute('aria-current'))).toEqual([
    null,
    'step',
    null,
  ]);
  expect(buttons[0]!.getAttribute('aria-labelledby')!.split(' ')).toHaveLength(2);
  expect(doc.getElementById(buttons[1]!.getAttribute('aria-describedby')!)!.textContent).toBe(
    'Profile details',
  );
  expect(buttons[0]!.querySelector('[data-stepper-indicator] svg'), 'a check').not.toBeNull();
  expect(buttons[1]!.querySelector('[data-stepper-indicator]')!.textContent).toBe('2');
  expect(doc.querySelectorAll('[data-stepper-separator]')).toHaveLength(2);
});

test('SSR: a value without onValueChange only shows progress, with no buttons', () => {
  const doc = parse(renderToString(<Stepper value={2}>{steps()}</Stepper>));

  expect(doc.querySelectorAll('button')).toHaveLength(0);
  expect(doc.querySelector('li[aria-current="step"]')!.textContent).toContain('Review');
  expect(doc.querySelector('li')!.textContent).toContain('완료');
});

test('linear: only the steps behind and the next one can be pressed', async () => {
  const onValueChange = vi.fn();
  await render(<Stepper onValueChange={onValueChange}>{steps()}</Stepper>);

  await expect.element(step('Review')).toBeDisabled();
  await userEvent.click(step('Profile'));
  expect(onValueChange).toHaveBeenLastCalledWith(1);
  await expect.element(step('Review')).toBeEnabled();
  await expect.element(step('Profile')).toHaveAttribute('aria-current', 'step');
  await userEvent.click(step('Account'));
  expect(onValueChange).toHaveBeenLastCalledWith(0);
  await expect.element(step('Review')).toBeDisabled();
});

test('linear: a step marked completed can be reached even when it lies ahead', async () => {
  await render(<Stepper>{steps(undefined, [{}, {}, { completed: true }])}</Stepper>);

  await expect.element(step('Review')).toBeEnabled();
  await expect.element(step('Review')).toHaveAccessibleName('Review 완료');
  await expect.element(step('Review')).not.toHaveAttribute('data-unreachable');
});

test('non-linear: any step can be pressed, disabled ones cannot', async () => {
  const onValueChange = vi.fn();
  await render(
    <Stepper linear={false} onValueChange={onValueChange}>
      {steps(['A', 'B', 'C', 'D'], [{}, { disabled: true }])}
    </Stepper>,
  );

  await userEvent.click(step('D'));
  expect(onValueChange).toHaveBeenLastCalledWith(3);
  await expect.element(step('B')).toBeDisabled();
  await expect.element(step('B')).toHaveAttribute('data-disabled');
  await expect.element(step('D')).toHaveAttribute('aria-current', 'step');
});

test('a disabled root disables every step', async () => {
  await render(
    <Stepper disabled linear={false}>
      {steps()}
    </Stepper>,
  );

  for (const name of ['Account', 'Profile', 'Review'])
    await expect.element(step(name)).toBeDisabled();
});

test('keyboard: one Tab stop on the current step, arrows, Home and End move between steps', async () => {
  await render(
    <>
      <button type="button">before</button>
      <Stepper linear={false} defaultValue={1}>
        {steps(['A', 'B', 'C', 'D'], [{}, {}, { disabled: true }])}
      </Stepper>
      <button type="button">after</button>
    </>,
  );

  page.getByRole('button', { name: 'before' }).element().focus();
  await userEvent.keyboard('{Tab}');
  await expect.element(step('B')).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(step('D')).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(step('D')).toHaveFocus();
  await userEvent.keyboard('{Home}');
  await expect.element(step('A')).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(step('B')).toHaveFocus();
  await userEvent.keyboard('{End}');
  await expect.element(step('D')).toHaveFocus();
  await userEvent.keyboard('{Tab}');
  await expect.element(page.getByRole('button', { name: 'after' })).toHaveFocus();
  await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
  await expect.element(step('B')).toHaveFocus();
  await userEvent.keyboard('{ArrowLeft}');
  await userEvent.keyboard('{Enter}');
  await expect.element(step('A')).toHaveAttribute('aria-current', 'step');
  await userEvent.keyboard('{ArrowRight}');
  await userEvent.keyboard(' ');
  await expect.element(step('B')).toHaveAttribute('aria-current', 'step');
});

test('right-to-left swaps the left and right arrows', async () => {
  await render(
    <div dir="rtl">
      <Stepper linear={false}>{steps()}</Stepper>
    </div>,
  );

  step('Account').element().focus();
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(step('Profile')).toHaveFocus();
});

test('an error step keeps aria-current and reads its state after the title', async () => {
  await render(<Stepper defaultValue={1}>{steps(undefined, [{}, { error: true }])}</Stepper>);

  const profile = step('Profile');
  await expect.element(profile).toHaveAccessibleName('Profile 오류');
  await expect.element(profile).toHaveAccessibleDescription('Profile details');
  await expect.element(profile).toHaveAttribute('aria-current', 'step');
  await expect.element(profile).toHaveAttribute('data-state', 'error');
  expect(profile.element().querySelector('svg')).not.toBeNull();
});

test('Content shows only the panel of the current step and keeps the others mounted', async () => {
  await render(
    <Stepper defaultValue={0}>
      {steps()}
      <Stepper.Content value={0}>
        <input aria-label="Email" />
      </Stepper.Content>
      <Stepper.Content value={1}>Profile form</Stepper.Content>
    </Stepper>,
  );

  await userEvent.fill(page.getByRole('textbox', { name: 'Email' }), 'a@b.c');
  await userEvent.click(step('Profile'));
  await expect.element(page.getByText('Profile form')).toBeVisible();
  await expect.element(page.getByLabelText('Email')).not.toBeVisible();
  await userEvent.click(step('Account'));
  await expect.element(page.getByRole('textbox', { name: 'Email' })).toHaveValue('a@b.c');
});

test('explicit parts replace the defaults, and part children take the step state', async () => {
  await render(
    <Stepper defaultValue={1}>
      <Stepper.Item>
        <Stepper.Trigger>
          <Stepper.Title>First</Stepper.Title>
          <Stepper.Indicator>
            {(state) => (state.status === 'completed' ? '✓' : 'x')}
          </Stepper.Indicator>
        </Stepper.Trigger>
        <Stepper.Separator className="custom-separator" />
      </Stepper.Item>
      <Stepper.Item>
        <Stepper.Title>{(state) => `Second ${state.status}`}</Stepper.Title>
      </Stepper.Item>
    </Stepper>,
  );

  const first = step('First').element();
  expect(first.querySelectorAll('[data-stepper-indicator]')).toHaveLength(1);
  expect(first.querySelector('[data-stepper-indicator]')!.textContent).toBe('✓');
  expect(document.querySelectorAll('[data-stepper-separator]')).toHaveLength(1);
  expect(document.querySelector('.custom-separator')).not.toBeNull();
  await expect.element(step('Second current')).toHaveAttribute('aria-current', 'step');
});

test('development warnings: a value past the steps and a child that is not a part', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  onTestFinished(() => warn.mockRestore());

  await render(
    <Stepper value={5}>
      {steps()}
      <div>stray</div>
    </Stepper>,
  );

  expect(warn).toHaveBeenCalledWith(expect.stringContaining('value=5 is outside the 3 steps'));
  expect(warn).toHaveBeenCalledWith(
    expect.stringContaining('only Stepper.Item and Stepper.Content'),
  );
});

test('a vertical title keeps its first line level with the indicator, also when it wraps', async () => {
  for (const size of ['standard', 'tiny'] as const) {
    const screen = await render(
      <div className="w-48">
        <Stepper orientation="vertical" size={size} value={0}>
          <Stepper.Item>
            <Stepper.Title>A title long enough to wrap onto another line</Stepper.Title>
            <Stepper.Description>Details</Stepper.Description>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>Short</Stepper.Title>
          </Stepper.Item>
        </Stepper>
      </div>,
    );

    const items = Array.from(document.querySelectorAll('[data-stepper-item]'));
    expect(linesOf(items[0]!.querySelector('[data-stepper-title]')!).length).toBeGreaterThan(1);
    for (const item of items) {
      const firstLine = linesOf(item.querySelector('[data-stepper-title]')!)[0]!;
      const indicator = rectOf(item.querySelector('[data-stepper-indicator]'));
      expect(Math.abs(middleOf(indicator) - middleOf(firstLine))).toBeLessThanOrEqual(1);
    }

    await screen.unmount();
  }
});

test('SSR: progress={false} lists events with no current step; unmarked events are neutral and read no status', () => {
  const doc = parse(
    renderToString(
      <Stepper
        progress={false}
        aria-label="Activity"
        className={(state) => `value-${state.value} progress-${state.progress}`}
      >
        {steps(['Commented', 'Deployed', 'Failed'], [{}, { completed: true }, { error: true }])}
      </Stepper>,
    ),
  );
  const list = doc.querySelector('ol')!;
  const items = Array.from(list.children);

  expect(doc.querySelector('[data-stepper]')!.className).toContain('value--1 progress-false');
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

test('progress={false} draws a plain event as a dot on the first line of its title, and keeps the lines neutral', async () => {
  await render(
    <div className="w-48">
      <Stepper progress={false} orientation="vertical" aria-label="Activity">
        <Stepper.Item completed>
          <Stepper.Title>Deployed</Stepper.Title>
        </Stepper.Item>
        <Stepper.Item>
          <Stepper.Title>A title long enough to wrap onto another line</Stepper.Title>
        </Stepper.Item>
        <Stepper.Item>
          <Stepper.Title>Created</Stepper.Title>
        </Stepper.Item>
      </Stepper>
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

test('progress={false} ignores value, onValueChange and linear, with a development warning', async () => {
  const warn = silenceWarnings();
  const onValueChange = vi.fn();
  await render(
    <Stepper
      progress={false}
      aria-label="Activity"
      value={5}
      onValueChange={onValueChange}
      linear={false}
    >
      {steps()}
    </Stepper>,
  );

  expect(document.querySelectorAll('button')).toHaveLength(0);
  expect(document.querySelector('[aria-current]')).toBeNull();
  expect(Array.from(document.querySelectorAll('li'), (item) => item.dataset.state)).toEqual([
    'neutral',
    'neutral',
    'neutral',
  ]);
  expect(warn).toHaveBeenCalledWith(
    expect.stringContaining('ignores value, onValueChange, linear'),
  );
  expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('is outside the'));
  expect(onValueChange).not.toHaveBeenCalled();
});

test('progress={false} has no default list name and warns in development until it gets one', async () => {
  const warn = silenceWarnings();
  const unnamed = await render(<Stepper progress={false}>{steps()}</Stepper>);

  expect(document.querySelector('ol')!.hasAttribute('aria-label')).toBe(false);
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('no default list name'));

  await unnamed.unmount();
  warn.mockClear();
  await render(
    <>
      <h2 id="activity-heading">Activity</h2>
      <Stepper progress={false} aria-labelledby="activity-heading">
        {steps()}
      </Stepper>
    </>,
  );

  await expect.element(page.getByRole('list', { name: 'Activity' })).toBeInTheDocument();
  expect(warn).not.toHaveBeenCalled();
});

test('Indicator asChild draws an Avatar at the indicator size, hidden from screen readers', async () => {
  for (const [size, side] of [
    ['standard', 32],
    ['tiny', 24],
  ] as const) {
    const screen = await render(
      <Stepper progress={false} orientation="vertical" size={size} aria-label="Activity">
        <Stepper.Item>
          <Stepper.Indicator asChild>
            <Avatar name="Alice Kim" />
          </Stepper.Indicator>
          <Stepper.Title>Alice commented</Stepper.Title>
        </Stepper.Item>
        <Stepper.Item>
          <Stepper.Title>Bob joined</Stepper.Title>
        </Stepper.Item>
      </Stepper>,
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

test('Body renders outside the step button: its button is its own Tab stop and pressing it keeps the step', async () => {
  const onValueChange = vi.fn();
  const onResend = vi.fn();
  await render(
    <>
      <button type="button">before</button>
      <Stepper orientation="vertical" defaultValue={0} onValueChange={onValueChange}>
        <Stepper.Item>
          <Stepper.Title>Account</Stepper.Title>
          <Stepper.Body>
            <button type="button" onClick={onResend}>
              Resend
            </button>
          </Stepper.Body>
          <Stepper.Description>Account details</Stepper.Description>
        </Stepper.Item>
        <Stepper.Item>
          <Stepper.Title>Profile</Stepper.Title>
        </Stepper.Item>
      </Stepper>
      <button type="button">after</button>
    </>,
  );

  const resend = page.getByRole('button', { name: 'Resend' });
  const body = resend.element().closest('[data-stepper-body]')!;
  expect(resend.element().closest('[data-stepper-trigger]')).toBeNull();
  expect(body.parentElement!.tagName).toBe('LI');
  expect(body.previousElementSibling!.hasAttribute('data-stepper-trigger')).toBe(true);
  await expect.element(step('Account')).toHaveAccessibleDescription('Account details');

  page.getByRole('button', { name: 'before' }).element().focus();
  await userEvent.keyboard('{Tab}');
  await expect.element(step('Account')).toHaveFocus();
  await userEvent.keyboard('{Tab}');
  await expect.element(resend).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(resend).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await userEvent.keyboard('{Tab}');
  await expect.element(page.getByRole('button', { name: 'after' })).toHaveFocus();
  await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
  await expect.element(resend).toHaveFocus();
  await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
  await expect.element(step('Account')).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(step('Profile')).toHaveFocus();

  await userEvent.click(resend);
  expect(onResend).toHaveBeenCalledTimes(2);
  expect(onValueChange).not.toHaveBeenCalled();
  await expect.element(step('Account')).toHaveAttribute('aria-current', 'step');
});

test('Body asChild hands its attributes and indent to the child, which takes the step state', async () => {
  await render(
    <Stepper progress={false} orientation="vertical" aria-label="Activity">
      <Stepper.Item error>
        <Stepper.Title>Tests failed</Stepper.Title>
        <Stepper.Body asChild className={(state) => `body-${state.status}`}>
          <section aria-label="Failure report">3 tests failed</section>
        </Stepper.Body>
      </Stepper.Item>
    </Stepper>,
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

test('the vertical connector line runs beside the Body, at the title column, to the next step', async () => {
  for (const progress of [true, false]) {
    const screen = await render(
      <div className="w-80">
        <Stepper orientation="vertical" progress={progress} aria-label="Activity">
          <Stepper.Item>
            <Stepper.Title>First</Stepper.Title>
            <Stepper.Body>
              <div className="h-40">A tall body</div>
            </Stepper.Body>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>Second</Stepper.Title>
          </Stepper.Item>
        </Stepper>
      </div>,
    );

    const [first, second] = document.querySelectorAll('[data-stepper-item]');
    const line = rectOf(first!.querySelector('[data-stepper-separator]'));
    const body = rectOf(first!.querySelector('[data-stepper-body]'));
    const indicator = rectOf(first!.querySelector('[data-stepper-indicator]'));
    const next = rectOf(second!.querySelector('[data-stepper-indicator]'));

    expect(line.top).toBeGreaterThanOrEqual(indicator.bottom);
    expect(line.top).toBeLessThanOrEqual(body.top);
    expect(line.bottom).toBeGreaterThan(body.bottom);
    expect(line.bottom).toBeLessThanOrEqual(next.top);
    expect(line.right).toBeLessThan(body.left);
    expect(body.left).toBeCloseTo(rectOf(first!.querySelector('[data-stepper-title]')).left, 0);
    if (!progress) {
      expect(line.top).toBeCloseTo(indicator.bottom, 0);
      expect(line.bottom).toBeCloseTo(next.top, 0);
    }

    await screen.unmount();
  }
});

test('Body is hidden in a horizontal Stepper and placed inside Trigger, each with a development warning', async () => {
  const warn = silenceWarnings();
  await render(
    <Stepper defaultValue={0}>
      <Stepper.Item>
        <Stepper.Title>Account</Stepper.Title>
        <Stepper.Body>Account body</Stepper.Body>
      </Stepper.Item>
      <Stepper.Item>
        <Stepper.Trigger>
          <Stepper.Title>Profile</Stepper.Title>
          <Stepper.Body>Profile body</Stepper.Body>
        </Stepper.Trigger>
      </Stepper.Item>
    </Stepper>,
  );

  await expect.element(page.getByText('Account body')).not.toBeVisible();
  expect(warn).toHaveBeenCalledWith(
    expect.stringContaining('Stepper.Body is hidden in a horizontal Stepper'),
  );
  expect(warn).toHaveBeenCalledWith(
    expect.stringContaining('Stepper.Body belongs in Stepper.Item next to Stepper.Trigger'),
  );
});

test('a record with avatars and a Body hydrates the server HTML without a mismatch', async () => {
  const tree = (
    <Stepper progress={false} orientation="vertical" aria-label="Activity">
      <Stepper.Item>
        <Stepper.Indicator asChild>
          <Avatar name="Alice Kim" />
        </Stepper.Indicator>
        <Stepper.Title>Alice commented</Stepper.Title>
        <Stepper.Description>
          <time dateTime="2026-09-30T09:12">5 minutes ago</time>
        </Stepper.Description>
        <Stepper.Body>
          <a href="#comment">Open the comment</a>
        </Stepper.Body>
      </Stepper.Item>
      <Stepper.Item error>
        <Stepper.Title>Tests failed</Stepper.Title>
      </Stepper.Item>
    </Stepper>
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
