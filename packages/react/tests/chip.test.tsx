import { useRef, useState, type ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Chip } from '../src';

const html = (node: ReactNode) =>
  new DOMParser().parseFromString(renderToString(node), 'text/html');
const nextFrame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve));

test('a static chip is a span without a role, and its text becomes the label', () => {
  const root = html(<Chip>Beta</Chip>).querySelector<HTMLElement>('[data-chip]')!;
  expect(root.tagName).toBe('SPAN');
  expect(root.hasAttribute('role')).toBe(false);
  expect(root.hasAttribute('tabindex')).toBe(false);
  expect(root.hasAttribute('data-disabled'), 'static is not disabled').toBe(false);
  expect(root.querySelector('[data-chip-label]')!.textContent).toBe('Beta');
  expect(root.dataset.variant).toBe('soft');
  expect(root.dataset.colorScheme).toBe('neutral');
});

test('selectable: a real button with aria-pressed that follows onSelectedChange', async () => {
  const changes: boolean[] = [];
  function App() {
    const [on, setOn] = useState(false);
    return (
      <Chip
        selected={on}
        onSelectedChange={(next) => {
          changes.push(next);
          setOn(next);
        }}
      >
        Follow
      </Chip>
    );
  }
  const screen = await render(<App />);
  const button = screen.getByRole('button', { name: 'Follow' });
  expect(button.element().tagName).toBe('BUTTON');
  await expect.element(button).toHaveAttribute('type', 'button');
  await expect.element(button).toHaveAttribute('aria-pressed', 'false');
  await userEvent.click(button);
  await expect.element(button).toHaveAttribute('aria-pressed', 'true');
  await expect.element(button).toHaveAttribute('data-selected');
  expect(changes).toEqual([true]);
});

test('a controlled selected without onSelectedChange stays as the parent set it', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const screen = await render(<Chip selected>Pinned</Chip>);
  const chip = screen.getByRole('button', { name: 'Pinned' });
  await userEvent.click(chip);
  await expect.element(chip).toHaveAttribute('aria-pressed', 'true');
  expect(warn).toHaveBeenCalledWith(
    '[IDS] Chip: selected needs onSelectedChange, or use defaultSelected.',
  );
  warn.mockRestore();
});

test('onClick alone makes a plain button, not a toggle', async () => {
  const onClick = vi.fn();
  const screen = await render(<Chip onClick={onClick}>Filter</Chip>);
  const chip = screen.getByRole('button', { name: 'Filter' });
  expect(chip.element().tagName).toBe('BUTTON');
  await expect.element(chip).not.toHaveAttribute('aria-pressed');
  await userEvent.click(chip);
  expect(onClick).toHaveBeenCalledOnce();
});

test('removable: the close button is named after the chip and removes on click, Backspace or Delete', async () => {
  const onRemove = vi.fn();
  const screen = await render(<Chip onRemove={onRemove}>react</Chip>);
  const close = screen.getByRole('button', { name: 'react 삭제' });
  const label = screen.container.querySelector('[data-chip-label]')!;
  expect(close.element().tagName).toBe('BUTTON');
  await expect.element(close).toHaveAttribute('aria-label', '삭제');
  await expect
    .element(close)
    .toHaveAttribute('aria-labelledby', `${label.id} ${close.element().id}`);
  expect(close.element().querySelector('svg'), 'a default X glyph').not.toBeNull();
  await userEvent.click(close);
  await expect.element(close).toHaveFocus();
  await userEvent.keyboard('{Backspace}');
  await userEvent.keyboard('{Delete}');
  await userEvent.keyboard('a');
  expect(onRemove).toHaveBeenCalledTimes(3);
});

test('the close button is a ghost IconButton in the chip color scheme and size', () => {
  const close = html(
    <Chip colorScheme="danger" size="tiny" onRemove={() => {}}>
      react
    </Chip>,
  ).querySelector<HTMLButtonElement>('[data-chip-close]')!;
  expect(close.type).toBe('button');
  expect(close.dataset.variant).toBe('ghost');
  expect(close.dataset.size).toBe('tiny');
  expect(close.className).toMatch(/\[--control-ring:var\(--ids-color-danger\)\]/);
  expect(close.className, 'the chip keeps its own small circle').toMatch(/(^| )size-3\.5( |$)/);
  expect(close.className).toMatch(/(^| )rounded-full( |$)/);
  expect(close.className, 'in the chip text color').toMatch(/(^| )text-current( |$)/);
});

test('a chip that is a button draws its X for the pointer and removes on Backspace', async () => {
  const events: string[] = [];
  const screen = await render(
    <Chip
      defaultSelected={false}
      onSelectedChange={(next) => events.push(`selected:${next}`)}
      onRemove={() => events.push('removed')}
    >
      Open
    </Chip>,
  );
  const button = screen.getByRole('button', { name: 'Open' });
  const close = screen.container.querySelector<HTMLElement>('[data-chip-close]')!;
  expect(close.tagName).toBe('SPAN');
  expect(close.getAttribute('aria-hidden')).toBe('true');
  expect(button.element().querySelector('button'), 'no button inside a button').toBeNull();
  await userEvent.click(close);
  expect(events, 'the X does not toggle the chip').toEqual(['removed']);
  button.element().focus();
  await userEvent.keyboard('{Backspace}');
  expect(events).toEqual(['removed', 'removed']);
});

test('removing a focused chip hands focus to the next chip, or the previous at the end', async () => {
  function Tags() {
    const [tags, setTags] = useState(['a', 'b', 'c']);
    return (
      <ul>
        {tags.map((tag) => (
          <li key={tag}>
            <Chip onRemove={() => setTags((prev) => prev.filter((t) => t !== tag))}>{tag}</Chip>
          </li>
        ))}
      </ul>
    );
  }
  const screen = await render(<Tags />);
  const closeOf = (tag: string) => screen.getByRole('button', { name: `${tag} 삭제` });
  closeOf('b').element().focus();
  await userEvent.keyboard('{Backspace}');
  await expect.element(closeOf('c')).toHaveFocus();
  await userEvent.keyboard('{Delete}');
  await expect.element(closeOf('a'), { message: 'the last one hands focus back' }).toHaveFocus();
});

test('onRemove gets the click or key that asked, and preventDefault leaves focus to it', async () => {
  const events: string[] = [];
  const prevented: boolean[] = [];
  function Tags() {
    const [tags, setTags] = useState(['a', 'b']);
    const entry = useRef<HTMLInputElement>(null);
    const remove = (tag: string) => (event: Chip.RemoveEvent) => {
      events.push(event.type);
      event.preventDefault();
      setTags((prev) => prev.filter((t) => t !== tag));
      entry.current?.focus();
    };
    return (
      <div onKeyDown={(event) => prevented.push(event.defaultPrevented)}>
        <input ref={entry} aria-label="entry" data-1p-ignore data-lpignore="true" />
        <ul>
          {tags.map((tag) => (
            <li key={tag}>
              <Chip onRemove={remove(tag)}>{tag}</Chip>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  const screen = await render(<Tags />);
  const closeOf = (tag: string) => screen.getByRole('button', { name: `${tag} 삭제` });
  closeOf('a').element().focus();
  await userEvent.keyboard('{Backspace}');
  await nextFrame();
  await expect
    .element(screen.getByRole('textbox', { name: 'entry' }), {
      message: 'not moved to the next chip',
    })
    .toHaveFocus();
  expect(prevented, 'the key still does nothing else').toEqual([true]);
  await userEvent.click(closeOf('b'));
  expect(events).toEqual(['keydown', 'click']);
});

test('keyboard focus on the close of a static chip is the chip focus-visible state', async () => {
  const screen = await render(
    <Chip onRemove={() => {}} className={(state) => (state.focusVisible ? 'lit' : 'dim')}>
      react
    </Chip>,
  );
  const chip = screen.container.querySelector<HTMLElement>('[data-chip]')!;
  const close = screen.getByRole('button', { name: 'react 삭제' });
  await expect.element(chip).not.toHaveAttribute('data-focus-visible');
  await userEvent.keyboard('{Tab}');
  await expect.element(close).toHaveFocus();
  await expect.element(chip).toHaveAttribute('data-focus-visible');
  await expect.element(chip).toHaveClass('lit');
  close.element().blur();
  await expect.element(chip).not.toHaveAttribute('data-focus-visible');
  await expect.element(chip).toHaveClass('dim');
});

test('disabled: nothing toggles or removes', async () => {
  const onRemove = vi.fn();
  const screen = await render(
    <Chip disabled onRemove={onRemove}>
      locked
    </Chip>,
  );
  const close = screen.getByRole('button', { name: 'locked 삭제' });
  await expect.element(close).toHaveAttribute('disabled');
  await expect
    .element(screen.container.querySelector<HTMLElement>('[data-chip]')!)
    .toHaveAttribute('aria-disabled', 'true');
  await userEvent.click(close, { force: true });
  close.element().focus();
  await expect.element(close).not.toHaveFocus();
  await userEvent.keyboard('{Backspace}');
  expect(onRemove).not.toHaveBeenCalled();
  await screen.rerender(
    <Chip disabled defaultSelected={false}>
      toggle
    </Chip>,
  );
  await expect.element(screen.getByRole('button', { name: 'toggle' })).toHaveAttribute('disabled');
});

test('a custom close label replaces the joined name; asChild keeps the child as it is', () => {
  const custom = html(
    <Chip onRemove={() => {}}>
      react
      <Chip.Close aria-label="Remove react tag">x</Chip.Close>
    </Chip>,
  ).querySelector('[data-chip-close]')!;
  expect(custom.getAttribute('aria-label')).toBe('Remove react tag');
  expect(custom.hasAttribute('aria-labelledby')).toBe(false);
  expect(custom.textContent).toBe('x');
  const link = html(
    <Chip asChild>
      <a href="/tags/react">react</a>
    </Chip>,
  ).querySelector('a')!;
  expect(link.hasAttribute('data-chip')).toBe(true);
  expect(link.hasAttribute('role')).toBe(false);
  expect(link.textContent).toBe('react');
});

test('className takes the chip state', () => {
  const root = html(
    <Chip defaultSelected className={(state) => (state.selected ? 'on' : 'off')}>
      x
    </Chip>,
  ).querySelector('[data-chip]')!;
  expect(root.classList.contains('on')).toBe(true);
});

test('parts outside Chip throw', () => {
  expect(() => renderToString(<Chip.Close />)).toThrow(/inside `<Chip>`/);
});
