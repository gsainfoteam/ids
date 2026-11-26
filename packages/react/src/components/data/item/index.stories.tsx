import { useState } from 'react';

import {
  BellIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  DocumentIcon,
  EllipsisVerticalIcon,
  HomeIcon,
  InboxIcon,
  MoonIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { expect, fn } from 'storybook/test';

import { Showcase } from '~story-kit';

import { IconButton } from '../../action/icon-button';
import { Kbd } from '../../typography/kbd';
import { Avatar } from '../avatar';
import { AvatarGroup } from '../avatar-group';
import { Chip } from '../chip';
import { ItemGroup } from '../item-group';

import { Item } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['ghost', 'outline', 'soft'] as const;
const sizes = ['standard', 'tiny'] as const;

const photo = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48"><rect width="64" height="48" fill="#93c5fd"/><circle cx="46" cy="14" r="6" fill="#fde68a"/><path d="M0 48 22 20l14 16 8-8 20 20z" fill="#1d4ed8"/></svg>',
)}`;

const meta = {
  title: 'Data/Item',
  component: Item,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { variant: 'outline', size: 'standard' },
  render: (args) => (
    <div className="w-96">
      <Item {...args}>
        <Item.Media>
          <Avatar name="김철수" />
        </Item.Media>
        <Item.Content>
          <Item.Title>김철수</Item.Title>
          <Item.Description>kim@example.com</Item.Description>
        </Item.Content>
        <Item.Actions>
          <IconButton
            aria-label="더보기"
            variant="ghost"
            size="tiny"
            icon={<EllipsisVerticalIcon />}
          />
        </Item.Actions>
      </Item>
    </div>
  ),
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Usage: Story = {
  render: () => (
    <div className="w-80">
      <Item variant="outline">
        <Item.Media>
          <Avatar name="김철수" />
        </Item.Media>
        <Item.Content>
          <Item.Title>김철수</Item.Title>
          <Item.Description>kim@example.com</Item.Description>
        </Item.Content>
      </Item>
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <div className="w-64">
              <Item variant={variant} size={size}>
                <Item.Media variant="soft">
                  <BellIcon />
                </Item.Media>
                <Item.Content>
                  <Item.Title>{variant}</Item.Title>
                  <Item.Description>size {size}</Item.Description>
                </Item.Content>
              </Item>
            </div>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Tile × Text">
        <Showcase.Matrix
          rows={sizes}
          columns={['title', 'one line', 'two lines'] as const}
          render={(size, text) => (
            <div className="w-64">
              <Item variant="outline" size={size}>
                <Item.Media variant="soft">
                  <BellIcon />
                </Item.Media>
                <Item.Content>
                  <Item.Title>알림</Item.Title>
                  {text === 'one line' && <Item.Description>새 댓글 3개</Item.Description>}
                  {text === 'two lines' && (
                    <Item.Description>
                      새 댓글 3개와 멘션 1개가 있습니다. 확인하지 않은 알림이 더 있습니다.
                    </Item.Description>
                  )}
                </Item.Content>
              </Item>
            </div>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Media">
        <Showcase.Row label="icon">
          {variants.map((variant) => (
            <div key={variant} className="w-56">
              <Item variant="outline">
                <Item.Media variant={variant}>
                  <InboxIcon />
                </Item.Media>
                <Item.Content>
                  <Item.Title>media {variant}</Item.Title>
                </Item.Content>
              </Item>
            </div>
          ))}
        </Showcase.Row>
        <Showcase.Row label="description">
          {variants.map((variant) => (
            <div key={variant} className="w-56">
              <Item variant="outline">
                <Item.Media variant={variant}>
                  <InboxIcon />
                </Item.Media>
                <Item.Content>
                  <Item.Title>media {variant}</Item.Title>
                  <Item.Description>받은 편지 12통</Item.Description>
                </Item.Content>
              </Item>
            </div>
          ))}
        </Showcase.Row>
        <Showcase.Row label="image">
          {(['soft', 'outline'] as const).map((variant) => (
            <div key={variant} className="w-56">
              <Item variant="outline">
                <Item.Media variant={variant}>
                  <img src={photo} alt="" />
                </Item.Media>
                <Item.Content>
                  <Item.Title>image {variant}</Item.Title>
                </Item.Content>
              </Item>
            </div>
          ))}
        </Showcase.Row>
        <Showcase.Row label="avatar group">
          <div className="w-80">
            <Item variant="outline">
              <Item.Media>
                <AvatarGroup size="tiny" max={3} aria-label="채팅 멤버">
                  {['Alice Kim', 'Bob Lee', 'Carol Park', '류현승'].map((name) => (
                    <Avatar key={name} name={name} />
                  ))}
                </AvatarGroup>
              </Item.Media>
              <Item.Content>
                <Item.Title>디자인 시스템</Item.Title>
                <Item.Description>토큰 정리 끝났습니다</Item.Description>
              </Item.Content>
              <Item.Actions>
                <Chip variant="solid">{3}</Chip>
              </Item.Actions>
            </Item>
          </div>
        </Showcase.Row>
        <Showcase.Row label="two lines">
          <div className="w-80">
            <Item variant="outline">
              <Item.Media variant="soft">
                <DocumentIcon />
              </Item.Media>
              <Item.Content>
                <Item.Title>회의록.md</Item.Title>
                <Item.Description>
                  설명이 두 줄을 넘으면 말줄임표로 줄고, 타일은 행 높이에 비례해 커집니다. 이 문장은
                  일부러 길게 썼습니다.
                </Item.Description>
              </Item.Content>
              <Item.Content>
                <Item.Description>2분 전</Item.Description>
              </Item.Content>
            </Item>
          </div>
        </Showcase.Row>
        <Showcase.Row label="truncate">
          <div className="w-80">
            <Item variant="outline">
              <Item.Media variant="soft">
                <DocumentIcon />
              </Item.Media>
              <Item.Content>
                <Item.Title overflow="truncate">
                  2026 상반기 예산 집행 결과 보고서 (최종 수정본).pdf
                </Item.Title>
                <Item.Description>2.4 MB</Item.Description>
              </Item.Content>
            </Item>
          </div>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="onClick">
          <div className="w-56">
            <Item onClick={() => {}}>
              <Item.Media>
                <Cog6ToothIcon />
              </Item.Media>
              <Item.Content>
                <Item.Title>설정</Item.Title>
              </Item.Content>
              <Item.Actions>
                <Kbd size="tiny">⌘,</Kbd>
              </Item.Actions>
            </Item>
          </div>
        </Showcase.Row>
        <Showcase.Row label="selected">
          <div className="w-56">
            <Item selected onClick={() => {}}>
              <Item.Media>
                <HomeIcon />
              </Item.Media>
              <Item.Content>
                <Item.Title>홈</Item.Title>
              </Item.Content>
            </Item>
          </div>
          <div className="w-56">
            <Item selected variant="soft">
              <Item.Content>
                <Item.Title>soft · selected</Item.Title>
              </Item.Content>
            </Item>
          </div>
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <div className="w-56">
            <Item disabled onClick={() => {}}>
              <Item.Media>
                <MoonIcon />
              </Item.Media>
              <Item.Content>
                <Item.Title>다크 모드</Item.Title>
              </Item.Content>
            </Item>
          </div>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const OpenARowOnPress: Story = {
  args: { onClick: fn() },
  render: function Render(args) {
    const [archived, setArchived] = useState(0);

    return (
      <div className="flex w-96 flex-col gap-3">
        <Item variant="outline" onClick={args.onClick}>
          <Item.Media>
            <Avatar name="Alice Kim" />
          </Item.Media>
          <Item.Content>
            <Item.Title>Alice Kim</Item.Title>
            <Item.Description>오늘 회의 자료 보냈어요</Item.Description>
          </Item.Content>
          <Item.Actions>
            <IconButton
              aria-label="보관"
              variant="ghost"
              size="tiny"
              icon={<InboxIcon />}
              onClick={() => setArchived((count) => count + 1)}
            />
          </Item.Actions>
        </Item>
        <output aria-label="보관 수">{archived}</output>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`onClick` 을 주면 행 어디를 눌러도 열리고, 키보드와 스크린 리더에는 Item.Title이 버튼이 됩니다. 설명은 Item.Description입니다. Item.Actions 안의 버튼을 눌러도 행은 열리지 않습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    const row = canvas.getByRole('button', { name: 'Alice Kim' });
    await expect(row).toHaveAccessibleDescription('오늘 회의 자료 보냈어요');
    await userEvent.click(canvas.getByRole('button', { name: '보관' }));
    await expect(canvas.getByLabelText('보관 수')).toHaveTextContent('1');
    await expect(args.onClick).not.toHaveBeenCalled();
    await userEvent.click(row);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    row.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const SelectARow: Story = {
  render: function Render() {
    const files = ['보고서.pdf', '예산안.xlsx', '회의록.md'];
    const [selected, setSelected] = useState(files[0]);

    return (
      <div className="w-80">
        <ItemGroup aria-label="파일">
          {files.map((file) => (
            <Item key={file} selected={selected === file} onClick={() => setSelected(file)}>
              <Item.Media>
                <DocumentIcon />
              </Item.Media>
              <Item.Content>
                <Item.Title>{file}</Item.Title>
              </Item.Content>
            </Item>
          ))}
        </ItemGroup>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`selected` 는 행에 press 층을 깔고, 버튼인 행에서는 `aria-pressed` 로 알립니다. ItemGroup은 `role="list"` 인 `<ul>` 이고 각 행을 `<li>` 로 감쌉니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const list = canvas.getByRole('list', { name: '파일' });
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    await expect(list.tagName).toBe('UL');
    const budget = canvas.getByRole('button', { name: '예산안.xlsx' });
    await userEvent.click(budget);
    await expect(budget).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByRole('button', { name: '보고서.pdf' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  },
};

export const LinkARowToAPage: Story = {
  render: () => (
    <div className="w-80">
      <ItemGroup aria-label="자주 찾는 페이지">
        <Item asChild>
          <a href="#notices">
            <Item.Content>
              <Item.Title>공지</Item.Title>
              <Item.Description>학사, 장학, 행사 소식</Item.Description>
            </Item.Content>
            <Item.Actions>
              <ChevronRightIcon aria-hidden className="rtl:-scale-x-100" />
            </Item.Actions>
          </a>
        </Item>
        <Item asChild>
          <a href="#shuttle">
            <Item.Content>
              <Item.Title>셔틀</Item.Title>
              <Item.Description>오늘 운행 시간표</Item.Description>
            </Item.Content>
            <Item.Actions>
              <ChevronRightIcon aria-hidden className="rtl:-scale-x-100" />
            </Item.Actions>
          </a>
        </Item>
      </ItemGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`Item.Actions` 에 맨 아이콘을 두면 `Item.Media` 처럼 아이콘 크기와 흐린 색으로 그립니다. 링크 행의 끝 화살표에 씁니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const icon = canvas
      .getByRole('link', { name: /공지/ })
      .querySelector('[data-item-actions] svg')!;
    await expect(icon.getBoundingClientRect().width).toBeGreaterThan(0);
  },
};

export const BuildANavigationList: Story = {
  render: () => (
    <div className="w-56">
      <ItemGroup variant="ghost" size="tiny" aria-label="메뉴">
        <Item asChild selected aria-current="page">
          <a href="#home">
            <Item.Media>
              <HomeIcon />
            </Item.Media>
            <Item.Content>
              <Item.Title>홈</Item.Title>
            </Item.Content>
          </a>
        </Item>
        <Item asChild>
          <a href="#inbox">
            <Item.Media>
              <InboxIcon />
            </Item.Media>
            <Item.Content>
              <Item.Title>받은 편지함</Item.Title>
            </Item.Content>
            <Item.Actions>
              <Chip size="tiny" variant="soft" colorScheme="primary">
                {12}
              </Chip>
            </Item.Actions>
          </a>
        </Item>
        <Item.Separator />
        <Item asChild>
          <a href="#settings">
            <Item.Media>
              <Cog6ToothIcon />
            </Item.Media>
            <Item.Content>
              <Item.Title>설정</Item.Title>
            </Item.Content>
          </a>
        </Item>
      </ItemGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`asChild` 로 행이 링크가 됩니다. 현재 페이지는 `aria-current="page"` 로 알리고, 이때는 `aria-pressed` 를 붙이지 않습니다. 구분선은 목록 항목으로 세지 않습니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const home = canvas.getByRole('link', { name: '홈' });
    await expect(home).toHaveAttribute('aria-current', 'page');
    await expect(home).not.toHaveAttribute('aria-pressed');
    await expect(home).toHaveAttribute('data-selected');
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    await expect(home).toHaveAttribute('data-size', 'tiny');
  },
};

const attachments = [
  { name: '2026 상반기 예산 집행 결과 보고서 (최종 수정본).pdf', size: '2.4 MB' },
  { name: '현장 사진.jpg', size: '1.2 MB', thumbnail: photo },
  { name: '회의록.md', size: '3 KB' },
];

export const ListAttachedFiles: Story = {
  render: () => (
    <div className="grid w-80">
      <ItemGroup variant="separated" aria-label="첨부 파일">
        {attachments.map((file) => (
          <Item key={file.name} variant="outline">
            <Item.Media variant="soft">
              {file.thumbnail ? <img src={file.thumbnail} alt="" /> : <DocumentIcon />}
            </Item.Media>
            <Item.Content>
              <Item.Title overflow="truncate" title={file.name}>
                {file.name}
              </Item.Title>
              <Item.Description>{file.size}</Item.Description>
            </Item.Content>
            <Item.Actions>
              <IconButton
                aria-label={`${file.name} 삭제`}
                variant="ghost"
                size="tiny"
                icon={<XMarkIcon />}
              />
            </Item.Actions>
          </Item>
        ))}
      </ItemGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '타일과 그 둘레 여백은 행 높이에 비례해 함께 커지고, 왼쪽·위·아래 여백이 같습니다. `Item.Title overflow="truncate"` 는 긴 파일 이름을 한 줄에서 말줄임표로 줄이고, grid 안에서도 목록을 넓히지 않습니다. 타일 안의 이미지는 타일을 채웁니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    const rows = canvas.getAllByRole('listitem').map((item) => item.firstElementChild!);
    await expect(rows).toHaveLength(3);
    for (const row of rows) {
      const box = row.getBoundingClientRect();
      const tile = row.querySelector('[data-item-media]')!.getBoundingClientRect();
      const start = tile.left - box.left;
      for (const inset of [tile.top - box.top, box.bottom - tile.bottom])
        await expect(Math.abs(inset - start)).toBeLessThanOrEqual(1);
    }
    const list = canvas.getByRole('list');
    await expect(list.getBoundingClientRect().width).toBe(
      list.parentElement!.getBoundingClientRect().width,
    );
    const title = canvas.getByText(attachments[0].name);
    const line = parseFloat(getComputedStyle(title).lineHeight);
    await expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);
    await expect(title.getBoundingClientRect().height).toBeLessThan(line * 1.5);
    const image = canvasElement.querySelector('[data-item-media] img')!;
    const tile = image.parentElement!.getBoundingClientRect();
    await expect(image.getBoundingClientRect().width).toBe(tile.width);
    await expect(image.getBoundingClientRect().height).toBe(tile.height);
  },
};
