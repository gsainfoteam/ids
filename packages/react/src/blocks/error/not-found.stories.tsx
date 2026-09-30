import {
  ArrowLeftIcon,
  BuildingLibraryIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { TextField } from '../../components/form/text-field';
import { Kbd } from '../../components/typography/kbd';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Error/NotFound',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const POPULAR = [
  { id: 'board', label: '게시판', description: '공지와 행사, 모집 글', icon: <MegaphoneIcon /> },
  {
    id: 'shuttle',
    label: '셔틀 시간표',
    description: '교내 순환과 광주송정역',
    icon: <TruckIcon />,
  },
  {
    id: 'library',
    label: '도서관',
    description: '열람실 자리와 스터디룸',
    icon: <BuildingLibraryIcon />,
  },
];

export const PC: Story = {
  render: () => (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12 break-keep">
      <div className="flex w-full max-w-md flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge content="404" variant="outline" colorScheme="neutral" />
          <h1 className="text-headline-h2-bold">페이지를 찾을 수 없어요</h1>
          <p className="text-body-b2-regular">
            주소가 바뀌었거나 지워진 페이지예요. 찾던 것을 검색하거나 아래에서 골라 보세요.
          </p>
        </div>

        <form role="search" onSubmit={(event) => event.preventDefault()}>
          <TextField type="search" aria-label="인포팀에서 찾기" placeholder="인포팀에서 찾기">
            <MagnifyingGlassIcon />
            <TextField.Input />
            <Kbd keys="Enter" />
          </TextField>
        </form>

        <Card size="tiny">
          <Card.Header>
            <Card.Title asChild>
              <h2>자주 찾는 페이지</h2>
            </Card.Title>
          </Card.Header>
          <Item.Group variant="bordered" aria-label="자주 찾는 페이지">
            {POPULAR.map(({ id, label, description, icon }) => (
              <Item key={id} asChild>
                <a href={`#${id}`}>
                  <Item.Media variant="soft">{icon}</Item.Media>
                  <Item.Content>
                    <Item.Title>{label}</Item.Title>
                    <Item.Description>{description}</Item.Description>
                  </Item.Content>
                </a>
              </Item>
            ))}
          </Item.Group>
        </Card>

        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild>
            <a href="#home">
              <HomeIcon />
              홈으로
            </a>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeftIcon />
            이전 페이지
          </Button>
        </div>
      </div>
    </main>
  ),
};
