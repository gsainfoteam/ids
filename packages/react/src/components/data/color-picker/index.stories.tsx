import { useState } from 'react';

import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { ColorPicker } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const palette = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'];

const meta = {
  title: 'Data/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
  argTypes: {
    format: { control: 'radio', options: ['hex', 'rgb', 'hsl', 'oklch'] },
    size: { control: 'radio', options: ['standard', 'tiny'] },
    alpha: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
  args: {
    defaultValue: '#3B82F6',
    format: 'hex',
    alpha: false,
    size: 'standard',
    swatches: palette,
    onValueChange: fn(),
  },
  render: (args) => (
    <div className="w-72">
      <ColorPicker {...args} />
    </div>
  ),
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const areaInput = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLInputElement>('[data-color-picker-area] input')!;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Default"
        description="채도와 밝기 영역, 색조, (alpha 면) 투명도, 값 입력, 복사, 팔레트가 기본 구성입니다. 스포이트는 EyeDropper API 가 있는 브라우저에서만 보입니다."
      >
        <Showcase.Row className="items-start">
          <div className="w-64">
            <ColorPicker defaultValue="#3B82F6" swatches={palette} aria-label="기본" />
          </div>
          <div className="w-64">
            <ColorPicker
              defaultValue="#F97316CC"
              alpha
              swatches={['#F9731680', '#22C55E', 'rgba(59, 130, 246, 0.4)']}
              aria-label="투명도"
            />
          </div>
          <div className="w-56">
            <ColorPicker
              defaultValue="hsl(280, 70%, 55%)"
              format="hsl"
              size="tiny"
              aria-label="tiny"
            />
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Composition" description="part 를 골라 두면 그것만 그립니다.">
        <Showcase.Row label="compact" className="items-start">
          <div className="w-64">
            <ColorPicker defaultValue="#22C55E" aria-label="간단히">
              <ColorPicker.HueSlider />
              <ColorPicker.Input />
            </ColorPicker>
          </div>
        </Showcase.Row>
        <Showcase.Row label="swatches">
          <div className="w-64">
            <ColorPicker defaultValue="#8B5CF6" swatches={palette} aria-label="팔레트만">
              <ColorPicker.Swatches />
            </ColorPicker>
          </div>
        </Showcase.Row>
        <Showcase.Row label="oklch" className="items-start">
          <div className="w-64">
            <ColorPicker defaultValue="oklch(0.65 0.2 145)" format="oklch" aria-label="oklch">
              <ColorPicker.HueSlider />
              <ColorPicker.Input />
            </ColorPicker>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="empty" className="items-start">
          <div className="w-64">
            <ColorPicker aria-label="비어 있음" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="disabled" className="items-start">
          <div className="w-64">
            <ColorPicker defaultValue="#EF4444" disabled aria-label="비활성" />
          </div>
        </Showcase.Row>
        <Showcase.Row label="readOnly" className="items-start">
          <div className="w-64">
            <ColorPicker
              defaultValue="#EF4444"
              readOnly
              swatches={palette}
              aria-label="읽기 전용"
            />
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const Keyboard: Story = {
  args: { defaultValue: '#FF0000' },
  parameters: {
    docs: {
      description: {
        story:
          '영역에 포커스를 두면 ← → 가 채도를, ↑ ↓ 가 밝기를 1% 씩 바꿉니다. Shift 를 누르면 10% 씩입니다. 색조와 투명도 슬라이더는 ← → ↑ ↓ PageUp PageDown Home End 를 받습니다. 스크린 리더에는 두 축이 각각 슬라이더로 읽힙니다.',
      },
    },
  },
  play: async ({ canvasElement, canvas, userEvent, args }) => {
    areaInput(canvasElement).focus();
    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('#E60000');
    await expect(areaInput(canvasElement)).toHaveAttribute('aria-valuetext', '채도 100%, 밝기 90%');
    const hue = canvas.getByRole('slider', { name: '색조' });
    hue.focus();
    await userEvent.keyboard('{PageUp}');
    await expect(hue).toHaveAttribute('aria-valuetext', '10도');
    await userEvent.keyboard('{End}');
    await expect(hue).toHaveAttribute('aria-valuetext', '360도');
  },
};

export const TextInput: Story = {
  args: { defaultValue: '#3B82F6' },
  parameters: {
    docs: {
      description: {
        story:
          '값을 입력하는 동안은 초안이라 영역이 따라 움직이지 않습니다. Enter 나 포커스를 옮길 때 반영하고, 읽을 수 없으면 되돌립니다. #을 빼고 쳐도 읽습니다. 초안이 있을 때 Esc 는 초안만 버립니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const input = canvas.getByRole('textbox', { name: '색상 값' });
    await userEvent.clear(input);
    await userEvent.type(input, '22c55e');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('#22C55E');
    await expect(input).toHaveValue('#22C55E');
    await userEvent.clear(input);
    await userEvent.type(input, 'nope');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('#22C55E');
  },
};

export const Swatches: Story = {
  args: { defaultValue: '#F97316' },
  parameters: {
    docs: {
      description: {
        story:
          '팔레트는 native 라디오의 RadioGroup 이라 Tab 한 번으로 들어가고 나옵니다. ← → 로 옆 색을 고르고, 끝에서는 반대편으로 돕니다. Home 과 End 는 처음과 끝 색입니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const orange = canvas.getByRole('radio', { name: '#F97316' });
    await expect(orange).toBeChecked();
    orange.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('#EAB308');
    await expect(canvas.getByRole('radio', { name: '#EAB308' })).toHaveFocus();
    await userEvent.keyboard('{Home}{ArrowLeft}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('#EC4899');
  },
};

export const Copy: Story = {
  render: function Render() {
    const [value, setValue] = useState('#8B5CF6');

    return (
      <div className="w-72">
        <ColorPicker value={value} onValueChange={setValue} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '복사 버튼은 지금 값을 클립보드에 넣고, 잠깐 체크로 바뀌며 스크린 리더에 알립니다. Clipboard API 가 없는 곳에서는 보이지 않습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const copied: string[] = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (text: string) => void copied.push(text) },
    });
    await userEvent.click(canvas.getByRole('button', { name: '색상 값 복사' }));
    await waitFor(() => expect(copied).toEqual(['#8B5CF6']));
    await expect(canvas.getByRole('status')).toHaveTextContent('복사했습니다');
  },
};
