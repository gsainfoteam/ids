import { useState } from 'react';

import {
  BuildingLibraryIcon,
  ClockIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  PencilSquareIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Avatar } from '../../components/data/avatar';
import { Skeleton } from '../../components/feedback/skeleton';
import { toast } from '../../components/feedback/toast';
import { Divider } from '../../components/layout/divider';
import { Menu } from '../../components/overlay/menu';
import { Kbd } from '../../components/typography/kbd';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Search/Command',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const RECENT = ['셔틀 막차', '중간고사 도서관'];

const PLACES = [
  { id: 'board', label: '게시판', icon: <MegaphoneIcon />, keys: 'Alt+1' as const },
  { id: 'shuttle', label: '셔틀 시간표', icon: <TruckIcon />, keys: 'Alt+2' as const },
  { id: 'library', label: '도서관 자리', icon: <BuildingLibraryIcon />, keys: 'Alt+3' as const },
];

const PEOPLE = ['김지수', '박서연', '최하준'];

export const PC: Story = {
  render: function Render() {
    const [dark, setDark] = useState(false);

    return (
      <div className="flex min-h-dvh flex-col break-keep">
        <header className="flex items-center gap-4 px-4 py-3 sm:px-6">
          <span className="text-subtitle-s2-semibold">GIST 인포팀</span>
          <Menu triggerType="command" hotkey="Mod+K" defaultOpen>
            <Menu.Trigger asChild>
              <Button variant="outline" className="ms-auto">
                <MagnifyingGlassIcon />
                찾기
                <Kbd keys="Mod+K" size="tiny" />
              </Button>
            </Menu.Trigger>
            <Menu.Content aria-label="인포팀에서 찾기">
              <Menu.Search placeholder="페이지, 사람, 명령 찾기" />
              <Menu.Group>
                <Menu.Label>최근 검색</Menu.Label>
                {RECENT.map((keyword) => (
                  <Menu.Item key={keyword} onSelect={() => toast(`‘${keyword}’를 다시 찾아요`)}>
                    <ClockIcon />
                    {keyword}
                  </Menu.Item>
                ))}
              </Menu.Group>
              <Menu.Separator />
              <Menu.Group>
                <Menu.Label>바로 가기</Menu.Label>
                {PLACES.map((place) => (
                  <Menu.Item key={place.id} onSelect={() => toast(`${place.label}로 가요`)}>
                    {place.icon}
                    {place.label}
                    <Menu.Shortcut keys={place.keys} />
                  </Menu.Item>
                ))}
              </Menu.Group>
              <Menu.Separator />
              <Menu.Group>
                <Menu.Label>사람</Menu.Label>
                {PEOPLE.map((person) => (
                  <Menu.Item key={person} onSelect={() => toast(`${person}님의 프로필로 가요`)}>
                    <Avatar name={person} size="tiny" />
                    {person}
                  </Menu.Item>
                ))}
              </Menu.Group>
              <Menu.Separator />
              <Menu.Group>
                <Menu.Label>명령</Menu.Label>
                <Menu.Item onSelect={() => toast('새 글을 써요')}>
                  <PencilSquareIcon />
                  새 글 쓰기
                  <Menu.Shortcut keys="Mod+N" />
                </Menu.Item>
                <Menu.CheckboxItem checked={dark} onCheckedChange={setDark}>
                  어두운 화면
                </Menu.CheckboxItem>
                <Menu.Item onSelect={() => toast('설정을 열어요')}>
                  <Cog6ToothIcon />
                  설정
                  <Menu.Shortcut keys="Mod+," />
                </Menu.Item>
              </Menu.Group>
              <Menu.Empty>맞는 결과가 없어요. 다른 낱말로 찾아 보세요.</Menu.Empty>
            </Menu.Content>
          </Menu>
        </header>
        <Divider />

        <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton shape="text" lines={3} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="aspect-video" />
            <Skeleton className="aspect-video" />
            <Skeleton className="aspect-video" />
          </div>
        </main>
      </div>
    );
  },
};
