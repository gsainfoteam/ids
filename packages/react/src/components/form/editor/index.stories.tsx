import { useState } from 'react';

import { expect, fn, waitFor, within } from 'storybook/test';

import { Showcase, holdTheNextCall } from '~story-kit';

import { cn } from '../../../utils';
import { Button } from '../../action/button';
import { Field } from '../field';

import { Editor } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft'] as const;
const sizes = ['standard', 'tiny'] as const;

const NOTICE =
  '<h2>동아리 박람회</h2><p>3월 12일 학생회관 앞에서 <strong>동아리 박람회</strong>가 열립니다. 자세한 일정은 <a href="https://gistory.me">공지</a>를 보세요.</p><ul><li>부스 신청: 3월 5일까지</li><li>장소 배정: 3월 8일</li></ul>';

const MEMBERS = [
  { id: 'kim', label: '김지스트', description: '회장' },
  { id: 'lee', label: '이인포', description: '프론트엔드' },
  { id: 'park', label: '박디자인', description: '디자인' },
];

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

const PICTURE = `data:image/svg+xml;base64,${btoa(
  '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="200" viewBox="0 0 480 200"><rect width="480" height="200" fill="hsl(210 70% 88%)"/><circle cx="350" cy="60" r="22" fill="hsl(40 90% 66%)"/><path d="M0 200 L130 92 L250 160 L350 104 L480 200 Z" fill="hsl(210 32% 40%)"/></svg>',
)}`;

const TOOLS_NOTICE =
  '<h2>박람회 준비</h2><p style="text-align: center">부스마다 <mark>안내판</mark>을 세웁니다.</p><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>부스 신청</p></li><li data-type="taskItem" data-checked="false"><p>장소 배정</p></li></ul><hr><p>문의는 학생회로 해 주세요.</p>';

const pictureFile = () => new File(['<svg/>'], '지도.png', { type: 'image/png' });

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

      <Showcase.Section
        title="Tools"
        description="형광펜, 할 일 목록, 구분선, 정렬은 부품을 넣으면 그 확장이 함께 실립니다. 그림은 onImageUpload 가 있을 때만 툴바에 나옵니다."
      >
        <Showcase.Row label="every tool">
          <Editor
            aria-label="모든 도구"
            defaultValue={TOOLS_NOTICE}
            onImageUpload={async () => PICTURE}
            className="w-[40rem]"
          >
            <Editor.BlockType />
            <Editor.Separator />
            <Editor.Bold />
            <Editor.Italic />
            <Editor.Highlight />
            <Editor.Link />
            <Editor.Separator />
            <Editor.BulletList />
            <Editor.OrderedList />
            <Editor.TaskList />
            <Editor.Separator />
            <Editor.TextAlign />
            <Editor.Separator />
            <Editor.Image />
            <Editor.HorizontalRule />
            <Editor.Table />
            <Editor.Content />
          </Editor>
        </Showcase.Row>
        <Showcase.Row label="default with upload">
          <Editor
            aria-label="업로드가 있는 기본 툴바"
            onImageUpload={async () => PICTURE}
            className="w-[40rem]"
          />
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

export const ImageUpload: Story = {
  args: {
    defaultValue: '<p>학생회관 가는 길</p>',
    'aria-label': '그림 본문',
    onImageUpload: fn(async () => PICTURE),
  },
  render: (args) => (
    <Editor {...args}>
      <Editor.Bold />
      <Editor.Image />
      <Editor.Content />
    </Editor>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'onImageUpload 는 파일을 받아 올린 그림의 주소를 돌려줍니다. Editor.Image 는 파일을 고르게 하고, 붙여넣거나 끌어 놓은 그림도 같은 함수로 올립니다. 올리는 동안 본문의 그 자리에 자리표시가 서고 도구가 aria-busy 가 됩니다. 그림을 고른 채 Editor.Image 를 누르면 대체 텍스트를 넣는 Popover 가 열립니다.',
      },
    },
  },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const finishUpload = holdTheNextCall(args.onImageUpload, PICTURE);
    const content = await editableContent(canvas, '그림 본문');
    await userEvent.click(content);
    selectText(content, '가는 길', { caretAfter: true });
    const input = canvasElement.querySelector<HTMLInputElement>('[data-editor-image-input]')!;
    await userEvent.upload(input, pictureFile());

    await waitFor(() => expect(args.onImageUpload).toHaveBeenCalledOnce());
    await expect(canvas.getByRole('button', { name: '그림' })).toHaveAttribute('aria-busy', 'true');
    await expect(content.querySelector('[data-editor-upload]')).not.toBeNull();

    finishUpload();
    await waitFor(() => expect(content.querySelector('img')).not.toBeNull());
    await expect(content.querySelector('[data-editor-upload]')).toBeNull();

    await userEvent.click(content.querySelector('img')!);
    await userEvent.click(canvas.getByRole('button', { name: '그림' }));
    const alt = await waitFor(() => canvas.getByRole('textbox', { name: '대체 텍스트' }));
    await waitFor(() => expect(alt).toHaveFocus());
    await userEvent.type(alt, '학생회관 지도{Enter}');
    await waitFor(() =>
      expect(args.onValueChange).toHaveBeenLastCalledWith(
        `<p>학생회관 가는 길</p><img src="${PICTURE}" alt="학생회관 지도">`,
      ),
    );
  },
};

export const Highlight: Story = {
  args: { defaultValue: '<p>마감은 3월 5일입니다.</p>', 'aria-label': '형광펜 본문' },
  render: (args) => (
    <Editor {...args}>
      <Editor.Bold />
      <Editor.Highlight />
      <Editor.Content />
    </Editor>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Editor.Highlight 는 고른 글에 형광펜을 칠합니다. 색은 warning 계열의 soft 역할이라 테마를 따릅니다. 마크다운에서는 ==글== 로 씁니다.',
      },
    },
  },
  play: async ({ args, canvas, userEvent }) => {
    const content = await editableContent(canvas, '형광펜 본문');
    await userEvent.click(content);
    selectText(content, '3월 5일');
    await userEvent.click(canvas.getByRole('button', { name: '형광펜' }));
    await waitFor(() =>
      expect(args.onValueChange).toHaveBeenLastCalledWith(
        '<p>마감은 <mark>3월 5일</mark>입니다.</p>',
      ),
    );
  },
};

export const TaskList: Story = {
  args: { defaultValue: '<p>부스 신청</p>', 'aria-label': '할 일 본문' },
  render: (args) => (
    <Editor {...args}>
      <Editor.BulletList />
      <Editor.TaskList />
      <Editor.Content />
    </Editor>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Editor.TaskList 는 문단을 할 일 목록으로 바꿉니다. 체크박스는 IDS Checkbox 와 같은 모양이고, 이름은 그 할 일의 글입니다. 마크다운에서는 - [ ] 와 - [x] 로 씁니다.',
      },
    },
  },
  play: async ({ args, canvas, userEvent }) => {
    const content = await editableContent(canvas, '할 일 본문');
    await userEvent.click(content);
    await userEvent.click(canvas.getByRole('button', { name: '할 일 목록' }));
    const checkbox = await waitFor(() =>
      canvas.getByRole('checkbox', { name: '할 일: 부스 신청' }),
    );
    await userEvent.click(checkbox);
    await waitFor(() =>
      expect(args.onValueChange).toHaveBeenLastCalledWith(
        '<ul data-type="taskList"><li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p>부스 신청</p></div></li></ul>',
      ),
    );
  },
};

export const HorizontalRule: Story = {
  args: { defaultValue: '<p>1부</p>', 'aria-label': '구분선 본문' },
  render: (args) => (
    <Editor {...args}>
      <Editor.Bold />
      <Editor.HorizontalRule />
      <Editor.Content />
    </Editor>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Editor.HorizontalRule 은 커서 자리 뒤에 구분선을 넣습니다. 누르는 상태가 없는 버튼이라 IconButton 입니다. 마크다운에서는 --- 로 씁니다.',
      },
    },
  },
  play: async ({ args, canvas, userEvent }) => {
    const content = await editableContent(canvas, '구분선 본문');
    await userEvent.click(content);
    selectText(content, '1부', { caretAfter: true });
    await userEvent.click(canvas.getByRole('button', { name: '구분선' }));
    await waitFor(() =>
      expect(args.onValueChange).toHaveBeenLastCalledWith('<p>1부</p><hr><p></p>'),
    );
  },
};

export const Table: Story = {
  args: {
    defaultValue:
      '<table><tbody><tr><th><p>시간</p></th><th><p>순서</p></th></tr><tr><td><p>10:00</p></td><td><p>개회</p></td></tr></tbody></table><p></p>',
    'aria-label': '표 본문',
  },
  render: (args) => (
    <Editor {...args}>
      <Editor.Bold />
      <Editor.Table />
      <Editor.Content />
    </Editor>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Editor.Table 은 표를 넣고, 커서가 있는 칸을 기준으로 행과 열을 더하거나 지우는 메뉴입니다. 새 표는 3×3 에 머리글 행이 있고, 마크다운에서는 GFM 표로 씁니다. 칸을 합치거나 너비를 끌어 바꾸지는 않습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const content = await editableContent(canvas, '표 본문');
    await userEvent.click(content);
    selectText(content, '개회', { caretAfter: true });
    await userEvent.click(canvas.getByRole('button', { name: '표' }));
    await userEvent.click(await canvas.findByRole('menuitem', { name: '아래에 행 추가' }));
    await waitFor(() => expect(content.querySelectorAll('tr')).toHaveLength(3));
    await waitFor(() => expect(content).toHaveFocus());
  },
};

export const CalloutAndDetails: Story = {
  args: {
    format: 'markdown',
    defaultValue:
      '> [!TIP]\n> 신청 전에 졸업 요건 점검표를 확인하세요.\n\n:::details {open}\n\n:::detailsSummary\n\n재수강 규정\n\n:::\n\n:::detailsContent\n\n재수강한 과목은 성적이 A0 를 넘지 않습니다.\n\n:::\n\n:::',
    'aria-label': '안내 본문',
  },
  render: (args) => (
    <Editor {...args}>
      <Editor.Callout />
      <Editor.Details />
      <Editor.Content />
    </Editor>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Editor.Callout 은 GitHub alert(> [!TIP])를 RichText 와 같은 Alert 모양으로 편집합니다. 왼쪽 아이콘을 누르면 종류를 바꾸거나 콜아웃을 풀 수 있고, 인용문 첫 줄에 [!tip] 을 쓰면 인용문이 콜아웃이 됩니다. Editor.Details 는 고른 블록을 접히는 토글로 감싸고, 펼침 상태는 마크다운의 {open} 으로 남습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await editableContent(canvas, '안내 본문');
    const toggle = canvas.getByRole('button', { name: '내용 펼치기' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(toggle);
    await waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'false'));
  },
};

export const SlashMenuAndMentions: Story = {
  args: {
    format: 'markdown',
    defaultValue: '',
    'aria-label': '회의록 본문',
  },
  render: (args) => (
    <Editor
      {...args}
      mentions={(query) => MEMBERS.filter((member) => member.label.includes(query))}
    >
      <Editor.Callout />
      <Editor.Details />
      <Editor.Table />
      <Editor.Content placeholder="/ 로 블록을, @ 로 사람을 넣으세요" />
    </Editor>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '줄에서 / 를 치면 블록 메뉴가 열립니다. 메뉴에는 Editor 가 불러온 블록만 나오고, 글자를 더 치면 이름과 영어 키워드(h2, todo, quote)로 좁혀집니다. 위아래 화살표로 고르고 Enter 로 넣으며, Escape 는 메뉴만 닫습니다. mentions 를 주면 @ 뒤의 글자로 그 함수를 불러 사람을 찾고, 고른 사람은 마크다운에 [@ id="" label=""] 로 남습니다. 함수는 Promise 를 돌려줘도 되고, 두 번째 인자인 AbortSignal 로 지난 요청을 끊을 수 있습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const content = await editableContent(canvas, '회의록 본문');
    await userEvent.click(content);
    await userEvent.keyboard('/');
    const menu = await canvas.findByRole('listbox', { name: '블록 넣기' });
    await expect(menu).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('listbox')).toBeNull());
  },
};

export const BlockHandle: Story = {
  args: {
    format: 'markdown',
    defaultValue: '## 준비물\n\n이름표와 노트북을 챙기세요.\n\n- 9시 집합\n- 10시 발표',
    'aria-label': '블록 본문',
  },
  parameters: {
    docs: {
      description: {
        story:
          '편집할 수 있는 Editor 는 블록 위에 올린 포인터 옆, 본문 왼쪽 여백에 손잡이를 보여 줍니다. 손잡이를 끌면 블록이 옮겨지고, 누르면 메뉴가 열립니다. 메뉴로 아래에 블록을 넣거나(블록 메뉴가 바로 열립니다), 글이 담긴 블록을 다른 종류로 바꾸거나, 복제하거나, 지울 수 있습니다. 손잡이는 Tab 순서에 들지 않습니다. 같은 일은 키보드로도 할 수 있어서(/ 메뉴, 잘라 내기와 붙여 넣기, 실행 취소), 손잡이는 포인터를 위한 지름길입니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const content = await editableContent(canvas, '블록 본문');
    await userEvent.hover(within(content).getByText('이름표와 노트북을 챙기세요.'));
    const handle = await canvas.findByRole('button', { name: '블록 메뉴' });
    await userEvent.click(handle);
    await expect(await canvas.findByRole('menuitem', { name: '복제' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('menu')).toBeNull());
  },
};

export const TextAlign: Story = {
  args: { defaultValue: '<p>행사 안내</p>', 'aria-label': '정렬 본문' },
  render: (args) => (
    <Editor {...args}>
      <Editor.BlockType />
      <Editor.Separator />
      <Editor.TextAlign />
      <Editor.Content />
    </Editor>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Editor.TextAlign 은 문단과 제목을 정렬하는 토글 묶음입니다. 기본은 왼쪽, 가운데, 오른쪽이고 alignments 로 양쪽 정렬을 더합니다. 누른 정렬을 다시 누르거나 왼쪽을 누르면 정렬을 지웁니다. 마크다운에는 정렬을 담을 문법이 없어 HTML 과 JSON 에서만 남습니다.',
      },
    },
  },
  play: async ({ args, canvas, userEvent }) => {
    const content = await editableContent(canvas, '정렬 본문');
    await userEvent.click(content);
    await userEvent.click(canvas.getByRole('button', { name: '가운데 정렬' }));
    await waitFor(() =>
      expect(args.onValueChange).toHaveBeenLastCalledWith(
        '<p style="text-align: center;">행사 안내</p>',
      ),
    );
    await expect(canvas.getByRole('button', { name: '가운데 정렬' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
};
