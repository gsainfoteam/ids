import { useState } from 'react';

import { BuildingOffice2Icon } from '@heroicons/react/24/solid';
import { expect, fn, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';

import { Avatar, initialsOf } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const shapes = ['circle', 'square'] as const;
const sizes = ['standard', 'tiny'] as const;

// Inline SVG portraits load instantly and never depend on the network.
function photo(hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" fill="hsl(${hue} 70% 78%)"/><circle cx="80" cy="66" r="30" fill="hsl(${hue} 40% 36%)"/><path d="M22 160c6-36 31-54 58-54s52 18 58 54z" fill="hsl(${hue} 40% 36%)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const PHOTO = photo(210);
const BROKEN = 'data:image/png;base64,AAAA';

const meta = {
  title: 'Data/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    shape: { control: 'radio', options: shapes },
    size: { control: 'radio', options: sizes },
  },
  args: { src: PHOTO, name: 'Alice Kim', shape: 'circle', size: 'standard', onStatusChange: fn() },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Shape × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={shapes}
          render={(size, shape) => (
            <div className="flex items-center gap-2">
              <Avatar
                src={photo(shape === 'circle' ? 210 : 30)}
                name="Alice Kim"
                shape={shape}
                size={size}
              />
              <Avatar name="Alice Kim" shape={shape} size={size} />
              <Avatar name="류현승" shape={shape} size={size} />
              <Avatar alt="이름 없음" shape={shape} size={size} />
            </div>
          )}
        />
      </Showcase.Section>

      <Showcase.Section
        title="Fallback"
        description="이미지가 없거나 깨지면 이름의 이니셜, 이름도 없으면 사람 아이콘을 그립니다."
      >
        <Showcase.Row label="image">
          <Avatar src={PHOTO} name="Alice Kim" />
        </Showcase.Row>
        <Showcase.Row label="broken">
          <Avatar src={BROKEN} name="Bob Lee" />
          <Avatar src={BROKEN} name="류현승" />
        </Showcase.Row>
        <Showcase.Row label="no name">
          <Avatar alt="알 수 없는 사용자" />
        </Showcase.Row>
        <Showcase.Row label="custom">
          <Avatar name="Acme" shape="square">
            <Avatar.Fallback>
              <BuildingOffice2Icon />
            </Avatar.Fallback>
          </Avatar>
          <Avatar
            name="Design Team"
            className="bg-(--ids-color-primary) text-(--ids-color-on-primary)"
          />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Custom size"
        description="크기를 바꿔도 이니셜이 비율에 맞게 커집니다."
      >
        <Showcase.Row label="className">
          <Avatar name="Alice Kim" className="size-16" />
          <Avatar name="류현승" className="size-20" />
          <Avatar src={PHOTO} name="Alice Kim" className="size-20" />
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

function StatusExample() {
  const [src, setSrc] = useState(PHOTO);
  const [log, setLog] = useState<string[]>([]);
  return (
    <div className="flex flex-col items-start gap-4">
      <Avatar
        src={src}
        name="Alice Kim"
        className={(state) =>
          state.status === 'loaded' ? 'ring-2 ring-(--ids-color-success)' : undefined
        }
        onStatusChange={(status) => setLog((prev) => [...prev, status])}
      />
      <div className="flex gap-2">
        <Button size="tiny" variant="outline" onClick={() => setSrc(BROKEN)}>
          깨진 이미지로
        </Button>
        <Button size="tiny" variant="outline" onClick={() => setSrc(photo(140))}>
          다른 사진으로
        </Button>
      </div>
      <output aria-label="상태 기록" className="text-body-b3-regular font-mono">
        {log.join(' → ')}
      </output>
    </div>
  );
}

export const LoadingStatus: Story = {
  render: () => <StatusExample />,
  parameters: {
    docs: {
      description: {
        story:
          '이미지 상태는 `loading` / `loaded` / `error` 입니다. 루트의 `data-status` 와 `onStatusChange`, 상태를 받는 `className` 으로 쓸 수 있습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const avatar = () => canvasElement.querySelector('[data-avatar]')!;
    await waitFor(() => expect(avatar()).toHaveAttribute('data-status', 'loaded'));
    await userEvent.click(canvas.getByRole('button', { name: '깨진 이미지로' }));
    await waitFor(() => expect(avatar()).toHaveAttribute('data-status', 'error'));
    await expect(canvas.getByRole('img', { name: 'Alice Kim' })).toHaveTextContent('AK');
    await expect(avatar().querySelector('img')).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: '다른 사진으로' }));
    await waitFor(() => expect(avatar()).toHaveAttribute('data-status', 'loaded'));
    await waitFor(() =>
      expect(canvas.getByLabelText('상태 기록')).toHaveTextContent(
        'loading → loaded → loading → error → loading → loaded',
      ),
    );
  },
};

export const Fallback: Story = {
  args: { src: BROKEN, name: '류현승' },
  parameters: {
    docs: {
      description: {
        story:
          '깨진 이미지는 DOM에서 빠지고 이니셜이 그 자리를 채웁니다. 이미지를 불러오는 동안에는 600ms를 기다렸다가 이니셜을 보여 주므로, 빨리 오는 이미지 앞에 글자가 번쩍이지 않습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-avatar]')).toHaveAttribute('data-status', 'error'),
    );
    await expect(canvas.getByRole('img', { name: '류현승' })).toHaveTextContent('류');
  },
};

export const Decorative: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Avatar src={PHOTO} name="Alice Kim" alt="" size="tiny" />
      <span className="text-body-b3-medium">Alice Kim</span>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '이름을 바로 옆에 적었다면 `alt=""` 로 장식용임을 알립니다. 스크린 리더가 이름을 두 번 읽지 않습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.queryByRole('img')).toBeNull();
    await expect(canvasElement.querySelector('[data-avatar]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  },
};

const NAMES = [
  'Alice Kim',
  'ada lovelace king',
  '류현승',
  '홍 길동',
  'Émile Zola',
  '(주)아크메',
  '🦊 Fox',
  '  ',
];

export const Initials: Story = {
  render: () => (
    <ul className="text-body-b3-regular flex flex-col gap-2">
      {NAMES.map((name) => (
        <li key={name} className="flex items-center gap-3">
          <Avatar name={name} alt={name.trim() || '빈 이름'} size="tiny" />
          <code className="font-mono">
            {JSON.stringify(name)} → {JSON.stringify(initialsOf(name))}
          </code>
        </li>
      ))}
    </ul>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '한글 이름은 성 한 글자, 그 밖에는 앞 두 단어의 첫 글자입니다. 문자 단위로 자르므로 이모지나 악센트가 반으로 잘리지 않고, 괄호 같은 기호는 건너뜁니다.',
      },
    },
  },
  play: async () => {
    await expect(initialsOf('Alice Kim')).toBe('AK');
    await expect(initialsOf('ada lovelace king')).toBe('AL');
    await expect(initialsOf('류현승')).toBe('류');
    await expect(initialsOf('Émile Zola')).toBe('ÉZ');
    await expect(initialsOf('(주)아크메')).toBe('주');
    await expect(initialsOf('🦊 Fox')).toBe('F');
    await expect(initialsOf('  ')).toBe('');
  },
};
