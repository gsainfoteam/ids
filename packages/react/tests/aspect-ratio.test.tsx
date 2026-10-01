import type { ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';

import { AspectRatio } from '../src';

const box = (node: ReactNode) =>
  new DOMParser()
    .parseFromString(renderToString(node), 'text/html')
    .querySelector<HTMLElement>('[data-aspect-ratio]')!;

test('the box carries the ratio and the content sits in an absolute layer', () => {
  const frame = box(
    <AspectRatio ratio={16 / 9} id="frame">
      <img alt="" />
    </AspectRatio>,
  );
  expect(frame.id).toBe('frame');
  expect(frame.getAttribute('style')).toMatch(/aspect-ratio:\s*1\.77/);
  expect(frame.className).toMatch(/relative w-full/);
  const layer = frame.firstElementChild!;
  expect(layer.className).toMatch(/absolute inset-0/);
  expect(layer.querySelector('img')).not.toBeNull();
});

test('children fill and media crops, both at zero specificity', () => {
  const layer = box(
    <AspectRatio>
      <div />
    </AspectRatio>,
  ).firstElementChild!;
  expect(layer.className).toMatch(/\[:where\(&>\*\)\]:size-full/);
  expect(layer.className).toMatch(/\[:where\(&>img,&>video\)\]:object-cover/);
});

test('the ratio defaults to a square and must be a finite positive number', () => {
  expect(box(<AspectRatio />).getAttribute('style')).toMatch(/aspect-ratio:\s*1\b/);
  for (const ratio of [0, -1, Infinity, NaN])
    expect(() => renderToString(<AspectRatio ratio={ratio} />)).toThrow(/finite positive number/);
});

test('className and style may read the state, and style wins', () => {
  const frame = box(
    <AspectRatio
      ratio={2}
      className={(state) => `ratio-${state.ratio}`}
      style={() => ({ aspectRatio: '3' })}
    />,
  );
  expect(frame.className).toMatch(/ratio-2/);
  expect(frame.getAttribute('style')).toMatch(/aspect-ratio:\s*3/);
});
