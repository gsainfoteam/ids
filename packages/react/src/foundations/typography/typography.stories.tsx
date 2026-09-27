import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Typography',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Written out in full so Tailwind sees every class; a name assembled at runtime is never generated.
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

const subtitle = {
  s1: {
    bold: cn('text-subtitle-s1-bold'),
    semibold: cn('text-subtitle-s1-semibold'),
    medium: cn('text-subtitle-s1-medium'),
  },
  s2: {
    bold: cn('text-subtitle-s2-bold'),
    semibold: cn('text-subtitle-s2-semibold'),
    medium: cn('text-subtitle-s2-medium'),
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

const button = {
  standard: { medium: cn('text-button-standard') },
  tiny: { medium: cn('text-button-tiny') },
};

const px = (value: string) => `${Math.round(parseFloat(value) * 10) / 10}`;

// The spec line is measured from the rendered text, so it can never drift from the tokens.
function measure(element: HTMLElement | null) {
  const sample = element?.querySelector<HTMLElement>('[data-sample]');
  const output = element?.querySelector('[data-spec]');
  if (!sample || !output) return;
  const style = getComputedStyle(sample);
  output.textContent = `${px(style.fontSize)}px · 행간 ${px(style.lineHeight)} · 자간 ${px(
    String(parseFloat(style.letterSpacing) || 0),
  )} · ${style.fontWeight}`;
}

function Specimen({ className, sample }: { className: string; sample: string }) {
  return (
    <div ref={measure} data-style={className} title={className} className="flex flex-col gap-1">
      <span data-sample="" className={cn(className, 'whitespace-nowrap')}>
        {sample}
      </span>
      <code data-spec="" className="text-caption-c1-regular text-(--ids-color-on-muted)" />
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
        description="text-headline-{h1~h6}-{굵기}. 자간 -2.5%, 행간 1.2. 페이지와 영역의 제목입니다."
      >
        <Scale styles={headline} sample="제목 Aa" />
      </Showcase.Section>
      <Showcase.Section
        title="Subtitle"
        description="text-subtitle-{s1, s2}-{굵기}. 행간 1.35. 카드와 목록의 제목입니다."
      >
        <Scale styles={subtitle} sample="최근 활동 Aa" />
      </Showcase.Section>
      <Showcase.Section
        title="Body"
        description="text-body-{b1~b3}-{굵기}. 작을수록 행간이 넓습니다. 컨트롤 안 글자는 b3입니다."
      >
        <Scale styles={body} sample="본문 가나다 Aa" />
      </Showcase.Section>
      <Showcase.Section
        title="Caption"
        description="text-caption-{c1, c2}-{굵기}. 행간 1.35. 설명, 힌트, 메타 정보입니다."
      >
        <Scale styles={caption} sample="3분 전 · 보조 Aa" />
      </Showcase.Section>
      <Showcase.Section
        title="Button"
        description="text-button-{standard, tiny}. 행간 1이라 컨트롤 안에서 세로 가운데에 맞습니다."
      >
        <Scale styles={button} sample="저장 Save" />
      </Showcase.Section>
    </Showcase>
  ),
  play: async ({ canvasElement }) => {
    const specimens = [...canvasElement.querySelectorAll<HTMLElement>('[data-style]')];
    await expect(specimens).toHaveLength(44);
    for (const specimen of specimens)
      await expect(specimen.querySelector('[data-spec]')?.textContent).toMatch(/^\d+(\.\d)?px/);
    const h1 = canvasElement.querySelector('[data-style="text-headline-h1-bold"] [data-sample]')!;
    await expect(getComputedStyle(h1).fontSize).toBe('48px');
    const b3 = canvasElement.querySelector('[data-style="text-body-b3-regular"] [data-sample]')!;
    await expect(getComputedStyle(b3).fontSize).toBe('14px');
  },
};
