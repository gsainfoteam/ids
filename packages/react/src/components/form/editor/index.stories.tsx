import { useState } from 'react';

import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { cn } from '../../../utils';
import { Button } from '../../action/button';
import { Field } from '../field';

import { Editor } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft'] as const;
const sizes = ['standard', 'tiny'] as const;

const NOTICE =
  '<h2>동아리 박람회</h2><p>3월 12일 학생회관 앞에서 <strong>동아리 박람회</strong>가 열립니다. 자세한 일정은 <a href="https://gistory.me">공지</a>를 보세요.</p><ul><li>부스 신청: 3월 5일까지</li><li>장소 배정: 3월 8일</li></ul>';

const DOCUMENT = `# 동아리 박람회 안내

3월 12일 학생회관 앞에서 **동아리 박람회**가 열립니다. 부스는 *선착순*으로 배정하고, ~~3월 10일~~ 3월 5일까지 신청을 받습니다. 신청서 양식은 \`booth-form.pdf\` 이고 자세한 일정은 [공지](https://gistory.me)를 보세요.

부스마다 테이블 두 개와 의자 네 개를 드립니다. 전기가 필요한 동아리는 신청서에 적어 주세요.

## 일정

- 부스 신청: 3월 5일까지
- 장소 배정: 3월 8일
  - 1차: 학생회관 앞
  - 2차: 잔디광장
- 박람회: 3월 12일 오전 10시부터

### 준비물

1. 동아리 소개 포스터
2. 신입 회원 신청서
3. 연락처를 적을 태블릿이나 종이

#### 참고

> 작년에는 40개 동아리가 참가했습니다.
>
> 올해는 부스를 50개로 늘렸습니다.

\`\`\`
const booth = { size: '2m × 2m', power: true };
\`\`\`

---

문의는 동아리연합회로 해 주세요.`;

const meta = {
  title: 'Form/Editor',
  component: Editor,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    variant: 'outline',
    size: 'standard',
    'aria-label': '본문',
    defaultValue: NOTICE,
    className: cn('w-[36rem] max-w-full'),
    onValueChange: fn(),
  },
} satisfies Meta<typeof Editor>;

export default meta;
type Story = StoryObj<typeof meta>;

type Canvas = { getByRole: (role: 'textbox', options: { name: string }) => HTMLElement };

async function editableContent(canvas: Canvas, name: string) {
  await waitFor(() =>
    expect(canvas.getByRole('textbox', { name })).toHaveAttribute('contenteditable', 'true'),
  );
  return canvas.getByRole('textbox', { name });
}

function textNodeWith(root: HTMLElement, text: string) {
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode())
    if (node.textContent?.includes(text)) return node as Text;
  throw new Error(`No text node holds "${text}".`);
}

function selectText(root: HTMLElement, text: string, { caretAfter = false } = {}) {
  const node = textNodeWith(root, text);
  const end = node.data.indexOf(text) + text.length;
  const range = root.ownerDocument.createRange();
  range.setStart(node, caretAfter ? end : end - text.length);
  range.setEnd(node, end);
  const selection = root.ownerDocument.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
}

const modifierKey = () => (/Mac|iP(hone|[oa]d)/.test(navigator.platform) ? 'Meta' : 'Control');

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <Editor
              size={size}
              variant={variant}
              aria-label={`${variant} ${size}`}
              defaultValue="<p>가을 축제 <strong>부스</strong>를 모집합니다.</p>"
              className="w-96"
            >
              <Editor.Bold />
              <Editor.Italic />
              <Editor.Strike />
              <Editor.Separator />
              <Editor.Link />
              <Editor.Content />
            </Editor>
          )}
        />
      </Showcase.Section>

      <Showcase.Section
        title="Toolbar"
        description="자식이 없으면 기본 툴바가 붙습니다. Content 앞의 파트는 위 툴바, 뒤의 파트는 아래 바가 됩니다."
      >
        <Showcase.Row label="default">
          <Editor aria-label="기본 툴바" defaultValue={NOTICE} className="w-[36rem]" />
        </Showcase.Row>
        <Showcase.Row label="custom">
          <Editor aria-label="고른 툴바" maxLength={200} className="w-[36rem]">
            <Editor.BlockType levels={[2, 3, 4]} />
            <Editor.Separator />
            <Editor.Bold />
            <Editor.Italic />
            <Editor.Underline />
            <Editor.Code />
            <Editor.Content placeholder="200자까지 쓸 수 있습니다" />
            <Editor.Count />
          </Editor>
        </Showcase.Row>
        <Showcase.Row label="content only">
          <Editor aria-label="본문만" className="w-[36rem]">
            <Editor.Content placeholder="툴바 없이 단축키로 서식을 넣습니다" />
            <Editor.BubbleMenu />
          </Editor>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="placeholder">
          <Editor aria-label="비어 있음" className="w-96">
            <Editor.Bold />
            <Editor.Italic />
            <Editor.Content placeholder="내용을 입력하세요" />
          </Editor>
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <Editor aria-label="비활성" disabled defaultValue={NOTICE} className="w-96" />
        </Showcase.Row>
        <Showcase.Row label="readOnly">
          <Editor aria-label="읽기 전용" readOnly defaultValue={NOTICE} className="w-96" />
        </Showcase.Row>
        <Showcase.Row label="invalid">
          <Editor aria-label="오류" invalid className="w-96">
            <Editor.Bold />
            <Editor.Italic />
            <Editor.Content placeholder="본문을 입력하세요" />
          </Editor>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Typing: Story = {
  args: { defaultValue: undefined, 'aria-label': '메모' },
  render: (args) => (
    <Editor {...args}>
      <Editor.Bold />
      <Editor.Italic />
      <Editor.Content placeholder="메모를 남기세요" />
    </Editor>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '입력하면 onValueChange 가 HTML 문자열로 불립니다. 빈 문서는 빈 문자열입니다. 서버 HTML 에는 같은 테두리와 툴바가 들어가고, 편집 엔진은 브라우저에서 붙습니다.',
      },
    },
  },
  play: async ({ args, canvas, userEvent }) => {
    const content = await editableContent(canvas, '메모');
    await expect(content).toHaveAttribute('aria-placeholder', '메모를 남기세요');
    await userEvent.click(content);
    await userEvent.keyboard('안녕하세요');
    await waitFor(() => expect(args.onValueChange).toHaveBeenLastCalledWith('<p>안녕하세요</p>'));
  },
};

export const BoldShortcut: Story = {
  args: { defaultValue: '<p>굵게 만들 글</p>', 'aria-label': '단축키' },
  render: (args) => (
    <Editor {...args}>
      <Editor.Bold />
      <Editor.Italic />
      <Editor.Content />
    </Editor>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '⌘B(Windows 는 Ctrl+B)로 굵게, ⌘I 로 기울임을 넣습니다. 툴바의 토글은 커서 자리의 서식을 따라 켜지고 꺼집니다.',
      },
    },
  },
  play: async ({ args, canvas, userEvent }) => {
    const content = await editableContent(canvas, '단축키');
    await userEvent.click(content);
    const mod = modifierKey();
    await userEvent.keyboard(`{${mod}>}a{/${mod}}`);
    await userEvent.keyboard(`{${mod}>}b{/${mod}}`);
    await waitFor(() =>
      expect(args.onValueChange).toHaveBeenLastCalledWith('<p><strong>굵게 만들 글</strong></p>'),
    );
    await expect(canvas.getByRole('button', { name: '굵게' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
};

export const Link: Story = {
  args: {
    defaultValue: '<p>자세한 일정은 안내 페이지에서 확인하세요.</p>',
    'aria-label': '링크 본문',
  },
  render: (args) => (
    <Editor {...args}>
      <Editor.Bold />
      <Editor.Link />
      <Editor.Content />
    </Editor>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Editor.Link 는 고른 글에 링크를 겁니다. 주소 칸에서 Enter 나 적용을 누르면 걸리고, 이미 링크 안이면 링크 지우기가 보입니다. 고른 글이 없으면 주소를 링크로 넣습니다. 프로토콜이 없으면 https:// 를 붙입니다.',
      },
    },
  },
  play: async ({ args, canvas, userEvent }) => {
    const content = await editableContent(canvas, '링크 본문');
    await userEvent.click(content);
    selectText(content, '안내 페이지');
    await userEvent.click(canvas.getByRole('button', { name: '링크' }));
    const url = await waitFor(() => canvas.getByRole('textbox', { name: '링크 주소' }));
    await waitFor(() => expect(url).toHaveFocus());
    await userEvent.type(url, 'gistory.me{Enter}');
    await waitFor(() =>
      expect(args.onValueChange).toHaveBeenLastCalledWith(
        '<p>자세한 일정은 <a target="_blank" rel="noopener noreferrer nofollow" href="https://gistory.me">안내 페이지</a>에서 확인하세요.</p>',
      ),
    );
  },
};

export const Formats: Story = {
  render: function Render() {
    const [markdown, setMarkdown] = useState(
      '## 회의록\n\n- **안건**: 축제 부스\n- 결정: 다음 주에',
    );
    const [json, setJson] = useState<Editor.Json>({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'JSON 으로 저장합니다' }] }],
    });

    return (
      <div className="grid w-full max-w-3xl gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Editor
            format="markdown"
            aria-label="마크다운"
            value={markdown}
            onValueChange={setMarkdown}
          />
          <pre
            data-testid="markdown"
            className="text-caption-c1-regular font-mono whitespace-pre-wrap"
          >
            {markdown}
          </pre>
        </div>
        <div className="flex flex-col gap-2">
          <Editor format="json" aria-label="JSON" value={json} onValueChange={setJson}>
            <Editor.Bold />
            <Editor.Italic />
            <Editor.Content />
          </Editor>
          <pre data-testid="json" className="text-caption-c1-regular font-mono whitespace-pre-wrap">
            {JSON.stringify(json)}
          </pre>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'format 은 html(기본), markdown, json 입니다. markdown 은 Tiptap 의 공식 @tiptap/markdown 으로 읽고 씁니다. json 은 ProseMirror 문서 객체를 그대로 주고받습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const markdown = await editableContent(canvas, '마크다운');
    await expect(markdown.querySelector('h2')).toHaveTextContent('회의록');
    await expect(markdown.querySelector('strong')).toHaveTextContent('안건');

    const json = await editableContent(canvas, 'JSON');
    await userEvent.click(json);
    selectText(json, '저장합니다', { caretAfter: true });
    await userEvent.keyboard('!');
    await waitFor(() =>
      expect(canvas.getByTestId('json')).toHaveTextContent('JSON 으로 저장합니다!'),
    );
  },
};

export const Document: Story = {
  render: () => (
    <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-2">
      {variants.map((variant) => (
        <Editor
          key={variant}
          variant={variant}
          format="markdown"
          aria-label={`문서 ${variant}`}
          defaultValue={DOCUMENT}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '본문은 `document-text` 유틸리티로 그립니다. 블록 사이는 gap 8px, 본문은 16px에 행간 28px, 제목은 semibold로 h1 24px부터 한 단계씩 작아집니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const content = await editableContent(canvas, '문서 outline');
    const size = (selector: string) => getComputedStyle(content.querySelector(selector)!).fontSize;

    for (const selector of [
      'h1',
      'h2',
      'h3',
      'h4',
      'ul ul',
      'ol',
      'blockquote',
      'pre',
      'code',
      'a',
      'hr',
      's',
      'em',
    ])
      await expect(content.querySelector(selector)).not.toBeNull();
    await expect(size('h1')).toBe('24px');
    await expect(size('h2')).toBe('20px');
    await expect(size('h3')).toBe('18px');
    await expect(getComputedStyle(content.querySelector('p')!).lineHeight).toBe('28px');
  },
};

export const FormSubmitAndReset: Story = {
  args: { onValueChange: fn() },
  render: function Render(args) {
    const [submitted, setSubmitted] = useState('');

    return (
      <form
        className="flex w-[36rem] max-w-full flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(String(new FormData(event.currentTarget).get('body')));
        }}
      >
        <Field required>
          <Field.Label>본문</Field.Label>
          <Editor name="body" defaultValue="<p>초안</p>" onValueChange={args.onValueChange}>
            <Editor.Bold />
            <Editor.Italic />
            <Editor.Content />
          </Editor>
          <Field.Error />
        </Field>
        <div className="flex justify-end gap-2">
          <Button type="reset" variant="outline">
            되돌리기
          </Button>
          <Button type="submit">올리기</Button>
        </div>
        <output data-testid="submitted" className="text-caption-c1-regular font-mono">
          {submitted}
        </output>
      </form>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'name 을 주면 hidden input 으로 FormData 에 들어갑니다. required 면 비어 있을 때 브라우저가 제출을 막고 Field.Error 가 보입니다. 폼 reset 은 defaultValue 로 돌아가고 onValueChange 를 부르지 않습니다.',
      },
    },
  },
  play: async ({ args, canvas, userEvent }) => {
    const content = await editableContent(canvas, '본문');
    await userEvent.click(content);
    selectText(content, '초안', { caretAfter: true });
    await userEvent.keyboard(' 수정');
    await userEvent.click(canvas.getByRole('button', { name: '올리기' }));
    await waitFor(() =>
      expect(canvas.getByTestId('submitted')).toHaveTextContent('<p>초안 수정</p>'),
    );

    const calls = (args.onValueChange as ReturnType<typeof fn>).mock.calls.length;
    await userEvent.click(canvas.getByRole('button', { name: '되돌리기' }));
    await waitFor(() =>
      expect(canvas.getByRole('textbox', { name: '본문' })).toHaveTextContent(/^초안$/),
    );
    await expect(args.onValueChange).toHaveBeenCalledTimes(calls);
  },
};
