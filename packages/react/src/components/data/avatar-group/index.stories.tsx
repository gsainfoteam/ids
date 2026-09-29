import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Avatar } from '../avatar';

import { AvatarGroup } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const layouts = ['stack', 'inline'] as const;
const sizes = ['standard', 'tiny'] as const;

function photo(hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" fill="hsl(${hue} 70% 78%)"/><circle cx="80" cy="66" r="30" fill="hsl(${hue} 40% 36%)"/><path d="M22 160c6-36 31-54 58-54s52 18 58 54z" fill="hsl(${hue} 40% 36%)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const MEMBERS = [
  { name: 'Alice Kim', src: photo(210) },
  { name: 'Bob Lee', src: photo(30) },
  { name: 'Carol Park' },
  { name: '류현승', src: photo(140) },
  { name: 'Eve Choi' },
];

const meta = {
  title: 'Data/AvatarGroup',
  component: AvatarGroup,
  tags: ['autodocs'],
  argTypes: {
    layout: { control: 'radio', options: layouts },
    stacking: { control: 'radio', options: ['first-on-top', 'last-on-top'] },
    size: { control: 'radio', options: sizes },
    shape: { control: 'radio', options: ['circle', 'square'] },
    max: { control: { type: 'number', min: 1 } },
    total: { control: { type: 'number', min: 0 } },
  },
  args: {
    'aria-label': '회의 참석자',
    max: 3,
    layout: 'stack',
    stacking: 'first-on-top',
    size: 'standard',
    shape: 'circle',
  },
  render: (args) => (
    <AvatarGroup {...args}>
      {MEMBERS.map((member) => (
        <Avatar key={member.name} src={member.src} name={member.name} />
      ))}
    </AvatarGroup>
  ),
} satisfies Meta<typeof AvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Layout × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={layouts}
          render={(size, layout) => (
            <AvatarGroup layout={layout} size={size} max={3} aria-label={`${layout} ${size}`}>
              {MEMBERS.map((member) => (
                <Avatar key={member.name} src={member.src} name={member.name} />
              ))}
            </AvatarGroup>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Stacking" description="어느 쪽 아바타가 위에 오는지 정합니다.">
        <Showcase.Row label="first-on-top">
          <AvatarGroup aria-label="first-on-top">
            {MEMBERS.slice(0, 4).map((member) => (
              <Avatar key={member.name} src={member.src} name={member.name} />
            ))}
          </AvatarGroup>
        </Showcase.Row>
        <Showcase.Row label="last-on-top">
          <AvatarGroup stacking="last-on-top" aria-label="last-on-top">
            {MEMBERS.slice(0, 4).map((member) => (
              <Avatar key={member.name} src={member.src} name={member.name} />
            ))}
          </AvatarGroup>
        </Showcase.Row>
        <Showcase.Row label="square">
          <AvatarGroup shape="square" aria-label="square">
            {MEMBERS.slice(0, 4).map((member) => (
              <Avatar key={member.name} src={member.src} name={member.name} />
            ))}
          </AvatarGroup>
          <AvatarGroup shape="square" size="tiny" aria-label="square tiny">
            {MEMBERS.slice(0, 4).map((member) => (
              <Avatar key={member.name} src={member.src} name={member.name} />
            ))}
          </AvatarGroup>
        </Showcase.Row>
        <Showcase.Row label="rtl">
          <div dir="rtl" className="flex gap-6">
            <AvatarGroup max={3} aria-label="rtl">
              {MEMBERS.map((member) => (
                <Avatar key={member.name} src={member.src} name={member.name} />
              ))}
            </AvatarGroup>
            <AvatarGroup shape="square" stacking="last-on-top" aria-label="rtl square">
              {MEMBERS.slice(0, 3).map((member) => (
                <Avatar key={member.name} src={member.src} name={member.name} />
              ))}
            </AvatarGroup>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Any background"
        description="겹친 쪽은 투명하게 오려내므로 어떤 배경에서도 틈이 배경색 그대로 보입니다."
      >
        <Showcase.Row label="muted">
          <div className="rounded-standard bg-(--ids-color-muted) p-3">
            <AvatarGroup max={4} aria-label="muted">
              {MEMBERS.map((member) => (
                <Avatar key={member.name} src={member.src} name={member.name} />
              ))}
            </AvatarGroup>
          </div>
        </Showcase.Row>
        <Showcase.Row label="primary">
          <div className="rounded-standard bg-(--ids-color-primary) p-3">
            <AvatarGroup max={4} aria-label="primary">
              {MEMBERS.map((member) => (
                <Avatar key={member.name} src={member.src} name={member.name} />
              ))}
            </AvatarGroup>
          </div>
        </Showcase.Row>
        <Showcase.Row label="gradient">
          <div className="rounded-standard bg-linear-to-r from-fuchsia-500 via-amber-300 to-emerald-400 p-3">
            <AvatarGroup max={4} aria-label="gradient">
              {MEMBERS.map((member) => (
                <Avatar key={member.name} src={member.src} name={member.name} />
              ))}
            </AvatarGroup>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Overflow">
        <Showcase.Row label="max 2">
          <AvatarGroup max={2} aria-label="max 2">
            {MEMBERS.map((member) => (
              <Avatar key={member.name} src={member.src} name={member.name} />
            ))}
          </AvatarGroup>
        </Showcase.Row>
        <Showcase.Row label="total 128">
          <AvatarGroup total={128} aria-label="total 128">
            {MEMBERS.slice(0, 3).map((member) => (
              <Avatar key={member.name} src={member.src} name={member.name} />
            ))}
          </AvatarGroup>
        </Showcase.Row>
        <Showcase.Row label="custom">
          <AvatarGroup max={2} aria-label="custom overflow">
            <AvatarGroup.Overflow className="bg-(--ids-color-primary) text-(--ids-color-on-primary)">
              {({ count }) => `${count}+`}
            </AvatarGroup.Overflow>
            {MEMBERS.map((member) => (
              <Avatar key={member.name} src={member.src} name={member.name} />
            ))}
          </AvatarGroup>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

const avatars = (element: HTMLElement) => [
  ...element.querySelectorAll<HTMLElement>('[data-avatar-group] > [data-avatar]'),
];

export const Overflow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`max` 를 넘는 사람은 `+N` 하나로 모읍니다. `+N` 은 "외 N명" 이라는 이름을 가진 이미지라서 스크린 리더가 숫자만 읽지 않습니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: '회의 참석자' });
    await expect(canvas.getAllByRole('img')).toHaveLength(4);
    await expect(canvas.getByRole('img', { name: '외 2명' })).toHaveTextContent('+2');
    await expect(group).toHaveAttribute('data-layout', 'stack');
  },
};

export const Total: Story = {
  args: { max: undefined, total: 128 },
  render: (args) => (
    <AvatarGroup {...args}>
      {MEMBERS.slice(0, 3).map((member) => (
        <Avatar key={member.name} src={member.src} name={member.name} />
      ))}
    </AvatarGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '서버가 앞의 몇 명과 전체 수만 줄 때는 `total` 을 넘깁니다. 그린 아바타를 뺀 나머지가 `+N` 이 됩니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: '외 125명' })).toHaveTextContent('+125');
  },
};

export const Stacking: Story = {
  args: { max: 3 },
  parameters: {
    docs: {
      description: {
        story:
          '`first-on-top`(기본)은 앞사람이 위에 오고, `last-on-top` 은 뒷사람이 위에 옵니다. 아래에 깔린 아바타는 겹친 쪽이 오려져 있어 틈으로 배경이 보입니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const cutouts = avatars(canvasElement).map((avatar) => avatar.dataset.cutout ?? 'none');
    await expect(cutouts).toEqual(['none', 'start', 'start', 'start']);
    await expect(getComputedStyle(avatars(canvasElement)[1]!).maskImage).toContain(
      'radial-gradient',
    );
    await expect(getComputedStyle(avatars(canvasElement)[0]!).maskImage).toBe('none');
  },
};

export const LastOnTop: Story = {
  args: { max: 3, stacking: 'last-on-top' },
  play: async ({ canvasElement }) => {
    const cutouts = avatars(canvasElement).map((avatar) => avatar.dataset.cutout ?? 'none');
    await expect(cutouts).toEqual(['end', 'end', 'end', 'none']);
  },
};

export const SizeFromGroup: Story = {
  render: () => (
    <AvatarGroup size="tiny" shape="square" aria-label="크기 전파">
      <Avatar name="Alice Kim" />
      <Avatar name="Bob Lee" size="standard" shape="circle" />
    </AvatarGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: '그룹의 `size` 와 `shape` 를 아바타가 따르고, 아바타에 직접 준 값이 이깁니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const alice = canvas.getByRole('img', { name: 'Alice Kim' });
    const bob = canvas.getByRole('img', { name: 'Bob Lee' });
    await expect(alice).toHaveAttribute('data-size', 'tiny');
    await expect(alice).toHaveAttribute('data-shape', 'square');
    await expect(bob).toHaveAttribute('data-size', 'standard');
    await expect(bob).toHaveAttribute('data-shape', 'circle');
  },
};

export const CustomOverflow: Story = {
  render: () => (
    <AvatarGroup max={2} overflowLabel={(count) => `and ${count} more`} aria-label="Reviewers">
      <AvatarGroup.Overflow>{({ count }) => `${count}+`}</AvatarGroup.Overflow>
      {MEMBERS.map((member) => (
        <Avatar key={member.name} src={member.src} name={member.name} />
      ))}
    </AvatarGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`AvatarGroup.Overflow` 를 앞에 두면 `+N` 이 앞에 옵니다. children은 남은 수를 받는 함수가 될 수 있고, 이름은 `overflowLabel` 로 바꿉니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    const overflow = canvas.getByRole('img', { name: 'and 3 more' });
    await expect(overflow).toHaveTextContent('3+');
    await expect(avatars(canvasElement)[0]).toBe(overflow);
  },
};
