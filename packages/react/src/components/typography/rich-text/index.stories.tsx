import { expect, within } from 'storybook/test';

import { Showcase } from '~story-kit';

import { RichText } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const POST = `# 2학기 수강 신청 안내

수강 신청은 **8월 12일 오전 10시**에 열립니다. 바뀐 규정은 [학사 일정](#calendar)에서 다시 확인하세요.

> [!IMPORTANT]
> 신청 전에 졸업 요건 점검표를 내야 합니다.

## 준비할 것

- [x] 졸업 요건 점검표 제출
- [ ] 희망 과목 장바구니에 담기
- [ ] 지도 교수 면담 예약

| 날짜 | 대상 |
| --- | --- |
| 8월 12일 | 4학년 |
| 8월 13일 | 3학년 이하 |

![기숙사 앞 호수](/lake.svg "기숙사 앞 호수")

:::details

:::detailsSummary

재수강 규정 펼쳐 보기

:::

:::detailsContent

재수강한 과목은 성적이 **A0** 를 넘지 않습니다.

:::

:::

\`\`\`ts
const opensAt = new Date('2026-08-12T10:00:00+09:00');
\`\`\`

질문은 [@ id="registrar" label="학사팀"] 에 남겨 주세요.
`;

const meta = {
  title: 'Typography/RichText',
  component: RichText,
  tags: ['autodocs'],
  argTypes: {
    format: { control: 'radio', options: ['markdown', 'json'] },
    size: { control: 'radio', options: ['standard', 'tiny'] },
    value: { control: 'text' },
  },
  args: { value: POST, format: 'markdown', size: 'standard' },
} satisfies Meta<typeof RichText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Text">
        <Showcase.Row label="headings">
          <RichText value={'# 제목 1\n\n## 제목 2\n\n### 제목 3\n\n#### 제목 4\n\n본문 문단'} />
        </Showcase.Row>
        <Showcase.Row label="marks">
          <RichText value={'**굵게**, _기울임_, ~~취소선~~, `코드`, ==형광펜==, [링크](#marks)'} />
        </Showcase.Row>
        <Showcase.Row label="lists">
          <RichText
            value={
              '- 하나\n- 둘\n  - 둘의 하나\n\n1. 첫째\n2. 둘째\n\n- [x] 끝난 일\n- [ ] 남은 일'
            }
          />
        </Showcase.Row>
        <Showcase.Row label="quote">
          <RichText value={'> 인용한 문단입니다.'} />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Callout"
        description="GitHub alert 문법(> [!NOTE])이 Alert 로 그려집니다."
      >
        <Showcase.Row label="note">
          <RichText value={'> [!NOTE]\n> 참고할 내용입니다.'} />
        </Showcase.Row>
        <Showcase.Row label="tip">
          <RichText value={'> [!TIP]\n> 도움이 되는 내용입니다.'} />
        </Showcase.Row>
        <Showcase.Row label="important">
          <RichText value={'> [!IMPORTANT]\n> 꼭 알아야 할 내용입니다.'} />
        </Showcase.Row>
        <Showcase.Row label="warning">
          <RichText value={'> [!WARNING]\n> 주의가 필요한 내용입니다.'} />
        </Showcase.Row>
        <Showcase.Row label="caution">
          <RichText value={'> [!CAUTION]\n> 되돌릴 수 없는 내용입니다.'} />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Blocks">
        <Showcase.Row label="code">
          <RichText value={'```ts\nconst greeting = "안녕하세요";\n```'} />
        </Showcase.Row>
        <Showcase.Row label="details">
          <RichText
            value={
              ':::details\n\n:::detailsSummary\n\n더 보기\n\n:::\n\n:::detailsContent\n\n접혀 있던 내용입니다.\n\n:::\n\n:::'
            }
          />
        </Showcase.Row>
        <Showcase.Row label="table">
          <RichText value={'| 이름 | 학번 |\n| --- | --- |\n| 김하늘 | 20261234 |'} />
        </Showcase.Row>
        <Showcase.Row label="image">
          <RichText value={'![기숙사 앞 호수](/lake.svg "기숙사 앞 호수")'} />
        </Showcase.Row>
        <Showcase.Row label="divider">
          <RichText value={'위 문단\n\n---\n\n아래 문단'} />
        </Showcase.Row>
        <Showcase.Row label="mention">
          <RichText value={'[@ id="registrar" label="학사팀"] 에 물어보세요.'} />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Size">
        <Showcase.Row label="standard">
          <RichText value={'## 제목\n\n본문 문단입니다.'} />
        </Showcase.Row>
        <Showcase.Row label="tiny">
          <RichText size="tiny" value={'## 제목\n\n본문 문단입니다.'} />
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const BlogPost: Story = {
  render: () => (
    <article className="max-w-2xl">
      <RichText value={POST} mentionHref={(id) => `#people/${id}`} />
    </article>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '저장해 둔 마크다운 글을 그대로 그립니다. Server Component 에서 그리면 Tiptap 은 서버에서만 돌고 브라우저로 가지 않습니다. 멘션은 mentionHref 가 있으면 링크가 됩니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { level: 1, name: '2학기 수강 신청 안내' }),
    ).toBeVisible();
    await expect(canvas.getByRole('note')).toHaveTextContent(/중요/);
    await expect(canvas.getByRole('table')).toBeVisible();
    await expect(canvas.getByRole('checkbox', { name: '졸업 요건 점검표 제출' })).toBeChecked();
    await expect(canvas.getByRole('link', { name: '@학사팀' })).toHaveAttribute(
      'href',
      '#people/registrar',
    );
  },
};

export const Json: Story = {
  render: () => (
    <RichText
      format="json"
      value={{
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Editor 의 JSON 값' }],
          },
          {
            type: 'callout',
            attrs: { kind: 'tip' },
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: 'format="json" 으로 저장한 값도 그대로 그립니다.' },
                ],
              },
            ],
          },
        ],
      }}
    />
  ),
};
