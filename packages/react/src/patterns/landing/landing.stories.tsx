import {
  ArrowRightIcon,
  Bars3Icon,
  BellAlertIcon,
  BuildingLibraryIcon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  ShieldCheckIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Accordion } from '../../components/data/accordion';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Marquee } from '../../components/data/marquee';
import { Divider } from '../../components/layout/divider';
import { Menu } from '../../components/overlay/menu';
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/Landing',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const NAVIGATION = ['서비스', '인포팀', '블로그', '채용'];

const ORGANIZATIONS = [
  '총학생회',
  '생활관 자치회',
  '학술정보처',
  '창업진흥센터',
  '밴드부',
  '사진부',
  '보드게임 동아리',
  'GIST 신문',
];

const FEATURES = [
  {
    title: '게시판',
    description: '학사, 장학, 행사 공지를 한곳에서 보고 구독해요.',
    icon: <MegaphoneIcon />,
  },
  {
    title: '셔틀',
    description: '정류장마다 다음 셔틀까지 남은 시간을 알려 줘요.',
    icon: <TruckIcon />,
  },
  {
    title: '도서관',
    description: '열람실 빈자리를 보고 스터디룸을 예약해요.',
    icon: <BuildingLibraryIcon />,
  },
  {
    title: 'GIST 도우미',
    description: '학식, 시간표, 행사를 물어보면 바로 답해요.',
    icon: <ChatBubbleLeftRightIcon />,
  },
  {
    title: '알림',
    description: '중요한 것만 골라서 휴대폰으로 보내 드려요.',
    icon: <BellAlertIcon />,
  },
  {
    title: '한 계정',
    description: 'GIST 메일 하나로 모든 서비스에 로그인해요.',
    icon: <ShieldCheckIcon />,
  },
];

const VOICES = [
  {
    name: '박서연',
    role: '신소재공학부 24학번',
    quote: '셔틀 알림 덕분에 추운 날 정류장에서 기다리지 않아요.',
  },
  {
    name: '이도윤',
    role: '기계로봇공학부 23학번',
    quote: '공지를 놓쳐서 장학금 신청을 못 한 일이 이제 없어요.',
  },
  {
    name: '정예린',
    role: '생명과학부 25학번',
    quote: '스터디룸 예약이 1분이면 끝나서 조별 과제가 편해졌어요.',
  },
];

const FAQ = [
  {
    id: 'free',
    question: '돈을 내야 하나요?',
    answer: '아니요. GIST 학생이라면 모든 서비스를 무료로 써요.',
  },
  {
    id: 'who',
    question: '누가 만드나요?',
    answer: 'GIST 학생 개발 동아리 인포팀이 만들고 운영해요.',
  },
  {
    id: 'data',
    question: '제 정보는 어디에 저장되나요?',
    answer: '학교 안 서버에 저장하고, 서비스 운영에만 써요.',
  },
];

const COLUMNS = [
  { title: '서비스', links: ['게시판', '셔틀', '도서관', 'GIST 도우미'] },
  { title: '인포팀', links: ['소개', '블로그', '채용', '문의'] },
  { title: '약관', links: ['이용 약관', '개인정보 처리방침'] },
];

const link = cn(
  'rounded-indicator text-body-b3-regular text-(--ids-color-on-muted) focus-ring hover:text-(--ids-color-on-surface)',
);

const section = cn('mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6');

const tile = cn(
  'grid size-11 place-items-center rounded-standard bg-(--ids-color-secondary) text-(--ids-color-on-secondary) [&_svg]:size-6',
);

export const Default: Story = {
  render: () => (
    <div className="flex min-h-dvh flex-col break-keep">
      <header className="sticky top-0 z-10 border-b border-(--ids-color-border) bg-(--ids-color-surface)">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <a href="#top" className="text-subtitle-s1-bold flex items-center gap-2">
            <span
              aria-hidden
              className="rounded-standard grid size-8 place-items-center bg-(--ids-color-primary) text-(--ids-color-on-primary)"
            >
              i
            </span>
            인포팀
          </a>
          <nav aria-label="주 메뉴" className="hidden md:block">
            <ul className="flex items-center gap-6">
              {NAVIGATION.map((item) => (
                <li key={item}>
                  <a href={`#${item}`} className={link}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ms-auto flex items-center gap-2">
            <Button variant="outline" className="hidden sm:inline-flex">
              로그인
            </Button>
            <Button>시작하기</Button>
            <Menu>
              <Menu.Trigger asChild>
                <IconButton
                  variant="outline"
                  aria-label="메뉴"
                  icon={<Bars3Icon />}
                  className="md:hidden"
                />
              </Menu.Trigger>
              <Menu.Content>
                {NAVIGATION.map((item) => (
                  <Menu.Item key={item} asChild>
                    <a href={`#${item}`}>{item}</a>
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu>
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-24 py-16 break-keep lg:py-24">
        <section className={cn(section, 'items-center text-center')}>
          <Badge content="새로워진 인포팀 서비스" variant="soft" colorScheme="primary" />
          <h1 className="text-headline-h1-bold max-w-3xl">
            GIST 학생이 쓰는 모든 서비스, 한 계정으로
          </h1>
          <p className="text-body-b1-regular max-w-xl text-(--ids-color-on-muted)">
            공지, 셔틀, 도서관, 학식까지. 인포팀이 학교생활에 필요한 서비스를 하나로 묶었어요.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button>
              GIST 계정으로 시작하기
              <ArrowRightIcon />
            </Button>
            <Button variant="outline">서비스 둘러보기</Button>
          </div>
          <dl className="grid w-full max-w-2xl grid-cols-3 gap-4 pt-6">
            {[
              ['4,200+', '매일 쓰는 학생'],
              ['12개', '서비스'],
              ['9년', '운영한 시간'],
            ].map(([value, label]) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <dt className="text-body-b3-regular order-2 text-(--ids-color-on-muted)">
                  {label}
                </dt>
                <dd className="text-headline-h3-bold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="organizations" className="flex flex-col gap-6">
          <h2
            id="organizations"
            className="text-body-b3-semibold text-center text-(--ids-color-on-muted)"
          >
            함께하는 단체
          </h2>
          <Marquee aria-label="함께하는 단체" className="gap-10">
            {ORGANIZATIONS.map((organization) => (
              <span
                key={organization}
                className="text-subtitle-s1-bold whitespace-nowrap text-(--ids-color-on-muted)"
              >
                {organization}
              </span>
            ))}
          </Marquee>
        </section>

        <section aria-labelledby="features" className={section}>
          <div className="flex flex-col gap-2 text-center">
            <h2 id="features" className="text-headline-h2-bold">
              학교생활이 조금 더 쉬워져요
            </h2>
            <p className="text-body-b1-regular text-(--ids-color-on-muted)">
              매일 쓰는 것부터 한 학기에 한 번 쓰는 것까지
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex">
                <Card className="w-full">
                  <Card.Header className="gap-3">
                    <span aria-hidden className={tile}>
                      {feature.icon}
                    </span>
                    <Card.Title>{feature.title}</Card.Title>
                    <Card.Description>{feature.description}</Card.Description>
                  </Card.Header>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="voices" className={section}>
          <h2 id="voices" className="text-headline-h2-bold text-center">
            학생들의 이야기
          </h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {VOICES.map((voice) => (
              <li key={voice.name} className="flex">
                <Card className="w-full">
                  <Card.Content>
                    <figure className="flex h-full flex-col gap-6">
                      <blockquote className="text-body-b1-regular">“{voice.quote}”</blockquote>
                      <figcaption className="mt-auto flex items-center gap-3">
                        <Avatar name={voice.name} />
                        <span className="flex flex-col">
                          <span className="text-body-b2-semibold">{voice.name}</span>
                          <span className="text-caption-c1-regular text-(--ids-color-on-muted)">
                            {voice.role}
                          </span>
                        </span>
                      </figcaption>
                    </figure>
                  </Card.Content>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="faq" className={cn(section, 'max-w-3xl')}>
          <h2 id="faq" className="text-headline-h2-bold text-center">
            자주 묻는 질문
          </h2>
          <Accordion type="single" variant="outline">
            {FAQ.map((item) => (
              <Accordion.Item key={item.id} value={item.id}>
                <Accordion.Trigger>{item.question}</Accordion.Trigger>
                <Accordion.Content>{item.answer}</Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion>
        </section>

        <section className={section}>
          <div className="rounded-container flex flex-col items-center gap-5 bg-(--ids-color-primary) px-6 py-12 text-center text-(--ids-color-on-primary)">
            <h2 className="text-headline-h2-bold">지금 바로 시작해 보세요</h2>
            <p className="text-body-b1-regular">GIST 메일만 있으면 1분이면 끝나요.</p>
            <Button variant="outline">
              GIST 계정으로 시작하기
              <ArrowRightIcon />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-(--ids-color-border)">
        <div className={cn(section, 'gap-8 py-12')}>
          <div className="grid gap-8 sm:grid-cols-4">
            <div className="flex flex-col gap-2">
              <span className="text-subtitle-s2-bold">GIST 인포팀</span>
              <span className="text-body-b3-regular text-(--ids-color-on-muted)">
                광주 북구 첨단과기로 123
              </span>
            </div>
            {COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
                <span className="text-body-b3-semibold">{column.title}</span>
                <ul className="flex flex-col gap-2">
                  {column.links.map((item) => (
                    <li key={item}>
                      <a href={`#${item}`} className={link}>
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <Divider />
          <p className="text-caption-c1-regular text-(--ids-color-on-muted)">
            © 2026 GIST 인포팀. IDS 로 만들었어요.
          </p>
        </div>
      </footer>
    </div>
  ),
};
