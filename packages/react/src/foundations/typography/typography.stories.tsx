import type { CSSProperties } from 'react';

import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import composites from '../../../../core/tokens/semantic/typography.json';
import primitives from '../../../../core/tokens/typography.json';
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Typography',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const headline = {
  h1: {
    bold: cn('text-headline-h1-bold'),
    semibold: cn('text-headline-h1-semibold'),
    medium: cn('text-headline-h1-medium'),
  },
  h2: {
    bold: cn('text-headline-h2-bold'),
    semibold: cn('text-headline-h2-semibold'),
    medium: cn('text-headline-h2-medium'),
  },
  h3: {
    bold: cn('text-headline-h3-bold'),
    semibold: cn('text-headline-h3-semibold'),
    medium: cn('text-headline-h3-medium'),
  },
  h4: {
    bold: cn('text-headline-h4-bold'),
    semibold: cn('text-headline-h4-semibold'),
    medium: cn('text-headline-h4-medium'),
  },
  h5: {
    bold: cn('text-headline-h5-bold'),
    semibold: cn('text-headline-h5-semibold'),
    medium: cn('text-headline-h5-medium'),
  },
  h6: {
    bold: cn('text-headline-h6-bold'),
    semibold: cn('text-headline-h6-semibold'),
    medium: cn('text-headline-h6-medium'),
  },
};

const body = {
  b1: {
    bold: cn('text-body-b1-bold'),
    semibold: cn('text-body-b1-semibold'),
    medium: cn('text-body-b1-medium'),
    regular: cn('text-body-b1-regular'),
  },
  b2: {
    bold: cn('text-body-b2-bold'),
    semibold: cn('text-body-b2-semibold'),
    medium: cn('text-body-b2-medium'),
    regular: cn('text-body-b2-regular'),
  },
  b3: {
    bold: cn('text-body-b3-bold'),
    semibold: cn('text-body-b3-semibold'),
    medium: cn('text-body-b3-medium'),
    regular: cn('text-body-b3-regular'),
  },
};

const caption = {
  c1: {
    semibold: cn('text-caption-c1-semibold'),
    medium: cn('text-caption-c1-medium'),
    regular: cn('text-caption-c1-regular'),
  },
  c2: {
    semibold: cn('text-caption-c2-semibold'),
    medium: cn('text-caption-c2-medium'),
    regular: cn('text-caption-c2-regular'),
  },
};

type TokenTree = { [key: string]: TokenTree | string | number | object };

const compositeNames = (node: TokenTree, path: string[] = []): string[] =>
  node.$type === 'typography'
    ? [path.join('-')]
    : Object.entries(node).flatMap(([key, child]) =>
        typeof child === 'object' && child !== null
          ? compositeNames(child as TokenTree, [...path, key])
          : [],
      );

const compositeClasses = compositeNames(composites.text).map((name) => `text-${name}`);

const primitiveTokens = Object.entries(primitives).flatMap(([category, tokens]) =>
  Object.keys(tokens).map((name) => ({ category, variable: `--ids-${category}-${name}` })),
);

const primitiveSample = (category: string, value: string): CSSProperties =>
  ({
    'font-size': { fontSize: value },
    'font-weight': { fontWeight: value },
    'line-height': { lineHeight: value },
    'letter-spacing': { letterSpacing: value },
    'font-family': { fontFamily: value },
    'font-size-adjust': { fontFamily: 'var(--ids-font-family-mono)', fontSizeAdjust: value },
  })[category] ?? {};

function readPrimitives(element: HTMLElement | null) {
  for (const row of element?.querySelectorAll<HTMLElement>('[data-primitive]') ?? []) {
    const output = row.querySelector('[data-resolved]');
    if (output)
      output.textContent = getComputedStyle(row).getPropertyValue(row.dataset.primitive!).trim();
  }
}

const px = (value: string) => `${Math.round(parseFloat(value) * 10) / 10}`;

function measure(element: HTMLElement | null) {
  const sample = element?.querySelector<HTMLElement>('[data-sample]');
  const output = element?.querySelector('[data-spec]');
  if (!sample || !output) return;
  const style = getComputedStyle(sample);
  output.textContent = `${px(style.fontSize)}px · 행간 ${px(style.lineHeight)}px · 자간 ${px(
    String(parseFloat(style.letterSpacing) || 0),
  )} · ${style.fontWeight}`;
}

function Specimen({ className, sample }: { className: string; sample: string }) {
  return (
    <div ref={measure} data-style={className} title={className} className="flex flex-col gap-1">
      <span data-sample="" className={cn(className, 'whitespace-nowrap')}>
        {sample}
      </span>
      <code data-spec="" className="text-caption-c1-regular text-neutral" />
    </div>
  );
}

function Scale<Level extends string, Weight extends string>({
  styles,
  sample,
}: {
  styles: Record<Level, Partial<Record<Weight, string>>>;
  sample: string;
}) {
  const levels = Object.keys(styles) as Level[];
  const weights = [...new Set(levels.flatMap((level) => Object.keys(styles[level])))] as Weight[];
  return (
    <Showcase.Matrix
      rows={levels}
      columns={weights}
      render={(level, weight) => {
        const className = styles[level][weight];
        return className === undefined ? null : <Specimen className={className} sample={sample} />;
      }}
    />
  );
}

export const Scales: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Headline"
        description="text-headline-{h1~h6}-{굵기}. 행간은 크기 + 8px. 자간은 h6 -1.5%, h3~h5 -2.5%, h1·h2 -3.5%. 페이지와 영역의 제목입니다."
      >
        <Scale styles={headline} sample="제목 Aa" />
      </Showcase.Section>
      <Showcase.Section
        title="Body"
        description="text-body-{b1~b3}-{굵기}. 행간 b1 28px, b2 24px, b3 20px. 컨트롤 안 글자는 b3, 카드와 목록의 제목은 b1·b2 semibold입니다."
      >
        <Scale styles={body} sample="본문 가나다 Aa" />
      </Showcase.Section>
      <Showcase.Section
        title="Caption"
        description="text-caption-{c1, c2}-{굵기}. 행간 c1 16px, c2 14px. 설명, 힌트, 메타 정보입니다."
      >
        <Scale styles={caption} sample="3분 전 · 보조 Aa" />
      </Showcase.Section>
    </Showcase>
  ),
  play: async ({ canvasElement }) => {
    const specimens = [...canvasElement.querySelectorAll<HTMLElement>('[data-style]')];
    await expect(specimens.map((specimen) => specimen.dataset.style).sort()).toEqual(
      [...compositeClasses].sort(),
    );
    for (const specimen of specimens) {
      await expect(specimen.querySelector('[data-spec]')?.textContent).toMatch(/^\d+(\.\d)?px/);
      const sample = specimen.querySelector<HTMLElement>('[data-sample]')!;
      await expect(Number.isInteger(parseFloat(getComputedStyle(sample).lineHeight))).toBe(true);
    }
    const h1 = canvasElement.querySelector('[data-style="text-headline-h1-bold"] [data-sample]')!;
    await expect(getComputedStyle(h1).fontSize).toBe('48px');
    const b3 = canvasElement.querySelector('[data-style="text-body-b3-regular"] [data-sample]')!;
    await expect(getComputedStyle(b3).fontSize).toBe('14px');
  },
};

export const Prose: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="긴 글"
        description="document-text 는 블록 사이를 20px, 제목 아래를 12px, 제목 위를 28~36px 띄우고 제목을 semibold로 h1 28px, h2 24px, h3 20px, h4 18px로 그립니다. 본문 크기는 text-body-b2-regular leading-prose(16px, 행간 28px)로 따로 줍니다."
      >
        <article className="document-text text-body-b2-regular leading-prose text-neutral-strong max-w-prose">
          <h1>2학기 수강 신청 안내</h1>
          <p data-prose="">
            수강 신청은 9월 1일 오전 10시에 열립니다. 신청 전에 졸업 요건과{' '}
            <strong>선수 과목</strong>을 확인하고, 장바구니에 담은 과목의 시간이 겹치지 않는지 살펴
            주세요.
          </p>
          <h2>변경 기간</h2>
          <ul>
            <li>정정 기간: 9월 8일부터 12일까지</li>
            <li>
              학점 상한은 신청 기간과 같습니다.
              <ul>
                <li>재수강 과목도 포함합니다.</li>
              </ul>
            </li>
          </ul>
          <h3>문의</h3>
          <blockquote>
            <p>
              자세한 내용은 <a href="https://gistory.me">학사 공지</a>를 보세요.
            </p>
          </blockquote>
        </article>
      </Showcase.Section>
    </Showcase>
  ),
  play: async ({ canvasElement }) => {
    const prose = canvasElement.querySelector<HTMLElement>('[data-prose]')!;
    const h1 = canvasElement.querySelector('article h1')!;

    await expect(getComputedStyle(prose).fontSize).toBe('16px');
    await expect(getComputedStyle(prose).lineHeight).toBe('28px');
    await expect(getComputedStyle(h1).fontSize).toBe('28px');
    await expect(getComputedStyle(h1).fontWeight).toBe('600');
  },
};

export const Primitives: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="원시값"
        description="typography.json 의 크기, 굵기, 행간, 자간, 글꼴입니다. 텍스트 스타일이 이 값을 묶어 쓰므로 직접 쓸 일은 드뭅니다. 오른쪽 값은 --ids-* 변수에서 읽은 것입니다."
      >
        <div ref={readPrimitives} className="flex flex-col gap-2">
          {primitiveTokens.map(({ category, variable }) => (
            <div
              key={variable}
              data-primitive={variable}
              className="grid grid-cols-[14rem_minmax(0,1fr)_6rem] items-center gap-4"
            >
              <code className="text-caption-c1-regular truncate font-mono">{variable}</code>
              <code
                data-resolved=""
                className="text-caption-c1-regular text-neutral truncate font-mono"
              />
              <span
                className="text-body-b3-regular whitespace-nowrap"
                style={primitiveSample(category, `var(${variable})`)}
              >
                가 Aa
              </span>
            </div>
          ))}
        </div>
      </Showcase.Section>
    </Showcase>
  ),
  play: async ({ canvasElement }) => {
    const rows = [...canvasElement.querySelectorAll<HTMLElement>('[data-primitive]')];

    await expect(rows).toHaveLength(primitiveTokens.length);
    for (const row of rows)
      await expect(row.querySelector('[data-resolved]')?.textContent).not.toBe('');
  },
};
