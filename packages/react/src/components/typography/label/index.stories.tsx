import { useState } from 'react';

import { expect, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';
import { Checkbox } from '../../form/checkbox';
import { Slider } from '../../form/slider';
import { Switch } from '../../form/switch';
import { TextField } from '../../form/text-field';

import { Label } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Typography/Label',
  component: Label,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'radio', options: ['standard', 'tiny'] },
    required: { control: 'radio', options: [undefined, true, false] },
    disabled: { control: 'radio', options: [undefined, true, false] },
    invalid: { control: 'boolean' },
  },
  args: { children: '이름', htmlFor: 'label-playground' },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div className="flex max-w-xs flex-col gap-2">
      <Label {...args} />
      <TextField id="label-playground" placeholder="이름을 입력하세요" />
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Size × State">
        {(['standard', 'tiny'] as const).map((size) => (
          <Showcase.Row key={size} label={size} className="items-start gap-8">
            <div className="flex w-48 flex-col gap-2">
              <Label size={size} htmlFor={`gallery-${size}-plain`}>
                이메일
              </Label>
              <TextField id={`gallery-${size}-plain`} size={size} />
            </div>
            <div className="flex w-48 flex-col gap-2">
              <Label size={size} htmlFor={`gallery-${size}-required`}>
                이메일
              </Label>
              <TextField id={`gallery-${size}-required`} size={size} required />
            </div>
            <div className="flex w-48 flex-col gap-2">
              <Label size={size} htmlFor={`gallery-${size}-disabled`}>
                이메일
              </Label>
              <TextField id={`gallery-${size}-disabled`} size={size} disabled />
            </div>
            <div className="flex w-48 flex-col gap-2">
              <Label size={size} htmlFor={`gallery-${size}-invalid`} invalid>
                이메일
              </Label>
              <TextField id={`gallery-${size}-invalid`} size={size} invalid />
            </div>
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section
        title="Wrapping"
        description="컨트롤을 감싸면 htmlFor 없이 연결되고, 글자를 눌러도 컨트롤이 반응합니다."
      >
        <Showcase.Row label="checkbox">
          <Label>
            <Checkbox defaultChecked />
            알림 받기
          </Label>
          <Label>
            <Checkbox required />
            약관 동의
          </Label>
          <Label>
            <Checkbox disabled />
            사용할 수 없음
          </Label>
        </Showcase.Row>
        <Showcase.Row label="switch">
          <Label>
            <Switch />
            다크 모드
          </Label>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Custom control"
        description="role로 만든 위젯도 htmlFor로 이름이 붙고 글자를 누르면 포커스가 갑니다."
      >
        <Showcase.Row label="slider">
          <div className="flex w-64 flex-col gap-3">
            <Label htmlFor="gallery-volume">볼륨</Label>
            <Slider id="gallery-volume" defaultValue={40} />
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const HtmlFor: Story = {
  render: () => (
    <div className="flex max-w-xs flex-col gap-2">
      <Label htmlFor="label-email">이메일</Label>
      <TextField id="label-email" type="email" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'htmlFor와 id로 연결하면 라벨이 입력의 이름이 되고, 라벨을 누르면 입력으로 포커스가 갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: '이메일' });
    await userEvent.click(canvas.getByText('이메일'));
    await expect(input).toHaveFocus();
  },
};

export const WrapsControl: Story = {
  render: () => (
    <Label>
      <Checkbox />
      알림 받기
    </Label>
  ),
  parameters: {
    docs: {
      description: {
        story: '컨트롤을 감싸면 글자를 눌러도 체크박스가 바뀝니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const checkbox = canvas.getByRole('checkbox', { name: '알림 받기' });
    await userEvent.click(canvas.getByText('알림 받기'));
    await expect(checkbox).toBeChecked();
  },
};

export const MirrorsControl: Story = {
  render: function Render() {
    const [disabled, setDisabled] = useState(false);
    const [required, setRequired] = useState(false);

    return (
      <div className="flex max-w-xs flex-col gap-3">
        <div className="flex gap-2">
          <Button size="tiny" variant="outline" onClick={() => setDisabled((value) => !value)}>
            disabled 바꾸기
          </Button>
          <Button size="tiny" variant="outline" onClick={() => setRequired((value) => !value)}>
            required 바꾸기
          </Button>
        </div>
        <Label htmlFor="label-mirror" data-testid="label">
          닉네임
        </Label>
        <TextField id="label-mirror" disabled={disabled} required={required} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '라벨은 연결된 컨트롤의 disabled와 required를 따라갑니다. 컨트롤이 바뀌면 라벨도 바로 흐려지거나 * 가 붙습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const label = canvas.getByTestId('label');
    await expect(label).not.toHaveAttribute('data-disabled');
    await userEvent.click(canvas.getByRole('button', { name: 'disabled 바꾸기' }));
    await waitFor(() => expect(label).toHaveAttribute('data-disabled'));
    await userEvent.click(canvas.getByRole('button', { name: 'required 바꾸기' }));
    await waitFor(() => expect(label).toHaveAttribute('data-required'));
    await expect(label.querySelector('[data-label-required]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  },
};

export const CustomControl: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-3">
      <Label htmlFor="label-volume">볼륨</Label>
      <Slider id="label-volume" defaultValue={40} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '<div role="slider">처럼 브라우저가 라벨로 인식하지 않는 위젯도 이름이 붙고, 라벨을 누르면 포커스가 갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const slider = canvas.getByRole('slider', { name: '볼륨' });
    await userEvent.click(canvas.getByText('볼륨'));
    await expect(slider).toHaveFocus();
  },
};

export const AsChild: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-3">
      <Label asChild htmlFor="label-as-child" required>
        <span id="label-as-child-text">밝기</span>
      </Label>
      <Slider id="label-as-child" defaultValue={60} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'asChild로 자식 요소를 라벨로 그립니다. 자식의 id를 그대로 쓰고, label이 아닌 요소도 컨트롤의 이름이 되며 누르면 포커스가 갑니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const text = canvas.getByText('밝기');
    await expect(text).toHaveAttribute('data-label');
    await expect(text).toHaveAttribute('id', 'label-as-child-text');
    const slider = canvas.getByRole('slider', { name: '밝기' });
    await userEvent.click(text);
    await expect(slider).toHaveFocus();
  },
};
