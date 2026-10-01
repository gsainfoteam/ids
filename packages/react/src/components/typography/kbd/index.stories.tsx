import { detectPlatform } from '@tanstack/react-hotkeys';
import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';

import { Kbd } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const sizes = ['standard', 'tiny'] as const;
const platforms = ['mac', 'windows', 'linux'] as const;

const meta = {
  title: 'Typography/Kbd',
  component: Kbd,
  tags: ['autodocs'],
  argTypes: {
    keys: { control: 'text' },
    size: { control: 'radio', options: sizes },
    platform: { control: 'radio', options: [undefined, ...platforms] },
  },
  args: { keys: 'Mod+Shift+K', size: 'standard' },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

const spoken = (element: Element) => {
  const parts: string[] = [];
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) parts.push(text);
    } else if ((node as Element).getAttribute?.('aria-hidden') !== 'true')
      node.childNodes.forEach(walk);
  };
  walk(element);
  return parts.join(' ');
};

const visible = (element: Element) => {
  const copy = element.cloneNode(true) as Element;
  copy.querySelectorAll('.sr-only').forEach((node) => node.remove());
  copy
    .querySelectorAll('[data-kbd-glyph]')
    .forEach((icon) => icon.replaceWith(icon.getAttribute('data-kbd-glyph')!));
  return copy.textContent;
};

export const Playground: Story = {};

const shortcuts = ['Mod+K', 'Mod+Shift+P', 'Alt+Enter', 'Control+Alt+Delete', 'Meta+E'] as const;

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Platform × Shortcut"
        description="Mod는 Mac에서 ⌘, 그 밖에서는 Ctrl입니다. Meta는 Mac에서 ⌘, Windows에서 Win, Linux에서 Super입니다. 수식 키 순서와 + 표시도 플랫폼을 따릅니다."
      >
        <Showcase.Matrix
          rows={platforms}
          columns={shortcuts}
          render={(platform, keys) => <Kbd keys={keys} platform={platform} />}
        />
      </Showcase.Section>

      <Showcase.Section title="Size">
        {sizes.map((size) => (
          <Showcase.Row key={size} label={size}>
            <Kbd size={size}>K</Kbd>
            <Kbd size={size} keys="Enter" platform="mac" />
            <Kbd size={size} keys="Escape" />
            <Kbd size={size} keys="Mod+K" platform="mac" />
            <Kbd size={size} keys="Mod+K" platform="windows" />
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section
        title="Surface"
        description="키 모양은 주변 글자색에서 옅게 칠해져 어느 배경에서도 어울립니다."
      >
        <Showcase.Row label="text">
          <p className="text-body-b3-regular">
            검색을 열려면 <Kbd keys="Mod+K" platform="mac" /> 를 누르세요.
          </p>
        </Showcase.Row>
        <Showcase.Row label="button">
          <Button>
            저장 <Kbd keys="Mod+S" platform="mac" />
          </Button>
          <Button variant="outline">
            검색 <Kbd keys="Mod+K" platform="windows" />
          </Button>
          <Button size="tiny" variant="soft">
            보내기 <Kbd keys="Enter" platform="mac" size="tiny" />
          </Button>
        </Showcase.Row>
        <Showcase.Row label="glyph text">
          <Kbd>⌘K</Kbd>
          <Kbd>⇧⌘P</Kbd>
          <Kbd>Ctrl+C</Kbd>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const PlatformAware: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Kbd keys="Mod+K" platform="mac" data-testid="mac" />
      <Kbd keys="Mod+K" platform="windows" data-testid="windows" />
      <Kbd keys="Mod+K" data-testid="auto" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '단축키를 TanStack Hotkeys와 같은 문자열(Mod+K)로 적으면 방문자의 플랫폼에 맞춰 그립니다. platform으로 고정할 수도 있습니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const mac = canvas.getByTestId('mac');
    await expect(visible(mac)).toBe('⌘K');
    await expect(spoken(mac)).toBe('커맨드 K');
    const windows = canvas.getByTestId('windows');
    await expect(visible(windows)).toBe('Ctrl+K');
    await expect(spoken(windows)).toBe('컨트롤 + K');
    const auto = canvas.getByTestId('auto');
    await expect(auto).toHaveAttribute('data-platform', detectPlatform());
  },
};

export const ModifierOrder: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Kbd keys="Control+Alt+Shift+Meta+K" platform="mac" data-testid="mac" />
      <Kbd keys="Control+Alt+Shift+Meta+K" platform="windows" data-testid="windows" />
      <Kbd keys="Control+Alt+Shift+Meta+K" platform="linux" data-testid="linux" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '수식 키는 플랫폼 메뉴 순서로 그립니다. Mac은 ⌃⌥⇧⌘, 그 밖은 Win(Super) Ctrl Alt Shift입니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(visible(canvas.getByTestId('mac'))).toBe('⌃⌥⇧⌘K');
    await expect(visible(canvas.getByTestId('windows'))).toBe('Win+Ctrl+Alt+Shift+K');
    await expect(visible(canvas.getByTestId('linux'))).toBe('Super+Ctrl+Alt+Shift+K');
  },
};

export const SymbolNames: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Kbd data-testid="command">⌘</Kbd>
      <Kbd data-testid="combo">⇧⌘P</Kbd>
      <Kbd keys="ArrowLeft" data-testid="arrow" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '⌘ ⇧ ← 같은 기호는 스크린 리더가 제대로 읽지 못합니다. 기호는 숨기고 "커맨드" 같은 이름을 대신 읽게 합니다. children으로 적은 기호에도 적용됩니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(spoken(canvas.getByTestId('command'))).toBe('커맨드');
    await expect(spoken(canvas.getByTestId('combo'))).toBe('시프트 커맨드 P');
    await expect(spoken(canvas.getByTestId('arrow'))).toBe('왼쪽 화살표');
    const glyph = canvas.getByTestId('command').querySelector('[data-kbd-glyph="⌘"]');
    await expect(glyph).toHaveAttribute('aria-hidden', 'true');
  },
};

export const Group: Story = {
  render: () => (
    <Kbd.Group size="tiny" platform="mac" data-testid="group">
      <Kbd keys="Mod" />
      <span>then</span>
      <Kbd>G</Kbd>
    </Kbd.Group>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Kbd.Group은 여러 키를 하나의 입력으로 묶습니다. 크기와 플랫폼은 안쪽 Kbd로 이어집니다.',
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
