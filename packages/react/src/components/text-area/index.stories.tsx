import { useState, type ReactNode } from 'react';

import {
  BoldIcon,
  ItalicIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PhotoIcon,
  UnderlineIcon,
} from '@heroicons/react/24/outline';
import { expect } from 'storybook/test';

import { Button } from '../button';
import { IconButton } from '../icon-button';
import { Label } from '../label';

import { TextArea } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'filled', 'underline'] as const;
const sizes = ['standard', 'tiny'] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold tracking-wide text-(--ids-color-on-muted) uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

const meta: Meta<typeof TextArea> = {
  title: 'Components/TextArea',
  component: TextArea,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: [...variants] },
    size: { control: 'radio', options: [...sizes] },
    disabled: { control: 'boolean' },
    autoResize: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  args: {
    variant: 'outline',
    size: 'standard',
    placeholder: '내용을 입력하세요',
  },
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-8">
      <Section title="Bare">
        <TextArea placeholder="내용을 입력하세요" />
      </Section>

      <Section title="Size">
        <div className="flex flex-col gap-3">
          {sizes.map((size) => (
            <TextArea key={size} size={size} placeholder={`${size} area`} />
          ))}
        </div>
      </Section>

      <Section title="Variant">
        <div className="flex flex-col gap-3">
          {variants.map((variant) => (
            <TextArea key={variant} variant={variant} placeholder={`${variant} area`} />
          ))}
        </div>
      </Section>

      <Section title="Menubar (top)">
        <TextArea placeholder="마크다운으로 작성하세요">
          <div className="flex gap-1">
            <IconButton variant="ghost" aria-label="굵게" icon={<BoldIcon />} />
            <IconButton variant="ghost" aria-label="기울임" icon={<ItalicIcon />} />
            <IconButton variant="ghost" aria-label="밑줄" icon={<UnderlineIcon />} />
          </div>
          <TextArea.Input />
        </TextArea>
      </Section>

      <Section title="Actionbar (bottom)">
        <ChatComposer />
      </Section>

      <Section title="Counter (bottom)">
        <CountedArea />
      </Section>

      <Section title="Menubar + actionbar">
        <TextArea placeholder="마크다운 지원">
          <div className="flex gap-1">
            <IconButton variant="ghost" aria-label="굵게" icon={<BoldIcon />} />
            <IconButton variant="ghost" aria-label="기울임" icon={<ItalicIcon />} />
          </div>
          <TextArea.Input className="font-mono" />
          <div className="flex w-full items-center justify-between">
            <span className="text-body-b3-regular">마크다운 지원</span>
            <Button size="tiny">저장</Button>
          </div>
        </TextArea>
      </Section>

      <Section title="Fixed height with a resize handle">
        <TextArea autoResize={false} resize="vertical" rows={4} placeholder="직접 늘려보세요" />
      </Section>

      <Section title="Disabled">
        <TextArea disabled defaultValue="수정 불가" />
      </Section>
    </div>
  ),
};

export const AutoHeight: Story = {
  render: () => (
    <div className="flex max-w-xs flex-col gap-2">
      <Label htmlFor="text-area-bio">자기소개</Label>
      <TextArea id="text-area-bio" rows={1} maxRows={5} placeholder="자신을 소개해주세요" />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '자기소개' });
    const start = input.clientHeight;

    await userEvent.type(input, '한 줄\n두 줄\n세 줄');
    const grown = input.clientHeight;
    await expect(grown).toBeGreaterThan(start);
    await expect(input.scrollHeight).toBe(grown);

    await userEvent.type(input, '\n네 줄\n다섯 줄\n여섯 줄\n일곱 줄');
    await expect(input.clientHeight).toBeLessThan(input.scrollHeight);
    await expect(input.clientHeight).toBe(grown + 2 * 22);
  },
};

export const Sentinel: Story = {
  render: () => (
    <TextArea className="max-w-xs" aria-label="본문" placeholder="본문">
      <span>위</span>
      <TextArea.Input />
      <span>아래</span>
    </TextArea>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: '본문' });
    const root = input.closest('[data-text-area]')!;

    await expect(root.querySelector('[data-text-area-top]')).toHaveTextContent('위');
    await expect(root.querySelector('[data-text-area-bottom]')).toHaveTextContent('아래');
    await expect(input.previousElementSibling).toHaveAttribute('data-text-area-top');
    await expect(input.nextElementSibling).toHaveAttribute('data-text-area-bottom');
  },
};

export const WithLabel: Story = {
  render: () => (
    <Label className="flex max-w-xs flex-col gap-2">
      메모
      <TextArea name="memo" placeholder="메모를 입력하세요" />
    </Label>
  ),
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '메모' });
    await userEvent.click(canvas.getByText('메모'));
    await expect(input).toHaveFocus();
  },
};

function ChatComposer() {
  const [message, setMessage] = useState('');

  return (
    <TextArea
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      rows={1}
      maxRows={6}
      placeholder="메시지 입력..."
      aria-label="메시지"
    >
      <TextArea.Input />
      <div className="flex w-full items-center justify-between">
        <div className="flex gap-1">
          <IconButton variant="ghost" aria-label="첨부" icon={<PaperClipIcon />} />
          <IconButton variant="ghost" aria-label="이미지" icon={<PhotoIcon />} />
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
  );
}

function CountedArea() {
  const [value, setValue] = useState('');

  return (
    <TextArea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      maxLength={200}
      placeholder="200자 이내로 작성하세요"
      aria-label="소개"
    >
      <TextArea.Input />
      <div className="flex w-full justify-end">
        <span className="text-body-b3-regular">{value.length} / 200</span>
      </div>
    </TextArea>
  );
}
