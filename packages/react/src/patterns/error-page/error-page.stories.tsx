import {
  ArrowLeftIcon,
  ArrowPathIcon,
  BuildingLibraryIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Item } from '../../components/data/item';
import { Alert } from '../../components/feedback/alert';
import { Progress } from '../../components/feedback/progress';
import { TextField } from '../../components/form/text-field';
import { Kbd } from '../../components/typography/kbd';
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/ErrorPage',
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

const code = cn(
  'font-mono text-[96px] leading-none font-bold tracking-tight text-(--ids-color-accent)',
);

export const NotFound: Story = {
  render: () => (
    <main className="grid min-h-dvh place-items-center px-4 py-12 break-keep">
      <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <p aria-hidden className={code}>
            404
          </p>
          <h1 className="text-headline-h3-bold">페이지를 찾을 수 없어요</h1>
          <p className="text-body-b2-regular text-(--ids-color-on-muted)">
            주소가 바뀌었거나 지워진 페이지예요. 주소를 다시 확인하거나 아래에서 찾아 보세요.
          </p>
        </div>

        <form role="search" className="w-full" onSubmit={(event) => event.preventDefault()}>
          <TextField
            type="search"
            aria-label="인포팀 서비스에서 찾기"
            placeholder="인포팀 서비스에서 찾기"
          >
            <MagnifyingGlassIcon />
            <TextField.Input />
            <Kbd keys="Enter" />
          </TextField>
        </form>

        <div className="flex flex-col gap-2 self-stretch text-start">
          <h2 className="text-body-b3-semibold text-(--ids-color-on-muted)">자주 찾는 페이지</h2>
          <Item.Group variant="separated" size="tiny" aria-label="자주 찾는 페이지">
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
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button>
            <HomeIcon />
            홈으로
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

export const ServerError: Story = {
  render: () => (
    <main className="grid min-h-dvh place-items-center px-4 py-12 break-keep">
      <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <p aria-hidden className={code}>
            500
          </p>
          <h1 className="text-headline-h3-bold">잠시 문제가 생겼어요</h1>
          <p className="text-body-b2-regular text-(--ids-color-on-muted)">
            서버가 답하지 않아요. 잠시 뒤에 다시 시도해 주세요. 계속되면 인포팀에 알려 주세요.
          </p>
        </div>
        <Alert colorScheme="danger" className="text-start">
          <Alert.Title>오류 번호 7F3A-21C9</Alert.Title>
          <Alert.Description>
            문의할 때 이 번호를 함께 보내 주시면 빨리 찾을 수 있어요.
          </Alert.Description>
        </Alert>
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => window.location.reload()}>
            <ArrowPathIcon />
            다시 시도
          </Button>
          <Button variant="outline" asChild>
            <a href="mailto:team@gistory.me">인포팀에 알리기</a>
          </Button>
        </div>
      </div>
    </main>
  ),
};

export const Maintenance: Story = {
  render: () => (
    <main className="grid min-h-dvh place-items-center bg-(--ids-color-muted) px-4 py-12 break-keep">
      <div className="rounded-container flex w-full max-w-md flex-col items-center gap-6 bg-(--ids-color-surface) p-8 text-center inset-ring-1 inset-ring-(--ids-color-border)">
        <span className="grid size-14 place-items-center rounded-full bg-(--ids-color-secondary) text-(--ids-color-on-secondary)">
          <WrenchScrewdriverIcon aria-hidden className="size-7" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-headline-h4-bold">서버를 점검하고 있어요</h1>
          <p className="text-body-b2-regular text-(--ids-color-on-muted)">
            10월 3일 새벽 2시부터 4시까지 점검해요. 끝나면 이 페이지가 저절로 새로 고쳐져요.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 text-start">
          <Progress value={65}>
            <Progress.Label>점검 진행</Progress.Label>
            <Progress.Value />
          </Progress>
          <p className="text-caption-c1-regular text-(--ids-color-on-muted)">약 40분 남았어요</p>
        </div>
      </div>
    </main>
  ),
};
