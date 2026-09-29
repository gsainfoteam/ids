import { useState } from 'react';

import {
  ArrowUpTrayIcon,
  FolderOpenIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../action/button';
import { Card } from '../../data/card';
import { Item } from '../../data/item';
import { TextField } from '../../form/text-field';

import { Empty } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['ghost', 'soft', 'outline'] as const;
const sizes = ['standard', 'tiny'] as const;
const aligns = ['center', 'start'] as const;
const mediaVariants = ['soft', 'outline', 'ghost'] as const;

const CITIES = ['서울', '부산', '광주', '대전', '제주'];

const ILLUSTRATION = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="112" viewBox="0 0 160 112"><ellipse cx="80" cy="102" rx="60" ry="8" fill="#e5e7eb"/><path d="M28 30h40l10 10h54v54H28Z" fill="#c7d2fe"/><path d="M28 48h104v46H28Z" fill="#a5b4fc"/><circle cx="118" cy="22" r="10" fill="#fde68a"/></svg>',
)}`;

const meta = {
  title: 'Feedback/Empty',
  component: Empty,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    align: { control: 'radio', options: aligns },
  },
  args: { variant: 'ghost', size: 'standard', align: 'center' },
  render: (args) => (
    <Empty {...args} className="max-w-md">
      <Empty.Media>
        <FolderOpenIcon />
      </Empty.Media>
      <Empty.Title>아직 프로젝트가 없습니다</Empty.Title>
      <Empty.Description>첫 프로젝트를 만들어 팀원과 함께 시작해 보세요.</Empty.Description>
      <Empty.Actions>
        <Button>
          <PlusIcon />
          프로젝트 만들기
        </Button>
        <Button variant="outline">가져오기</Button>
      </Empty.Actions>
    </Empty>
  ),
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <Empty variant={variant} size={size} className="w-72">
              <Empty.Title>{variant}</Empty.Title>
              <Empty.Description>size {size}</Empty.Description>
              <Empty.Actions>
                <Button size={size}>만들기</Button>
              </Empty.Actions>
            </Empty>
          )}
        />
      </Showcase.Section>

      <Showcase.Section
        title="Media"
        description="Empty.Media가 없으면 inbox 아이콘을 soft 칸에 그립니다. 아이콘은 soft와 outline 칸에, 일러스트는 ghost로 그대로 둡니다."
      >
        <Showcase.Matrix
          rows={sizes}
          columns={mediaVariants}
          render={(size, variant) => (
            <Empty size={size} className="w-56">
              <Empty.Media variant={variant}>
                <MagnifyingGlassIcon />
              </Empty.Media>
              <Empty.Title>검색 결과 없음</Empty.Title>
            </Empty>
          )}
        />
        <Showcase.Row label="default">
          <Empty className="w-56">
            <Empty.Title>받은 메시지가 없습니다</Empty.Title>
          </Empty>
          <Empty variant="soft" className="w-56">
            <Empty.Title>받은 메시지가 없습니다</Empty.Title>
          </Empty>
        </Showcase.Row>
        <Showcase.Row label="illustration">
          <Empty variant="outline" className="w-72">
            <Empty.Media variant="ghost">
              <img src={ILLUSTRATION} alt="" width={160} height={112} />
            </Empty.Media>
            <Empty.Title>이 폴더는 비어 있습니다</Empty.Title>
            <Empty.Description>파일을 끌어다 놓거나 업로드 버튼을 누르세요.</Empty.Description>
            <Empty.Actions>
              <Button>
                <ArrowUpTrayIcon />
                파일 업로드
              </Button>
            </Empty.Actions>
          </Empty>
        </Showcase.Row>
        <Showcase.Row label="hidden">
          <Empty variant="outline" size="tiny" className="w-56">
            <Empty.Media hidden />
            <Empty.Title>표시할 항목이 없습니다</Empty.Title>
          </Empty>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Align">
        <Showcase.Row>
          {aligns.map((align) => (
            <Empty key={align} align={align} variant="outline" className="w-72">
              <Empty.Media>
                <UserGroupIcon />
              </Empty.Media>
              <Empty.Title>align {align}</Empty.Title>
              <Empty.Description>팀원을 초대하면 여기에 표시됩니다.</Empty.Description>
              <Empty.Actions>
                <Button>초대하기</Button>
              </Empty.Actions>
            </Empty>
          ))}
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const InCard: Story = {
  render: () => (
    <Card className="w-96">
      <Card.Header>
        <Card.Title asChild>
          <h2>최근 활동</h2>
        </Card.Title>
        <Card.Description>팀원이 남긴 기록을 모아 봅니다.</Card.Description>
      </Card.Header>
      <Card.Content>
        <Empty variant="soft" size="tiny">
          <Empty.Title asChild>
            <h3>아직 활동이 없습니다</h3>
          </Empty.Title>
          <Empty.Description>문서를 만들거나 댓글을 남기면 여기에 쌓입니다.</Empty.Description>
          <Empty.Actions>
            <Button size="tiny">문서 만들기</Button>
          </Empty.Actions>
        </Empty>
      </Card.Content>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Card.Content 안에 두면 카드의 빈 상태가 됩니다. 제목을 heading으로 읽히게 하려면 Empty.Title에 asChild로 h3 같은 요소를 줍니다. Empty 자신은 역할이 없는 평범한 내용이라 알림으로 읽히지 않습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(canvas.getByRole('heading', { level: 3 })).toHaveTextContent(
      '아직 활동이 없습니다',
    );
    const root = canvasElement.querySelector<HTMLElement>('[data-empty]')!;
    await expect(root).not.toHaveAttribute('role');
    await expect(root).not.toHaveAttribute('aria-live');
    await userEvent.keyboard('{Tab}');
    await expect(canvas.getByRole('button', { name: '문서 만들기' })).toHaveFocus();
  },
};

export const TableEmptyState: Story = {
  render: () => (
    <table className="text-body-b3-regular w-full max-w-xl">
      <caption className="text-body-b3-semibold mb-2 text-start">구성원</caption>
      <thead>
        <tr className="border-b border-(--ids-color-border) text-(--ids-color-on-muted)">
          <th scope="col" className="px-3 py-2 text-start font-medium">
            이름
          </th>
          <th scope="col" className="px-3 py-2 text-start font-medium">
            이메일
          </th>
          <th scope="col" className="px-3 py-2 text-start font-medium">
            역할
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan={3} className="p-2">
            <Empty size="tiny">
              <Empty.Media>
                <UserGroupIcon />
              </Empty.Media>
              <Empty.Title>구성원이 없습니다</Empty.Title>
              <Empty.Description>새 구성원을 초대해 시작하세요.</Empty.Description>
              <Empty.Actions>
                <Button size="tiny">초대하기</Button>
              </Empty.Actions>
            </Empty>
          </td>
        </tr>
      </tbody>
    </table>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '표의 본문이 비면 열 전체를 덮는 칸 하나에 Empty를 둡니다. size="tiny"가 좁은 자리에 맞습니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const cell = canvas.getByRole('cell');
    await expect(cell).toHaveAttribute('colspan', '3');
    await expect(cell).toHaveTextContent(/구성원이 없습니다/);
    const header = canvas.getByRole('row', { name: /이름/ }).getBoundingClientRect();
    await expect(cell.getBoundingClientRect().width).toBeCloseTo(header.width, 0);
  },
};

export const ListEmptyState: Story = {
  render: function Render() {
    const [query, setQuery] = useState('');
    const matches = CITIES.filter((city) => city.includes(query.trim()));

    return (
      <div className="flex w-80 flex-col gap-2">
        <TextField
          value={query}
          onValueChange={setQuery}
          placeholder="도시 검색"
          aria-label="도시 검색"
          data-1p-ignore
          data-lpignore="true"
        >
          <MagnifyingGlassIcon />
        </TextField>
        {matches.length > 0 ? (
          <Item.Group aria-label="도시">
            {matches.map((city) => (
              <Item key={city} size="tiny">
                <Item.Content>
                  <Item.Title>{city}</Item.Title>
                </Item.Content>
              </Item>
            ))}
          </Item.Group>
        ) : (
          <Empty size="tiny">
            <Empty.Media>
              <MagnifyingGlassIcon />
            </Empty.Media>
            <Empty.Title>검색 결과가 없습니다</Empty.Title>
            <Empty.Description>다른 검색어로 시도해 보세요.</Empty.Description>
            <Empty.Actions>
              <Button size="tiny" variant="outline" onClick={() => setQuery('')}>
                검색어 지우기
              </Button>
            </Empty.Actions>
          </Empty>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '목록이 비었을 때 목록 대신 Empty를 그립니다. 동작은 Empty.Actions의 버튼이 맡습니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(CITIES.length);
    await userEvent.type(canvas.getByRole('textbox', { name: '도시 검색' }), '뉴욕');
    await expect(canvas.queryByRole('list')).toBeNull();
    await expect(canvasElement.querySelector('[data-empty-title]')).toHaveTextContent(
      '검색 결과가 없습니다',
    );
    await userEvent.click(canvas.getByRole('button', { name: '검색어 지우기' }));
    await expect(canvas.getAllByRole('listitem')).toHaveLength(CITIES.length);
    await expect(canvasElement.querySelector('[data-empty]')).toBeNull();
  },
};
