import {
  BellAlertIcon,
  BuildingLibraryIcon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  ShieldCheckIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

import { Item } from '../../components/data/item';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Features/Grid',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

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

export const PC: Story = {
  render: () => (
    <section
      aria-labelledby="features"
      className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-20 break-keep sm:px-6"
    >
      <div className="flex max-w-2xl flex-col gap-3">
        <h2 id="features" className="text-headline-h2-bold">
          학교생활이 조금 더 쉬워져요
        </h2>
        <p className="text-body-b1-regular">
          매일 쓰는 것부터 한 학기에 한 번 쓰는 것까지, 인포팀이 만든 서비스예요.
        </p>
      </div>
      <ul aria-label="서비스" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <li key={feature.title} className="flex">
            <Item variant="outline">
              <Item.Media variant="soft">{feature.icon}</Item.Media>
              <Item.Content>
                <Item.Title>{feature.title}</Item.Title>
                <Item.Description>{feature.description}</Item.Description>
              </Item.Content>
            </Item>
          </li>
        ))}
      </ul>
    </section>
  ),
};
