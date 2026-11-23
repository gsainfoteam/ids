import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Kbd } from '../kbd';

import { KbdGroup } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const sizes = ['standard', 'tiny'] as const;
const platforms = ['mac', 'windows', 'linux'] as const;

const visible = (element: Element) => {
  const copy = element.cloneNode(true) as Element;
  copy.querySelectorAll('.sr-only').forEach((node) => node.remove());
  copy
    .querySelectorAll('[data-kbd-glyph]')
    .forEach((icon) => icon.replaceWith(icon.getAttribute('data-kbd-glyph')!));
  return copy.textContent;
};

const meta = {
  title: 'Typography/KbdGroup',
  component: KbdGroup,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'radio', options: sizes },
    platform: { control: 'radio', options: [undefined, ...platforms] },
  },
  args: { size: 'standard' },
  render: (args) => (
    <KbdGroup {...args}>
      <Kbd keys="Mod" />
      <span>then</span>
      <Kbd>G</Kbd>
    </KbdGroup>
  ),
} satisfies Meta<typeof KbdGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Usage: Story = {
  render: () => (
    <KbdGroup>
      <Kbd keys="Mod" />
      <span>then</span>
      <Kbd>G</Kbd>
    </KbdGroup>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Platform × Size"
        description="size 와 platform 은 안쪽 Kbd 로 이어집니다."
      >
        <Showcase.Matrix
          rows={platforms}
          columns={sizes}
          render={(platform, size) => (
            <KbdGroup size={size} platform={platform}>
              <Kbd keys="Mod" />
              <span>then</span>
              <Kbd>G</Kbd>
            </KbdGroup>
          )}
        />
      </Showcase.Section>

      <Showcase.Section
        title="Sequence"
        description="keys 하나로 적을 수 없는 연속 입력을 손으로 적습니다."
      >
        <Showcase.Row label="chord">
          <KbdGroup platform="mac">
            <Kbd keys="Mod+K" />
            <Kbd keys="Mod+S" />
          </KbdGroup>
        </Showcase.Row>
        <Showcase.Row label="text">
          <p className="text-body-b3-regular">
            설정을 열려면{' '}
            <KbdGroup platform="windows">
              <Kbd>G</Kbd>
              <span>then</span>
              <Kbd>S</Kbd>
            </KbdGroup>{' '}
            를 누르세요.
          </p>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const SetSizeAndPlatformForEveryKey: Story = {
  render: () => (
    <KbdGroup size="tiny" platform="mac" data-testid="group">
      <Kbd keys="Mod" />
      <span>then</span>
      <Kbd>G</Kbd>
    </KbdGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'KbdGroup은 여러 키를 하나의 입력으로 묶습니다. 크기와 플랫폼은 안쪽 Kbd로 이어집니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const group = canvas.getByTestId('group');
    await expect(group.tagName).toBe('KBD');
    const caps = group.querySelectorAll('kbd[data-kbd]');
    await expect(caps).toHaveLength(2);
    for (const cap of caps) await expect(cap).toHaveAttribute('data-size', 'tiny');
    await expect(visible(caps[0]!)).toBe('⌘');
  },
};
