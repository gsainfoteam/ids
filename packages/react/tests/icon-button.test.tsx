import { forwardRef, memo, type ComponentProps } from 'react';

import { ChevronDownIcon, PlusIcon, Squares2X2Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

import { ButtonGroup, IconButton } from '../src';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const labelOf = (props: IconButton.Props) =>
  parse(renderToString(<IconButton {...props} />))
    .querySelector('button')!
    .getAttribute('aria-label');

test('without aria-label the name comes from the icon component', () => {
  expect(labelOf({ icon: <PlusIcon /> })).toBe('Plus');
  expect(labelOf({ icon: <ChevronDownIcon /> })).toBe('Chevron down');
  expect(labelOf({ icon: <XMarkIcon /> })).toBe('X mark');
  expect(labelOf({ icon: <Squares2X2Icon /> })).toBe('Squares 2 x 2');
});

test('an explicit name wins; the icon title or aria-label comes before the component name', () => {
  expect(labelOf({ icon: <PlusIcon />, 'aria-label': '새 항목' })).toBe('새 항목');
  expect(labelOf({ icon: <PlusIcon title="추가" /> })).toBe('추가');
  expect(labelOf({ icon: <PlusIcon aria-label="더하기" /> })).toBe('더하기');
  expect(labelOf({ icon: <PlusIcon />, 'aria-labelledby': 'heading' })).toBeNull();
  expect(labelOf({ icon: <PlusIcon />, title: '툴팁' })).toBeNull();
});

test('a displayName is used through memo and forwardRef; a minified name is not', () => {
  const Star = forwardRef<SVGSVGElement, ComponentProps<'svg'>>(function jt(props, ref) {
    return <svg {...props} ref={ref} />;
  });
  expect(labelOf({ icon: <Star /> })).toBeNull();
  Star.displayName = 'StarIcon';
  const MemoStar = memo(Star);
  expect(labelOf({ icon: <MemoStar /> })).toBe('Star');
  const Lucide = (props: ComponentProps<'svg'>) => <svg {...props} />;
  Lucide.displayName = 'ArrowUpRight';
  expect(labelOf({ icon: <Lucide /> })).toBe('Arrow up right');
  const Tabler = (props: ComponentProps<'svg'>) => <svg {...props} />;
  Tabler.displayName = 'IconSettings';
  expect(labelOf({ icon: <Tabler /> })).toBe('Settings');
});

test('the square carries the icon, a ghost variant and the group size', async () => {
  const screen = await render(
    <ButtonGroup size="tiny">
      <IconButton icon={<PlusIcon />} />
      <IconButton size="standard" variant="outline" icon={<PlusIcon />} />
    </ButtonGroup>,
  );
  const [inherit, own] = screen.getByRole('button', { name: 'Plus' }).all();
  await expect.element(inherit).toHaveAttribute('type', 'button');
  await expect.element(inherit).toHaveAttribute('data-variant', 'ghost');
  await expect.element(inherit).toHaveAttribute('data-size', 'tiny');
  expect(inherit.element().querySelector('svg')).not.toBeNull();
  await expect.element(own).toHaveAttribute('data-size', 'standard');
});

test('asChild draws a link as the square; the link keeps its own name', async () => {
  const screen = await render(
    <div>
      <IconButton asChild icon={<PlusIcon />}>
        <a href="#new" />
      </IconButton>
      <IconButton asChild>
        <a href="#docs" aria-label="문서">
          <XMarkIcon />
        </a>
      </IconButton>
    </div>,
  );
  const derived = screen.getByRole('link', { name: 'Plus' });
  await expect.element(derived).toHaveAttribute('aria-label', 'Plus');
  expect(derived.element().querySelector('svg')).not.toBeNull();
  const own = screen.getByRole('link', { name: '문서' });
  await expect.element(own).toHaveAttribute('aria-label', '문서');
  await expect.element(own).toHaveAttribute('href', '#docs');
});

test('children and a missing icon are rejected', () => {
  expect(() =>
    renderToString(
      // @ts-expect-error The icon goes through the icon prop, not children.
      <IconButton icon={<PlusIcon />}>x</IconButton>,
    ),
  ).toThrow(/icon` prop, not/);
  // @ts-expect-error The icon prop is required.
  expect(() => renderToString(<IconButton />)).toThrow(/`icon` prop is required/);
});
