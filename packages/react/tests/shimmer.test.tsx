import { expect, onTestFinished, test } from 'vitest';
import { cdp } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { IdsProvider } from '../src';
import { skipWithoutCdp } from './engines';

async function preferMotion(value: 'reduce' | 'no-preference') {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value }],
  });
}

async function withMotion() {
  await preferMotion('no-preference');
  onTestFinished(() => preferMotion('reduce'));
}

const shimmerOf = async (dir: 'ltr' | 'rtl' = 'ltr') => {
  const screen = await render(
    <IdsProvider>
      <p dir={dir} className="shimmer text-(--ids-color-on-muted)" data-testid="line">
        <svg aria-hidden="true" width="16" height="16" data-testid="icon">
          <circle cx="8" cy="8" r="6" fill="currentColor" />
        </svg>
        생각하는 중
      </p>
    </IdsProvider>,
  );
  return {
    line: getComputedStyle(screen.getByTestId('line').element()),
    icon: getComputedStyle(screen.getByTestId('icon').element()),
  };
};

test('the band sweeps across the glyphs and leaves currentColor to the icons', async (context) => {
  skipWithoutCdp(context);
  await withMotion();
  const { line, icon } = await shimmerOf();
  expect(line.animationName).toBe('ids-shimmer');
  expect(line.animationIterationCount).toBe('infinite');
  expect(line.animationDirection).toBe('normal');
  expect(line.backgroundClip).toBe('text');
  expect(line.backgroundImage).toMatch(/^linear-gradient/);
  expect(line.webkitTextFillColor).toBe('rgba(0, 0, 0, 0)');
  expect(icon.color, 'icons keep painting with the text color').toBe(line.color);
});

test('right-to-left text sweeps the other way', async (context) => {
  skipWithoutCdp(context);
  await withMotion();
  const { line } = await shimmerOf('rtl');
  expect(line.animationDirection).toBe('reverse');
});

test('with reduced motion the text is plain', async () => {
  const { line } = await shimmerOf();
  expect(line.animationName).toBe('none');
  expect(line.backgroundImage).toBe('none');
  expect(line.webkitTextFillColor).toBe(line.color);
});
