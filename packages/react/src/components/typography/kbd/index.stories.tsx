import { expect, within } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';

import { Kbd } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const sizes = ['standard', 'tiny'] as const;
const platforms = ['apple', 'other'] as const;

const meta = {
  title: 'Typography/Kbd',
  component: Kbd,
  tags: ['autodocs'],
  argTypes: {
    keys: { control: 'text' },
    size: { control: 'radio', options: sizes },
    platform: { control: 'radio', options: [undefined, ...platforms] },
  },
  args: { keys: 'mod+shift+k', size: 'standard' },
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
  return copy.textContent;
};

export const Playground: Story = {};

const shortcuts = ['mod+k', 'shift+mod+p', 'alt+enter', 'ctrl+alt+delete'] as const;

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Platform × Shortcut"
        description="mod는 Apple 기기에서 ⌘, 그 밖에서는 Ctrl입니다. 수식 키 순서와 + 표시도 플랫폼을 따릅니다."
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
            <Kbd size={size} keys="enter" platform="apple" />
            <Kbd size={size} keys="escape" />
            <Kbd size={size} keys="mod+k" platform="apple" />
            <Kbd size={size} keys="mod+k" platform="other" />
          </Showcase.Row>
        ))}
      </Showcase.Section>

      <Showcase.Section
        title="Surface"
        description="키 모양은 주변 글자색에서 옅게 칠해져 어느 배경에서도 어울립니다."
      >
        <Showcase.Row label="text">
          <p className="text-body-b3-regular">
            검색을 열려면 <Kbd keys="mod+k" platform="apple" /> 를 누르세요.
          </p>
        </Showcase.Row>
        <Showcase.Row label="button">
          <Button>
            저장 <Kbd keys="mod+s" platform="apple" />
          </Button>
          <Button variant="outline">
            검색 <Kbd keys="mod+k" platform="other" />
          </Button>
          <Button size="tiny" variant="soft">
            보내기 <Kbd keys="enter" platform="apple" size="tiny" />
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
      <Kbd keys="mod+k" platform="apple" data-testid="apple" />
      <Kbd keys="mod+k" platform="other" data-testid="other" />
      <Kbd keys="mod+k" data-testid="auto" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '단축키를 핫키 라이브러리와 같은 문자열(mod+k)로 적으면 방문자의 플랫폼에 맞춰 그립니다. platform으로 고정할 수도 있습니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const apple = canvas.getByTestId('apple');
    await expect(visible(apple)).toBe('⌘K');
    await expect(spoken(apple)).toBe('커맨드 K');
    const other = canvas.getByTestId('other');
    await expect(visible(other)).toBe('Ctrl+K');
    await expect(spoken(other)).toBe('컨트롤 + K');
    const auto = canvas.getByTestId('auto');
    const isApple = /mac|iphone|ipad|ipod/i.test(navigator.platform);
    await expect(auto).toHaveAttribute('data-platform', isApple ? 'apple' : 'other');
  },
};

export const ModifierOrder: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Kbd keys="k+shift+mod" platform="apple" data-testid="apple" />
      <Kbd keys="k+shift+mod" platform="other" data-testid="other" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '수식 키는 어떤 순서로 적어도 플랫폼 메뉴 순서로 정렬됩니다. Apple은 ⌃⌥⇧⌘, 그 밖은 Win Ctrl Alt Shift입니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(visible(canvas.getByTestId('apple'))).toBe('⇧⌘K');
    await expect(visible(canvas.getByTestId('other'))).toBe('Ctrl+Shift+K');
  },
};

export const SymbolNames: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Kbd data-testid="command">⌘</Kbd>
      <Kbd data-testid="combo">⇧⌘P</Kbd>
      <Kbd keys="left" data-testid="arrow" />
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
    const glyph = within(canvas.getByTestId('command')).getByText('⌘');
    await expect(glyph).toHaveAttribute('aria-hidden', 'true');
  },
};

export const Group: Story = {
  render: () => (
    <Kbd.Group size="tiny" platform="apple" data-testid="group">
      <Kbd keys="mod" />
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
    await expect(caps[0]).toHaveTextContent('⌘');
  },
};
