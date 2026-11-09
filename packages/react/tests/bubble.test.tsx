import { createRef, type ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

import { Bubble, Chip, IdsProvider } from '../src';

const LONG =
  '내일 오전 수업이 끝나면 학생회관 앞에서 만나서 같이 점심 먹고 도서관으로 가자. 자리는 내가 먼저 잡아 둘게.';

const html = (node: ReactNode) =>
  new DOMParser().parseFromString(renderToString(node), 'text/html');

const bubbles = (container: HTMLElement) => [
  ...container.querySelectorAll<HTMLElement>('[data-bubble]'),
];

const lineRects = (bubble: HTMLElement) => {
  const range = document.createRange();
  range.selectNodeContents(bubble.firstChild!);
  return [...range.getClientRects()].filter((rect) => rect.width > 0);
};

const TWO_LINES = 'Yo did you see the new Pretext library?';

const MANY_LINES =
  'Lunch moved to the student union today, so meet at the second floor entrance. Bring the printed notes from Tuesday, the lab report draft, and your student card because the library gate checks it after six. If you run late, text me and I will save a seat by the window.';

const EMOJI_KOREAN =
  '오늘 점심 같이 먹을래? 🍜 학생회관 앞에서 12시에 보자 😀 늦으면 먼저 들어가 있을게 👍';

const lines = (bubble: HTMLElement) => {
  const tops = new Map<number, number>();
  for (const rect of lineRects(bubble)) {
    const top = Math.round(rect.top);
    tops.set(top, Math.max(tops.get(top) ?? 0, rect.right) - 0);
  }
  return [...tops.values()];
};

const lineWidths = (bubble: HTMLElement) => {
  const left = contentBox(bubble).left;
  return lines(bubble).map((right) => right - left);
};

const endGap = (bubble: HTMLElement) => contentBox(bubble).right - Math.max(...lines(bubble));

const contentBox = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return {
    left: rect.left + parseFloat(style.paddingLeft),
    right: rect.right - parseFloat(style.paddingRight),
  };
};

test('SSR: a plain div with no fitted width, marked with its align and variant', () => {
  const doc = html(
    <Bubble align="end" variant="solid">
      Hello
    </Bubble>,
  );
  const root = doc.querySelector<HTMLElement>('[data-bubble]')!;
  expect(root.localName).toBe('div');
  expect(root.hasAttribute('role')).toBe(false);
  expect(root.dataset.align).toBe('end');
  expect(root.dataset.variant).toBe('solid');
  expect(root.hasAttribute('data-reactions')).toBe(false);
  expect(root.getAttribute('style')).toBeNull();
});

test('SSR: reactions as the last child overlap; anywhere else they stay in the flow', () => {
  const last = html(
    <Bubble>
      Hi
      <Bubble.Reactions>👍</Bubble.Reactions>
    </Bubble>,
  );
  expect(last.querySelector('[data-bubble]')!.hasAttribute('data-reactions')).toBe(true);
  expect(last.querySelector('[data-bubble-reactions]')!.hasAttribute('data-overlap')).toBe(true);

  const first = html(
    <Bubble>
      <Bubble.Reactions>👍</Bubble.Reactions>
      Hi
    </Bubble>,
  );
  expect(first.querySelector('[data-bubble]')!.hasAttribute('data-reactions')).toBe(false);
  expect(first.querySelector('[data-bubble-reactions]')!.hasAttribute('data-overlap')).toBe(false);

  const inFragment = html(
    <Bubble>
      <>
        Hi
        <Bubble.Reactions>👍</Bubble.Reactions>
      </>
    </Bubble>,
  );
  expect(inFragment.querySelector('[data-bubble-reactions]')!.hasAttribute('data-overlap')).toBe(
    true,
  );
});

test('align shapes only the tail corner and follows the writing direction', async () => {
  const screen = await render(
    <IdsProvider>
      <Bubble>start</Bubble>
      <Bubble align="end">end</Bubble>
      <div dir="rtl">
        <Bubble>rtl start</Bubble>
      </div>
    </IdsProvider>,
  );
  const [start, end, rtl] = bubbles(screen.container).map((bubble) => getComputedStyle(bubble));

  expect(start!.borderBottomLeftRadius).toBe('4px');
  expect(start!.borderBottomRightRadius).toBe('16px');
  expect(start!.borderTopLeftRadius).toBe('16px');
  expect(start!.borderTopRightRadius).toBe('16px');
  expect(end!.borderBottomRightRadius).toBe('4px');
  expect(end!.borderBottomLeftRadius).toBe('16px');
  expect(rtl!.borderBottomRightRadius).toBe('4px');
  expect(rtl!.borderBottomLeftRadius).toBe('16px');
});

test('align does not move the bubble', async () => {
  const screen = await render(
    <IdsProvider>
      <div className="w-80">
        <Bubble>start</Bubble>
        <Bubble align="end">end</Bubble>
      </div>
    </IdsProvider>,
  );
  const [start, end] = bubbles(screen.container);
  expect(end!.getBoundingClientRect().left).toBe(start!.getBoundingClientRect().left);
});

test('variants: soft is the muted fill, solid the brand fill, outline the neutral edge', async () => {
  const screen = await render(
    <IdsProvider>
      <Bubble variant="soft">soft</Bubble>
      <Bubble variant="solid">solid</Bubble>
      <Bubble variant="outline">outline</Bubble>
    </IdsProvider>,
  );
  const [soft, solid, outline] = bubbles(screen.container);
  const token = (name: string) => {
    const probe = document.createElement('div');
    probe.style.color = `var(${name})`;
    screen.container.querySelector('[data-mode]')!.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  };

  expect(getComputedStyle(soft!).backgroundColor).toBe(token('--ids-color-muted'));
  expect(getComputedStyle(soft!).color).toBe(token('--ids-color-on-surface'));
  expect(getComputedStyle(solid!).backgroundColor).toBe(token('--ids-color-primary'));
  expect(getComputedStyle(solid!).color).toBe(token('--ids-color-on-primary'));
  expect(getComputedStyle(outline!).backgroundColor).toBe(token('--ids-color-surface'));
  expect(getComputedStyle(outline!).boxShadow).toContain(token('--ids-color-border'));
});

test('one line keeps its own width; wrapped lines shrink the box to the longest line', async () => {
  const screen = await render(
    <IdsProvider>
      <div data-testid="column" className="flex w-80 flex-col items-start break-keep">
        <Bubble>Hi</Bubble>
        <Bubble>{LONG}</Bubble>
      </div>
    </IdsProvider>,
  );
  const column = screen.getByTestId('column').element() as HTMLElement;
  const [short, long] = bubbles(screen.container);

  expect(short!.style.getPropertyValue('--bubble-fit-width')).toBe('');
  expect(lineRects(short!)).toHaveLength(1);

  const lines = lineRects(long!);
  const box = contentBox(long!);
  expect(lines.length).toBeGreaterThan(1);
  expect(long!.style.getPropertyValue('--bubble-fit-width')).not.toBe('');
  expect(long!.getBoundingClientRect().width).toBeLessThan(column.clientWidth * 0.8 - 1);
  const longestRight = Math.max(...lines.map((line) => line.right));
  expect(longestRight).toBeLessThanOrEqual(box.right + 0.5);
  expect(box.right - longestRight).toBeLessThan(1);
});

test('shrinking keeps every line where it broke', async () => {
  const screen = await render(
    <IdsProvider>
      <div className="flex w-80 flex-col items-start break-keep">
        <Bubble>{LONG}</Bubble>
      </div>
    </IdsProvider>,
  );
  const [bubble] = bubbles(screen.container);
  const fitted = lineRects(bubble!).length;
  bubble!.style.removeProperty('--bubble-fit-width');
  const natural = lineRects(bubble!).length;
  expect(fitted).toBe(natural);
});

test('two lines wrap evenly and the box ends at the longer one', async () => {
  const screen = await render(
    <IdsProvider>
      <div className="flex w-80 flex-col items-start">
        <Bubble>{TWO_LINES}</Bubble>
      </div>
    </IdsProvider>,
  );
  const [bubble] = bubbles(screen.container);
  const balanced = lineWidths(bubble!);
  expect(balanced).toHaveLength(2);
  expect(Math.min(...balanced) / Math.max(...balanced)).toBeGreaterThan(0.75);
  expect(endGap(bubble!)).toBeLessThanOrEqual(1);
  const fitted = bubble!.getBoundingClientRect().width;

  bubble!.style.textWrap = 'wrap';
  bubble!.style.setProperty('--bubble-fit-width', 'fit-content');
  const greedy = lineWidths(bubble!);
  expect(greedy).toHaveLength(2);
  expect(Math.max(...greedy)).toBeGreaterThan(Math.max(...balanced) + 20);
  expect(fitted).toBeLessThan(bubble!.getBoundingClientRect().width - 20);
});

test('past the lines a browser balances, the box still ends at the longest line', async () => {
  const screen = await render(
    <IdsProvider>
      <div className="flex w-80 flex-col items-start">
        <Bubble>{MANY_LINES}</Bubble>
      </div>
    </IdsProvider>,
  );
  const [bubble] = bubbles(screen.container);
  expect(lines(bubble!).length).toBeGreaterThanOrEqual(7);
  expect(endGap(bubble!)).toBeLessThanOrEqual(1);
  expect(bubble!.getBoundingClientRect().width).toBeLessThanOrEqual(320 * 0.8);
});

test('Korean kept by word with emoji wraps evenly and fits', async () => {
  const screen = await render(
    <IdsProvider>
      <div className="flex w-80 flex-col items-start break-keep">
        <Bubble>{EMOJI_KOREAN}</Bubble>
      </div>
    </IdsProvider>,
  );
  const [bubble] = bubbles(screen.container);
  expect(lines(bubble!).length).toBeGreaterThanOrEqual(2);
  expect(endGap(bubble!)).toBeLessThanOrEqual(1);
  expect(bubble!.style.getPropertyValue('--bubble-fit-width')).not.toBe('');
});

test('many bubbles mounted together are all fitted, and a column resize refits each', async () => {
  const screen = await render(
    <IdsProvider>
      <div data-testid="column" className="flex w-80 flex-col items-start gap-2">
        {Array.from({ length: 30 }, (_, index) => (
          <Bubble key={index}>{TWO_LINES}</Bubble>
        ))}
      </div>
    </IdsProvider>,
  );
  const all = bubbles(screen.container);
  for (const bubble of all) expect(endGap(bubble)).toBeLessThanOrEqual(1);

  const column = screen.getByTestId('column').element() as HTMLElement;
  column.style.width = '200px';
  await expect.poll(() => Math.max(...all.map(endGap))).toBeLessThanOrEqual(1);
  for (const bubble of all) {
    expect(bubble.getBoundingClientRect().width).toBeLessThanOrEqual(200 * 0.8);
  }
});

test('the fit follows new content and a new column width', async () => {
  const screen = await render(
    <IdsProvider>
      <div data-testid="column" className="flex w-80 flex-col items-start break-keep">
        <Bubble>Hi</Bubble>
      </div>
    </IdsProvider>,
  );
  const column = screen.getByTestId('column').element() as HTMLElement;
  const [bubble] = bubbles(screen.container);
  expect(bubble!.style.getPropertyValue('--bubble-fit-width')).toBe('');

  bubble!.firstChild!.textContent = LONG;
  await expect.poll(() => bubble!.style.getPropertyValue('--bubble-fit-width')).not.toBe('');
  const narrow = bubble!.getBoundingClientRect().width;

  column.style.width = '600px';
  await expect.poll(() => bubble!.getBoundingClientRect().width).toBeGreaterThan(narrow);
  expect(bubble!.getBoundingClientRect().width).toBeLessThanOrEqual(600 * 0.8);
});

test('--bubble-max-width set on an ancestor caps the box', async () => {
  const screen = await render(
    <IdsProvider>
      <div className="flex w-80 flex-col items-start break-keep [--bubble-max-width:50%]">
        <Bubble>{LONG}</Bubble>
      </div>
    </IdsProvider>,
  );
  const [bubble] = bubbles(screen.container);
  expect(bubble!.getBoundingClientRect().width).toBeLessThanOrEqual(160);
});

test('overlapping reactions sit on the bottom corner away from the tail and leave room below', async () => {
  const screen = await render(
    <IdsProvider>
      <div className="flex w-80 flex-col items-start break-keep">
        <Bubble>
          Lunch menu?
          <Bubble.Reactions>
            <Chip size="tiny">👍 2</Chip>
          </Bubble.Reactions>
        </Bubble>
      </div>
      <div className="flex w-80 flex-col items-end">
        <Bubble align="end">
          Thanks!
          <Bubble.Reactions>
            <Chip size="tiny">❤️ 1</Chip>
          </Bubble.Reactions>
        </Bubble>
      </div>
    </IdsProvider>,
  );
  const [start, end] = bubbles(screen.container);
  const reactionsOf = (bubble: HTMLElement) =>
    bubble.querySelector<HTMLElement>('[data-bubble-reactions]')!.getBoundingClientRect();

  for (const bubble of [start!, end!]) {
    const box = bubble.getBoundingClientRect();
    const reactions = reactionsOf(bubble);
    expect(box.bottom - reactions.top).toBeCloseTo(6, 0);
    expect(reactions.bottom).toBeGreaterThan(box.bottom);
    expect(parseFloat(getComputedStyle(bubble).marginBottom)).toBe(16);
  }
  expect(start!.getBoundingClientRect().right - reactionsOf(start!).right).toBeCloseTo(12, 0);
  expect(reactionsOf(end!).left - end!.getBoundingClientRect().left).toBeCloseTo(12, 0);
});

test('overlapping reactions do not widen the fitted box', async () => {
  const screen = await render(
    <IdsProvider>
      <div className="flex w-80 flex-col items-start break-keep">
        <Bubble>
          Hi
          <Bubble.Reactions>
            <Chip size="tiny">👍 a very long reaction label</Chip>
          </Bubble.Reactions>
        </Bubble>
        <Bubble>Hi</Bubble>
      </div>
    </IdsProvider>,
  );
  const [withReactions, plain] = bubbles(screen.container);
  expect(withReactions!.getBoundingClientRect().width).toBe(plain!.getBoundingClientRect().width);
});

test('reactions are a group named by the catalog, and the name can be replaced', async () => {
  const screen = await render(
    <IdsProvider>
      <Bubble>
        Hi
        <Bubble.Reactions>👍</Bubble.Reactions>
      </Bubble>
      <Bubble>
        Hi
        <Bubble.Reactions aria-label="Votes">👍</Bubble.Reactions>
      </Bubble>
    </IdsProvider>,
  );
  await expect.element(screen.getByRole('group', { name: '반응' })).toBeVisible();
  await expect.element(screen.getByRole('group', { name: 'Votes' })).toBeVisible();
});

test('asChild renders the child element, keeps the ref and still places trailing reactions', async () => {
  const ref = createRef<HTMLDivElement>();
  const screen = await render(
    <IdsProvider>
      <ol>
        <Bubble asChild ref={ref}>
          <li>
            Hi
            <Bubble.Reactions>👍</Bubble.Reactions>
          </li>
        </Bubble>
      </ol>
    </IdsProvider>,
  );
  const [bubble] = bubbles(screen.container);
  expect(bubble!.localName).toBe('li');
  expect(ref.current).toBe(bubble);
  expect(bubble!.hasAttribute('data-reactions')).toBe(true);
  expect(bubble!.querySelector('[data-bubble-reactions]')!.hasAttribute('data-overlap')).toBe(true);
});

test('Bubble.Reactions outside a Bubble throws', async () => {
  expect(() => renderToString(<Bubble.Reactions>👍</Bubble.Reactions>)).toThrow(
    '`<Bubble.Reactions>` must be used inside `<Bubble>`.',
  );
});
