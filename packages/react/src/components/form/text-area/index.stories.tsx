import { useState } from 'react';

import {
  BoldIcon,
  ItalicIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PhotoIcon,
  UnderlineIcon,
} from '@heroicons/react/24/outline';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';
import { IconButton } from '../../action/icon-button';
import { Field } from '../field';

import { TextArea } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;
const resizes = ['auto', 'none', 'vertical', 'horizontal', 'both'] as const;

const meta = {
  title: 'Form/TextArea',
  component: TextArea,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    'aria-invalid': { control: 'boolean' },
    resize: { control: 'radio', options: resizes },
    placeholder: { control: 'text' },
  },
  args: {
    variant: 'outline',
    size: 'standard',
    placeholder: '내용을 입력하세요',
    'aria-label': '내용',
    onValueChange: fn(),
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const Usage: Story = {
  render: () => (
    <div className="w-80">
      <Field>
        <Field.Label>자기소개</Field.Label>
        <TextArea placeholder="자신을 소개해 주세요" />
      </Field>
    </div>
  ),
};

export const Gallery: Story = {
  render: function Render() {
    const [message, setMessage] = useState('');

    return (
      <Showcase>
        <Showcase.Section title="Variant × Size">
          <Showcase.Matrix
            rows={sizes}
            columns={variants}
            render={(size, variant) => (
              <div className="w-56">
                <TextArea
                  size={size}
                  variant={variant}
                  rows={2}
                  placeholder="내용"
                  aria-label={`${variant} ${size}`}
                />
              </div>
            )}
          />
        </Showcase.Section>

        <Showcase.Section title="States">
          <Showcase.Row label="filled">
            <div className="w-56">
              <TextArea rows={2} defaultValue="인포팀 소개글" aria-label="채움" />
            </div>
          </Showcase.Row>
          <Showcase.Row label="invalid">
            <div className="w-56">
              <TextArea rows={2} defaultValue="짧음" aria-invalid aria-label="잘못됨" />
            </div>
            <div className="w-56">
              <TextArea
                rows={2}
                defaultValue="짧음"
                aria-invalid
                maxLength={100}
                aria-label="잘못됨 카운터"
              >
                <TextArea.Input />
                <TextArea.Count />
              </TextArea>
            </div>
          </Showcase.Row>
          <Showcase.Row label="disabled">
            <div className="w-56">
              <TextArea rows={2} defaultValue="수정 불가" disabled aria-label="비활성" />
            </div>
          </Showcase.Row>
          <Showcase.Row label="readOnly">
            <div className="w-56">
              <TextArea rows={2} defaultValue="읽기 전용" readOnly aria-label="읽기 전용" />
            </div>
          </Showcase.Row>
        </Showcase.Section>

        <Showcase.Section
          title="Bars"
          description="TextArea.Input 위의 자식은 위 바, 아래의 자식은 아래 바가 됩니다. 바의 구분선은 오류 상태에서도 중립색입니다."
        >
          <Showcase.Row label="menubar">
            <div className="w-80">
              <TextArea placeholder="마크다운으로 작성하세요" aria-label="본문">
                <div className="flex gap-1">
                  <IconButton aria-label="굵게" icon={<BoldIcon />} />
                  <IconButton aria-label="기울임" icon={<ItalicIcon />} />
                  <IconButton aria-label="밑줄" icon={<UnderlineIcon />} />
                </div>
                <TextArea.Input />
              </TextArea>
            </div>
          </Showcase.Row>
          <Showcase.Row label="actionbar">
            <div className="w-80">
              <TextArea
                value={message}
                onValueChange={setMessage}
                rows={1}
                maxRows={6}
                placeholder="메시지 입력..."
                aria-label="메시지"
              >
                <TextArea.Input />
                <div className="flex w-full items-center justify-between">
                  <div className="flex gap-1">
                    <IconButton aria-label="첨부" icon={<PaperClipIcon />} />
                    <IconButton aria-label="이미지" icon={<PhotoIcon />} />
                  </div>
                  <IconButton
                    aria-label="보내기"
                    variant="solid"
                    icon={<PaperAirplaneIcon />}
                    disabled={message === ''}
                    onClick={() => setMessage('')}
                  />
                </div>
              </TextArea>
            </div>
          </Showcase.Row>
          <Showcase.Row label="count">
            <div className="w-80">
              <TextArea
                maxLength={200}
                defaultValue="200자 이내로 소개해 주세요."
                aria-label="소개"
              >
                <TextArea.Input />
                <TextArea.Count />
              </TextArea>
            </div>
          </Showcase.Row>
          <Showcase.Row label="both">
            <div className="w-80">
              <TextArea placeholder="마크다운 지원" maxLength={500} aria-label="메모">
                <div className="flex gap-1">
                  <IconButton aria-label="굵게" icon={<BoldIcon />} />
                  <IconButton aria-label="기울임" icon={<ItalicIcon />} />
                </div>
                <TextArea.Input />
                <TextArea.Count />
                <Button size="tiny">저장</Button>
              </TextArea>
            </div>
          </Showcase.Row>
        </Showcase.Section>

        <Showcase.Section title="Height">
          <Showcase.Row label="auto">
            <div className="w-80">
              <TextArea
                rows={1}
                maxRows={4}
                placeholder="내용에 맞춰 늘어납니다"
                aria-label="자동"
              />
            </div>
          </Showcase.Row>
          <Showcase.Row label="none">
            <div className="w-80">
              <TextArea
                resize="none"
                rows={2}
                placeholder="높이가 rows 로 고정됩니다"
                aria-label="고정"
              />
            </div>
          </Showcase.Row>
        </Showcase.Section>

        <Showcase.Section
          title="Resize"
          description="resize 가 vertical, horizontal, both 면 Resizable 과 같은 손잡이를 필드의 테두리 위에 그립니다. vertical 은 아래 가장자리, horizontal 은 끝 가장자리의 막대, both 는 필드의 모서리와 같은 중심으로 휜 호입니다. 누를 영역은 선의 안쪽 끝에서 바깥으로 24px 라서 바의 버튼과 스크롤 막대를 덮지 않습니다."
        >
          <Showcase.Row label="vertical" className="gap-8 py-3">
            <div className="w-72">
              <TextArea
                resize="vertical"
                rows={3}
                placeholder="아래 가장자리를 끌어 높이를 바꿉니다"
                aria-label="세로 조절"
              />
            </div>
            <div className="w-72">
              <TextArea
                resize="vertical"
                rows={2}
                maxLength={100}
                placeholder="아래 바가 있어도 손잡이는 테두리 위에 섭니다"
                aria-label="바 있는 세로 조절"
              >
                <TextArea.Input />
                <TextArea.Count />
                <IconButton aria-label="보내기" icon={<PaperAirplaneIcon />} />
              </TextArea>
            </div>
          </Showcase.Row>
          <Showcase.Row label="horizontal" className="gap-8 py-3">
            <div className="w-72">
              <TextArea
                resize="horizontal"
                rows={3}
                placeholder="끝 가장자리를 끌어 너비를 바꿉니다"
                aria-label="가로 조절"
              />
            </div>
            <div className="w-72">
              <TextArea
                resize="horizontal"
                rows={2}
                maxLength={100}
                placeholder="끝 가장자리 전체가 손잡이입니다"
                aria-label="바 있는 가로 조절"
              >
                <TextArea.Input />
                <TextArea.Count />
                <IconButton aria-label="보내기" icon={<PaperAirplaneIcon />} />
              </TextArea>
            </div>
          </Showcase.Row>
          <Showcase.Row label="both" className="gap-8 py-3">
            <div className="w-72">
              <TextArea
                resize="both"
                rows={3}
                placeholder="모서리를 끌어 너비와 높이를 함께 바꿉니다"
                aria-label="양방향 조절"
              />
            </div>
            <div className="w-72">
              <TextArea
                resize="both"
                rows={2}
                maxLength={100}
                placeholder="호는 필드의 바깥 모서리를 따라 휩니다"
                aria-label="바 있는 양방향 조절"
              >
                <TextArea.Input />
                <TextArea.Count />
                <IconButton aria-label="보내기" icon={<PaperAirplaneIcon />} />
              </TextArea>
            </div>
          </Showcase.Row>
          <Showcase.Row label="tiny" className="gap-8 py-3">
            {(['vertical', 'horizontal', 'both'] as const).map((resize) => (
              <div key={resize} className="w-60">
                <TextArea
                  size="tiny"
                  resize={resize}
                  rows={2}
                  maxLength={100}
                  placeholder={resize}
                  aria-label={`작은 ${resize}`}
                >
                  <TextArea.Input />
                  <TextArea.Count />
                  <IconButton aria-label="보내기" icon={<PaperAirplaneIcon />} />
                </TextArea>
              </div>
            ))}
          </Showcase.Row>
          <Showcase.Row label="disabled" className="gap-8 py-3">
            <div className="w-72">
              <TextArea
                resize="vertical"
                rows={2}
                disabled
                defaultValue="손잡이도 흐려집니다"
                aria-label="비활성 세로 조절"
              />
            </div>
            <div className="w-72">
              <TextArea
                resize="both"
                rows={2}
                disabled
                defaultValue="손잡이도 흐려집니다"
                aria-label="비활성 양방향 조절"
              />
            </div>
          </Showcase.Row>
          <Showcase.Row label="rtl" className="gap-8 py-3">
            <div dir="rtl" className="flex flex-wrap gap-8">
              <div className="w-72">
                <TextArea
                  resize="horizontal"
                  rows={3}
                  placeholder="끝 가장자리는 왼쪽입니다"
                  aria-label="오른쪽에서 왼쪽 가로"
                />
              </div>
              <div className="w-72">
                <TextArea
                  resize="both"
                  rows={3}
                  placeholder="호가 왼쪽 아래 모서리로 옮겨 갑니다"
                  aria-label="오른쪽에서 왼쪽 양방향"
                />
              </div>
            </div>
          </Showcase.Row>
        </Showcase.Section>
      </Showcase>
    );
  },
};

export const GrowWithTheText: Story = {
  render: () => (
    <div className="w-80">
      <Field>
        <Field.Label>자기소개</Field.Label>
        <TextArea rows={1} maxRows={5} placeholder="자신을 소개해 주세요" />
      </Field>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '기본값 `resize="auto"` 는 내용에 맞춰 높이가 늘고 줄어듭니다. `rows` 가 가장 낮은 높이이고, `maxRows` 를 넘으면 스크롤이 생깁니다. 붙여넣기, 실행 취소, 폼 reset, 창 크기 변화, 웹폰트 로딩 뒤에도 다시 잽니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '자기소개' });
    const start = input.clientHeight;

    await userEvent.type(input, '한 줄\n두 줄\n세 줄');
    const grown = input.clientHeight;
    await expect(grown).toBeGreaterThan(start);
    await expect(input.scrollHeight).toBe(grown);

    await userEvent.type(input, '\n네 줄\n다섯 줄\n여섯 줄\n일곱 줄');
    await expect(input.clientHeight).toBeLessThan(input.scrollHeight);
    const line = Number.parseFloat(getComputedStyle(input).lineHeight);
    await expect(Math.abs(input.clientHeight - (grown + 2 * line))).toBeLessThanOrEqual(1);
  },
};

export const KeepAFixedHeight: Story = {
  render: () => (
    <div className="w-80">
      <Field>
        <Field.Label>메모</Field.Label>
        <TextArea resize="none" rows={3} placeholder="세 줄 높이에서 스크롤합니다" />
      </Field>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`resize="none"` 은 높이를 `rows` 로 고정하고 손잡이도 그리지 않습니다. 넘치는 내용은 필드 안에서 스크롤합니다. 목록이나 카드 안처럼 필드가 커지면 레이아웃이 흔들리는 자리에 씁니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '메모' });
    const start = input.clientHeight;

    await userEvent.type(input, '한 줄\n두 줄\n세 줄\n네 줄\n다섯 줄');
    await expect(input.clientHeight).toBe(start);
    await expect(input.scrollHeight).toBeGreaterThan(input.clientHeight);
    await expect(canvas.queryByRole('separator')).toBeNull();
  },
};

export const LetTheUserResizeIt: Story = {
  render: () => (
    <div className="grid w-80 gap-4">
      <TextArea resize="vertical" rows={3} aria-label="높이만" placeholder="resize=vertical" />
      <TextArea resize="horizontal" rows={2} aria-label="너비만" placeholder="resize=horizontal" />
      <TextArea resize="both" rows={3} aria-label="둘 다" placeholder="resize=both" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`resize` 를 `vertical`, `horizontal`, `both` 로 주면 높이가 `rows` 로 정해지고, Resizable 과 같은 손잡이가 필드의 테두리 위에 생깁니다. `vertical` 은 아래 가장자리, `horizontal` 은 끝 가장자리의 막대이고, `both` 는 필드의 모서리와 같은 중심으로 휜 호입니다. 브라우저의 CSS 손잡이와 달리 Tab 으로 가서 방향키로 바꿀 수 있고, 터치로 끌립니다. 높이는 textarea 에, 너비는 필드 전체에 들어갑니다. Enter 나 두 번 누르기는 rows 로 정한 크기로 돌아갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const textarea = canvas.getByRole('textbox', { name: '높이만' });
    const natural = textarea.offsetHeight;
    const [height] = canvas.getAllByRole('separator', { name: '크기 조절' });
    height!.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(textarea.offsetHeight).toBe(natural + 16));
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(textarea.offsetHeight).toBe(natural));

    const shell = canvas
      .getByRole('textbox', { name: '너비만' })
      .closest<HTMLElement>('[data-text-area]')!;
    const width = shell.querySelector<HTMLElement>(
      '[role="separator"][aria-orientation="vertical"]',
    )!;
    width.focus();
    await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    await waitFor(() => expect(shell.style.width).toBe('256px'));

    const both = canvas.getByRole('group', { name: '크기 조절' });
    await expect(both.querySelectorAll('[role="separator"]')).toHaveLength(2);
  },
};

export const CountCharacters: Story = {
  render: (args) => (
    <div className="w-80">
      <Field>
        <Field.Label>한 줄 소개</Field.Label>
        <Field.Description>프로필에 보입니다.</Field.Description>
        <TextArea {...args} maxLength={30} rows={2} aria-label={undefined}>
          <TextArea.Input />
          <TextArea.Count />
        </TextArea>
      </Field>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'TextArea.Input 아래에 TextArea.Count 를 두면 아래 바에 maxLength 에 대한 글자 수가 보이고, 그 글자 수가 입력의 설명에 들어갑니다. 한도에 가까워지면 입력이 멈춘 뒤 남은 글자 수를 스크린 리더에 알립니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const input = () => canvas.getByRole('textbox', { name: '한 줄 소개' });
    const count = () => canvasElement.querySelector('[data-text-area-count]')!;
    await expect(count()).toHaveTextContent('0 / 30');
    await expect(input()).toHaveAccessibleDescription('프로필에 보입니다. 0 / 30');
    await userEvent.type(input(), 'GIST 인포팀에서 서비스를 만듭니다. 반갑습니다');
    await expect(count()).toHaveAttribute('data-near-limit');
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent(/자 남았습니다|제한에 도달했습니다/),
    );
  },
};

export const BarsSitAroundTheScrollArea: Story = {
  tags: ['verification'],
  render: () => (
    <div className="w-80">
      <TextArea aria-label="본문" placeholder="본문">
        <span>위</span>
        <TextArea.Input />
        <span>아래</span>
      </TextArea>
    </div>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: '본문' });
    const root = input.closest('[data-text-area]')!;
    const scrollArea = input.closest('[data-scroll-area]')!;

    await expect(root.querySelector('[data-text-area-top]')).toHaveTextContent('위');
    await expect(root.querySelector('[data-text-area-bottom]')).toHaveTextContent('아래');
    await expect(scrollArea.previousElementSibling).toHaveAttribute('data-text-area-top');
    await expect(scrollArea.nextElementSibling).toHaveAttribute('data-text-area-bottom');
  },
};
