import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';

import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

const concentric = {
  1: 'concentric-p-1',
  1.5: 'concentric-p-1.5',
  2: 'concentric-p-2',
  3: 'concentric-p-3',
  4: 'concentric-p-4',
  6: 'concentric-p-6',
};

type BoxProps = { pad: keyof typeof concentric; radius: number; children?: ReactNode };

function Popover({ pad, radius, children }: BoxProps) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => ref.current?.showPopover(), []);
  return (
    <div ref={ref} popover="manual" data-radius={radius} className={concentric[pad]}>
      {children}
    </div>
  );
}

function Box({ pad, radius, children }: BoxProps) {
  return (
    <div data-radius={radius} className={concentric[pad]}>
      {children}
    </div>
  );
}

const withoutTheContainerCap = { '--ids-radius-container': '999px' } as CSSProperties;

async function expectRadii(ui: ReactNode) {
  const { container } = await render(<div style={withoutTheContainerCap}>{ui}</div>);
  const boxes = [...container.querySelectorAll<HTMLElement>('[data-radius]')];
  expect(boxes.length).toBeGreaterThan(0);
  const radii = boxes.map((box) => getComputedStyle(box).borderTopLeftRadius);
  expect(radii).toEqual(boxes.map((box) => `${box.dataset.radius}px`));
}

test('the thickest nesting wins over a longer chain of thinner padding', async () => {
  await expectRadii(
    <Box pad={4} radius={50}>
      <Box pad={6} radius={34} />
      <Box pad={1} radius={20}>
        <Box pad={1.5} radius={16} />
      </Box>
    </Box>,
  );
});

test('a popover rendered inside a container does not grow its corner', async () => {
  await expectRadii(
    <Box pad={4} radius={26}>
      <Popover pad={2} radius={18} />
    </Box>,
  );
});

test('containers inside a popover still grow with what they hold', async () => {
  await expectRadii(
    <Popover pad={6} radius={50}>
      <Box pad={4} radius={26} />
    </Popover>,
  );
});

test('two levels inside a popover add up the same as outside one', async () => {
  await expectRadii(
    <Popover pad={6} radius={58}>
      <Box pad={4} radius={34}>
        <Box pad={2} radius={18} />
      </Box>
    </Popover>,
  );
});

test('a popover inside a popover is not nested in it', async () => {
  await expectRadii(
    <Popover pad={6} radius={34}>
      <Popover pad={3} radius={22} />
    </Popover>,
  );
});

test('a container inside a popover inside a popover still grows', async () => {
  await expectRadii(
    <Popover pad={6} radius={34}>
      <Popover pad={4} radius={38}>
        <Box pad={3} radius={22} />
      </Popover>
    </Popover>,
  );
});

test('an open popover does not hide a nested container of the same padding', async () => {
  await expectRadii(
    <Box pad={4} radius={38}>
      <Box pad={3} radius={22} />
      <Popover pad={3} radius={22} />
    </Box>,
  );
});

test('the corner stops at the container radius however deep it grows', async () => {
  const { container } = await render(
    <Box pad={4} radius={16}>
      <Box pad={6} radius={16} />
      <Box pad={1} radius={14} />
    </Box>,
  );
  const radii = [...container.querySelectorAll<HTMLElement>('[data-radius]')].map((box) => [
    getComputedStyle(box).borderTopLeftRadius,
    `${box.dataset.radius}px`,
  ]);
  for (const [actual, expected] of radii) expect(actual).toBe(expected);
});
