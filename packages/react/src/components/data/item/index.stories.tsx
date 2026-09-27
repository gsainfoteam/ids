import { useState } from 'react';

import {
  BellIcon,
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
import { Switch } from '../../form/switch';
import { Kbd } from '../../typography/kbd';
import { Avatar } from '../avatar';
import { AvatarGroup } from '../avatar-group';
import { Badge } from '../badge';

import { Item } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['ghost', 'outline', 'soft'] as const;
const sizes = ['standard', 'tiny'] as const;

// A 4:3 picture, so a tile shows it cropped to a square.
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
    dense: { control: 'boolean' },
    interactive: { control: 'boolean' },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { variant: 'outline', size: 'standard' },
  render: (args) => (
    <Item {...args} className="w-96">
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
  ),
} satisfies Meta<typeof Item>;

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
            <Item variant={variant} size={size} className="w-64">
              <Item.Media variant="soft">
                <BellIcon />
              </Item.Media>
              <Item.Content>
                <Item.Title>{variant}</Item.Title>
                <Item.Description>size {size}</Item.Description>
              </Item.Content>
            </Item>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Dense · Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <Item variant={variant} size={size} dense className="w-64">
              <Item.Media variant="soft">
                <BellIcon />
              </Item.Media>
              <Item.Content>
                <Item.Title>{variant}</Item.Title>
                <Item.Description>size {size} · dense</Item.Description>
              </Item.Content>
            </Item>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Media">
        <Showcase.Row label="icon">
          {variants.map((variant) => (
            <Item key={variant} variant="outline" className="w-56">
              <Item.Media variant={variant}>
                <InboxIcon />
              </Item.Media>
              <Item.Content>
                <Item.Title>media {variant}</Item.Title>
              </Item.Content>
            </Item>
          ))}
        </Showcase.Row>
        <Showcase.Row label="image">
          {(['soft', 'outline'] as const).map((variant) => (
            <Item key={variant} variant="outline" className="w-56">
              <Item.Media variant={variant}>
                <img src={photo} alt="" />
              </Item.Media>
              <Item.Content>
                <Item.Title>image {variant}</Item.Title>
              </Item.Content>
            </Item>
          ))}
        </Showcase.Row>
        <Showcase.Row label="avatar group">
          <Item variant="outline" className="w-80">
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
              <Badge content={3} />
            </Item.Actions>
          </Item>
        </Showcase.Row>
        <Showcase.Row label="two lines">
          <Item variant="outline" className="w-80">
            <Item.Media variant="soft">
              <DocumentIcon />
            </Item.Media>
            <Item.Content>
              <Item.Title>회의록.md</Item.Title>
              <Item.Description>
                설명이 두 줄을 넘으면 말줄임표로 줄고, 미디어는 첫 줄에 맞춰 위에 붙습니다. 이
                문장은 일부러 길게 썼습니다.
              </Item.Description>
            </Item.Content>
            <Item.Content className="text-caption-c1-regular items-end text-(--ids-color-on-muted)">
              2분 전
            </Item.Content>
          </Item>
        </Showcase.Row>
        <Showcase.Row label="truncate">
          <Item variant="outline" className="w-80">
            <Item.Media variant="soft">
              <DocumentIcon />
            </Item.Media>
            <Item.Content>
              <Item.Title truncate>2026 상반기 예산 집행 결과 보고서 (최종 수정본).pdf</Item.Title>
              <Item.Description>2.4 MB</Item.Description>
            </Item.Content>
          </Item>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="States">
        <Showcase.Row label="interactive">
          <Item onClick={() => {}} className="w-56">
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
        </Showcase.Row>
        <Showcase.Row label="selected">
          <Item selected onClick={() => {}} className="w-56">
            <Item.Media>
              <HomeIcon />
            </Item.Media>
            <Item.Content>
              <Item.Title>홈</Item.Title>
            </Item.Content>
          </Item>
          <Item selected variant="soft" className="w-56">
            <Item.Content>
              <Item.Title>soft · selected</Item.Title>
            </Item.Content>
          </Item>
        </Showcase.Row>
        <Showcase.Row label="disabled">
          <Item disabled onClick={() => {}} className="w-56">
            <Item.Media>
              <MoonIcon />
            </Item.Media>
            <Item.Content>
              <Item.Title>다크 모드</Item.Title>
            </Item.Content>
          </Item>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Group">
        <Showcase.Row>
          <Item.Group className="w-80" aria-label="설정">
            <Item>
              <Item.Media>
                <BellIcon />
              </Item.Media>
              <Item.Content>
                <Item.Title>알림</Item.Title>
                <Item.Description>새 메시지 알림 받기</Item.Description>
              </Item.Content>
              <Item.Actions>
                <Switch defaultChecked aria-label="알림" />
              </Item.Actions>
            </Item>
            <Item.Separator />
            <Item>
              <Item.Media>
                <MoonIcon />
              </Item.Media>
              <Item.Content>
                <Item.Title>다크 모드</Item.Title>
              </Item.Content>
              <Item.Actions>
                <Switch aria-label="다크 모드" />
              </Item.Actions>
            </Item>
          </Item.Group>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

function MessageRow({ onOpen }: { onOpen: Item.Props['onClick'] }) {
  const [archived, setArchived] = useState(0);
  return (
    <div className="flex w-96 flex-col gap-3">
      <Item variant="outline" onClick={onOpen}>
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
}

export const Interactive: Story = {
  args: { onClick: fn() },
  render: (args) => <MessageRow onOpen={args.onClick} />,
  parameters: {
    docs: {
      description: {
        story:
          '`onClick` 을 주면 행 전체가 버튼이 되고, 이름은 Item.Title, 설명은 Item.Description입니다. Item.Actions 안의 버튼을 눌러도 행은 열리지 않습니다.',
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

function FileList() {
  const files = ['보고서.pdf', '예산안.xlsx', '회의록.md'];
  const [selected, setSelected] = useState(files[0]);
  return (
    <Item.Group className="w-80" aria-label="파일">
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
    </Item.Group>
  );
}

export const Selectable: Story = {
  render: () => <FileList />,
  parameters: {
    docs: {
      description: {
        story:
          '`selected` 는 옅은 배경과 `data-selected` 를 붙이고, 버튼인 행에서는 `aria-pressed` 로 알립니다. Item.Group은 `role="list"` 인 `<ul>` 이고 각 행을 `<li>` 로 감쌉니다.',
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

export const Navigation: Story = {
  render: () => (
    <Item.Group size="tiny" className="w-56" aria-label="메뉴">
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
            <Badge content={12} size="tiny" variant="soft" colorScheme="primary" />
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
    </Item.Group>
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

export const Dense: Story = {
  render: () => (
    <div className="grid w-80">
      <Item.Group dense aria-label="첨부 파일" className="gap-1">
        {attachments.map((file) => (
          <Item key={file.name} variant="outline">
            <Item.Media variant="soft">
              {file.thumbnail ? <img src={file.thumbnail} alt="" /> : <DocumentIcon />}
            </Item.Media>
            <Item.Content>
              <Item.Title truncate title={file.name}>
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
      </Item.Group>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`dense` 는 패딩을 반으로 줄여 첨부 파일이나 메뉴처럼 행이 많은 목록을 촘촘하게 보여 줍니다. `Item.Group` 에 주면 안의 행이 모두 따릅니다. `Item.Title truncate` 는 긴 파일 이름을 한 줄에서 말줄임표로 줄이고, grid 안에서도 목록을 넓히지 않습니다. 타일 안의 이미지는 타일을 채웁니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    const rows = canvas.getAllByRole('listitem').map((item) => item.firstElementChild!);
    await expect(rows).toHaveLength(3);
    for (const row of rows) {
      await expect(row).toHaveAttribute('data-dense');
      await expect(getComputedStyle(row).paddingTop).toBe('6px');
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
