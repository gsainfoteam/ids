import { expect, fn, waitFor, within } from 'storybook/test';

import { Showcase } from '~story-kit';

import { useEditor } from '../editor';
import { Field } from '../field';

import { BlockEditor } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft'] as const;
const sizes = ['standard', 'tiny'] as const;

const PLAN =
  '<h2>박람회 준비</h2><p>부스마다 <strong>안내판</strong>을 세웁니다.</p><ul><li><p>부스 신청</p></li><li><p>장소 배정</p></li></ul>';

const MEMBERS = [
  { id: 'kim', label: '김지스트', description: '회장' },
  { id: 'lee', label: '이인포', description: '프론트엔드' },
  { id: 'park', label: '박디자인', description: '디자인' },
];

const meta = {
  title: 'Form/BlockEditor',
  component: BlockEditor,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    'aria-invalid': { control: 'boolean' },
  },
  args: {
    variant: 'outline',
    size: 'standard',
    'aria-label': '본문',
    defaultValue: PLAN,
    onValueChange: fn(),
  },
} satisfies Meta<typeof BlockEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

type Canvas = { getByRole: (role: 'textbox', options: { name: string }) => HTMLElement };

async function editableContent(canvas: Canvas, name: string) {
  await waitFor(() =>
    expect(canvas.getByRole('textbox', { name })).toHaveAttribute('contenteditable', 'true'),
  );
  return canvas.getByRole('textbox', { name });
}

function selectText(root: HTMLElement, text: string) {
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const start = node.textContent?.indexOf(text) ?? -1;
    if (start < 0) continue;
    const range = root.ownerDocument.createRange();
    range.setStart(node, start);
    range.setEnd(node, start + text.length);
    const selection = root.ownerDocument.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    return;
  }
  throw new Error(`No text node holds "${text}".`);
}

export const Playground: Story = {
  render: (args) => (
    <div className="w-[40rem] max-w-full">
      <BlockEditor {...args} />
    </div>
  ),
};

export const Usage: Story = {
  render: () => (
    <div className="w-[40rem] max-w-full">
      <Field>
        <Field.Label>본문</Field.Label>
        <BlockEditor defaultValue="<p>가을 축제 부스를 모집합니다.</p>" />
      </Field>
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <div className="w-96">
              <BlockEditor
                size={size}
                variant={variant}
                aria-label={`${variant} ${size}`}
                defaultValue="<p>가을 축제 <strong>부스</strong>를 모집합니다.</p>"
              />
            </div>
          )}
        />
      </Showcase.Section>

      <Showcase.Section
        title="Parts"
        description="툴바는 없습니다. Content 뒤의 Count 는 아래 바가 되고, BubbleMenu 의 자식은 글을 고르면 뜨는 도구입니다."
      >
        <Showcase.Row label="default">
          <div className="w-[36rem]">
            <BlockEditor aria-label="기본" defaultValue={PLAN} />
          </div>
        </Showcase.Row>
        <Showcase.Row label="count">
          <div className="w-[36rem]">
            <BlockEditor aria-label="글자 수" maxLength={200}>
              <BlockEditor.Content placeholder="200자까지 쓸 수 있습니다" />
              <BlockEditor.Count />
            </BlockEditor>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="placeholder">
          <div className="w-96">
            <BlockEditor aria-label="비어 있음">
              <BlockEditor.Content placeholder="/ 로 블록을 넣으세요" />
            </BlockEditor>
          </div>
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <div className="w-96">
            <BlockEditor aria-label="비활성" disabled defaultValue={PLAN} />
          </div>
        </Showcase.Row>
        <Showcase.Row label="readOnly">
          <div className="w-96">
            <BlockEditor aria-label="읽기 전용" readOnly defaultValue={PLAN} />
          </div>
        </Showcase.Row>
        <Showcase.Row label="aria-invalid">
          <div className="w-96">
            <BlockEditor aria-label="오류" aria-invalid>
              <BlockEditor.Content placeholder="본문을 입력하세요" />
            </BlockEditor>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const EditBlockByBlock: Story = {
  args: {
    format: 'markdown',
    defaultValue: '## 준비물\n\n이름표와 노트북을 챙기세요.\n\n- 9시 집합\n- 10시 발표',
    'aria-label': '블록 본문',
  },
  render: (args) => (
    <div className="w-[40rem]">
      <BlockEditor {...args}>
        <BlockEditor.Content placeholder="/ 로 블록을 넣으세요" />
      </BlockEditor>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'BlockEditor 는 툴바 없이 본문만 보여 줍니다. 블록은 / 메뉴로 넣고, 글자를 고르면 뜨는 BubbleMenu 로 꾸밉니다. / 메뉴에는 표, 콜아웃, 접는 블록, 할 일 목록까지 모든 블록이 나옵니다. 편집할 수 있으면 포인터를 올린 블록의 첫 줄 옆, 본문 왼쪽 여백에 손잡이가 나옵니다. 손잡이를 끌면 Sidebar 처럼 블록의 복사본이 따라오고 놓을 자리에 primary 선이 그어지며, 놓은 블록은 옅은 틴트로 골라집니다. 누르면 메뉴가 열려 아래에 블록을 넣거나, 다른 종류로 바꾸거나, 복제하거나, 지울 수 있습니다. 손잡이는 Tab 순서에 들지 않습니다. 같은 일은 키보드로도 할 수 있어서(/ 메뉴, 잘라 내기와 붙여 넣기, 실행 취소), 손잡이는 포인터를 위한 지름길입니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const content = await editableContent(canvas, '블록 본문');
    await expect(canvas.queryByRole('toolbar')).toBeNull();
    await userEvent.hover(within(content).getByText('이름표와 노트북을 챙기세요.'));
    const handle = await canvas.findByRole('button', { name: '블록 메뉴' });
    await userEvent.click(handle);
    await expect(await canvas.findByRole('menuitem', { name: '복제' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('menu')).toBeNull());
  },
};

export const PickTheBubbleMenuTools: Story = {
  args: { defaultValue: '<p>마감은 3월 5일입니다.</p>', 'aria-label': '버블 본문' },
  render: (args) => (
    <div className="w-[40rem]">
      <BlockEditor {...args}>
        <BlockEditor.Content />
        <BlockEditor.BubbleMenu>
          <BlockEditor.Bold />
          <BlockEditor.Highlight />
          <BlockEditor.Separator />
          <BlockEditor.TextAlign />
        </BlockEditor.BubbleMenu>
      </BlockEditor>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'BlockEditor.BubbleMenu 의 자식이 글을 고르면 뜨는 도구가 됩니다. 자식이 없거나 BubbleMenu 를 쓰지 않으면 굵게, 기울임, 밑줄, 취소선, 코드, 색, 링크가 나옵니다. 글자 서식, 색, 링크, 정렬, 구분선을 넣을 수 있습니다.',
      },
    },
  },
  play: async ({ args, canvas, userEvent }) => {
    const content = await editableContent(canvas, '버블 본문');
    await userEvent.click(content);
    selectText(content, '3월 5일');
    const bubble = await within(document.body).findByRole('toolbar', { name: '선택한 글 서식' });
    await expect(within(bubble).queryByRole('button', { name: '기울임' })).toBeNull();
    await userEvent.click(within(bubble).getByRole('button', { name: '형광펜' }));
    await waitFor(() =>
      expect(args.onValueChange).toHaveBeenLastCalledWith(
        '<p>마감은 <mark>3월 5일</mark>입니다.</p>',
      ),
    );
  },
};

export const MentionPeople: Story = {
  args: { format: 'markdown', defaultValue: '', 'aria-label': '회의록 본문' },
  render: function Render(args) {
    const editor = useEditor({
      mentions: { find: (query) => MEMBERS.filter((member) => member.label.includes(query)) },
    });

    return (
      <div className="w-[40rem]">
        <BlockEditor {...args} editor={editor}>
          <BlockEditor.Content placeholder="/ 로 블록을, @ 로 사람을 넣으세요" />
        </BlockEditor>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Editor 와 같은 useEditor 의 결과를 editor 로 넘깁니다. mentions.find 를 주면 @ 뒤의 글자로 사람을 찾고, imageUpload.onUpload 를 주면 붙여 넣거나 끌어 놓은 그림을 올립니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const content = await editableContent(canvas, '회의록 본문');
    await userEvent.click(content);
    await userEvent.keyboard('@이');
    const list = await canvas.findByRole('listbox', { name: '멘션' });
    await expect(await within(list).findByRole('option', { name: /이인포/ })).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};
