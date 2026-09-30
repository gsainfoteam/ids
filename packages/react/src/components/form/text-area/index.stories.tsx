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

import { cn } from '../../../utils';
import { Button } from '../../action/button';
import { IconButton } from '../../action/icon-button';
import { Field } from '../field';

import { TextArea } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'soft', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;

const meta = {
  title: 'Form/TextArea',
  component: TextArea,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    autoResize: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  args: {
    variant: 'outline',
    size: 'standard',
    placeholder: '내용을 입력하세요',
    'aria-label': '내용',
    className: cn('w-80'),
    onValueChange: fn(),
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

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
              <TextArea
                size={size}
                variant={variant}
                rows={2}
                placeholder="내용"
                aria-label={`${variant} ${size}`}
                className="w-56"
              />
            )}
          />
        </Showcase.Section>

        <Showcase.Section title="States">
          <Showcase.Row label="filled">
            <TextArea rows={2} defaultValue="인포팀 소개글" aria-label="채움" className="w-56" />
          </Showcase.Row>
          <Showcase.Row label="invalid">
            <TextArea rows={2} defaultValue="짧음" invalid aria-label="잘못됨" className="w-56" />
            <TextArea
              rows={2}
              defaultValue="짧음"
              invalid
              maxLength={100}
              aria-label="잘못됨 카운터"
              className="w-56"
            >
              <TextArea.Input />
              <TextArea.Count />
            </TextArea>
          </Showcase.Row>
          <Showcase.Row label="disabled">
            <TextArea
              rows={2}
              defaultValue="수정 불가"
              disabled
              aria-label="비활성"
              className="w-56"
            />
          </Showcase.Row>
          <Showcase.Row label="readOnly">
            <TextArea
              rows={2}
              defaultValue="읽기 전용"
              readOnly
              aria-label="읽기 전용"
              className="w-56"
            />
          </Showcase.Row>
        </Showcase.Section>

        <Showcase.Section
          title="Bars"
          description="TextArea.Input 위의 자식은 위 바, 아래의 자식은 아래 바가 됩니다. 바의 구분선은 오류 상태에서도 중립색입니다."
        >
          <Showcase.Row label="menubar">
            <TextArea placeholder="마크다운으로 작성하세요" aria-label="본문" className="w-80">
              <div className="flex gap-1">
                <IconButton aria-label="굵게" icon={<BoldIcon />} />
                <IconButton aria-label="기울임" icon={<ItalicIcon />} />
                <IconButton aria-label="밑줄" icon={<UnderlineIcon />} />
              </div>
              <TextArea.Input />
            </TextArea>
          </Showcase.Row>
          <Showcase.Row label="actionbar">
            <TextArea
              value={message}
              onValueChange={setMessage}
              rows={1}
              maxRows={6}
              placeholder="메시지 입력..."
              aria-label="메시지"
              className="w-80"
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
          </Showcase.Row>
          <Showcase.Row label="count">
            <TextArea
              maxLength={200}
              defaultValue="200자 이내로 소개해 주세요."
              aria-label="소개"
              className="w-80"
            >
              <TextArea.Input />
              <TextArea.Count />
            </TextArea>
          </Showcase.Row>
          <Showcase.Row label="both">
            <TextArea
              placeholder="마크다운 지원"
              maxLength={500}
              aria-label="메모"
              className="w-80"
            >
              <div className="flex gap-1">
                <IconButton aria-label="굵게" icon={<BoldIcon />} />
                <IconButton aria-label="기울임" icon={<ItalicIcon />} />
              </div>
              <TextArea.Input className="font-mono" />
              <TextArea.Count />
              <Button size="tiny">저장</Button>
            </TextArea>
          </Showcase.Row>
        </Showcase.Section>

        <Showcase.Section title="Height">
          <Showcase.Row label="auto">
            <TextArea
              rows={1}
              maxRows={4}
              placeholder="내용에 맞춰 늘어납니다"
              aria-label="자동"
              className="w-80"
            />
          </Showcase.Row>
          <Showcase.Row label="resize vertical">
            <TextArea
              autoResize={false}
              resize="vertical"
              rows={3}
              placeholder="모서리를 끌어 높이를 바꿉니다"
              aria-label="세로 조절"
              className="w-80"
            />
          </Showcase.Row>
          <Showcase.Row label="resize horizontal">
            <TextArea
              autoResize={false}
              resize="horizontal"
              rows={2}
              placeholder="모서리를 끌어 너비를 바꿉니다"
              aria-label="가로 조절"
              className="w-80"
            />
          </Showcase.Row>
          <Showcase.Row label="resize both">
            <TextArea
              autoResize={false}
              resize="both"
              rows={3}
              placeholder="너비와 높이를 함께 바꿉니다"
              aria-label="양방향 조절"
              className="w-80"
            />
          </Showcase.Row>
          <Showcase.Row label="with a bottom bar">
            <TextArea
              autoResize={false}
              resize="both"
              rows={3}
              maxLength={200}
              placeholder="아래 바가 입력 칸의 모서리를 각지게 하면 손잡이도 ㄴ 자가 됩니다"
              aria-label="바 위 조절"
              className="w-80"
            >
              <TextArea.Input />
              <TextArea.Count />
            </TextArea>
          </Showcase.Row>
          <Showcase.Row label="resize rtl">
            <div dir="rtl">
              <TextArea
                autoResize={false}
                resize="both"
                rows={3}
                placeholder="손잡이가 왼쪽 아래 모서리로 옮겨 갑니다"
                aria-label="오른쪽에서 왼쪽"
                className="w-80"
              />
            </div>
          </Showcase.Row>
        </Showcase.Section>
      </Showcase>
    );
  },
};

export const AutoHeight: Story = {
  render: () => (
    <Field className="w-80">
      <Field.Label>자기소개</Field.Label>
      <TextArea rows={1} maxRows={5} placeholder="자신을 소개해 주세요" />
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '내용에 맞춰 높이가 늘고 줄어듭니다. maxRows를 넘으면 스크롤이 생깁니다. 붙여넣기, 실행 취소, 폼 reset, 창 크기 변화, 웹폰트 로딩 뒤에도 다시 잽니다.',
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

export const CharacterCount: Story = {
  render: (args) => (
    <Field className="w-80">
      <Field.Label>한 줄 소개</Field.Label>
      <Field.Description>프로필에 보입니다.</Field.Description>
      <TextArea {...args} maxLength={30} rows={2} aria-label={undefined}>
        <TextArea.Input />
        <TextArea.Count />
      </TextArea>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'TextArea.Count는 maxLength에 대한 글자 수를 보여 주고 입력의 설명에 들어갑니다. 한도에 가까워지면 입력이 멈춘 뒤 남은 글자 수를 스크린 리더에 알립니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '한 줄 소개' });
    const count = canvasElement.querySelector('[data-text-area-count]')!;
    await expect(count).toHaveTextContent('0 / 30');
    await expect(input).toHaveAccessibleDescription('프로필에 보입니다. 0 / 30');
    await userEvent.type(input, 'GIST 인포팀에서 서비스를 만듭니다. 반갑습니다');
    await expect(count).toHaveAttribute('data-near-limit');
    const status = canvas.getByRole('status');
    await waitFor(() => expect(status.textContent).toMatch(/자 남았습니다|제한에 도달했습니다/));
  },
};

export const ResizeHandle: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TextArea
        autoResize={false}
        resize="vertical"
        rows={3}
        aria-label="높이만"
        placeholder="resize=vertical (기본)"
        className="w-80"
      />
      <TextArea
        autoResize={false}
        resize="horizontal"
        rows={2}
        aria-label="너비만"
        placeholder="resize=horizontal"
        className="w-80"
      />
      <TextArea
        autoResize={false}
        resize="both"
        rows={3}
        aria-label="둘 다"
        placeholder="resize=both"
        className="w-80"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`autoResize={false}` 면 입력 칸의 끝 아래 모서리를 따라 휜 크기 조절 손잡이가 생깁니다. 모서리와 같은 중심의 호라서 모든 모드에서 같은 모양입니다. 브라우저의 CSS 손잡이와 달리 Tab 으로 가서 방향키로 바꿀 수 있고, 터치로 끌리고, 스크롤 막대는 손잡이 위에서 멈춥니다. 높이는 textarea 에, 너비는 필드 전체에 들어갑니다. Enter 나 두 번 누르기는 rows 로 정한 크기로 돌아갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const textarea = canvas.getByRole('textbox', { name: '높이만' });
    const natural = textarea.offsetHeight;
    const [height] = canvas.getAllByRole('separator', { name: '높이' });
    height!.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(textarea.offsetHeight).toBe(natural + 16));
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(textarea.offsetHeight).toBe(natural));

    const shell = canvas
      .getByRole('textbox', { name: '너비만' })
      .closest<HTMLElement>('[data-text-area]')!;
    const [width] = canvas.getAllByRole('separator', { name: '너비' });
    width!.focus();
    await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    await waitFor(() => expect(shell.style.width).toBe('256px'));

    const both = canvas.getByRole('group', { name: '크기 조절' });
    await expect(both.querySelectorAll('[role="separator"]')).toHaveLength(2);
  },
};

export const Sentinel: Story = {
  render: () => (
    <TextArea className="w-80" aria-label="본문" placeholder="본문">
      <span>위</span>
      <TextArea.Input />
      <span>아래</span>
    </TextArea>
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
