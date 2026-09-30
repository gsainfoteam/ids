import { ArrowRightIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { Progress } from '../../components/feedback/progress';
import { Stepper } from '../../components/navigation/stepper';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Features/Showcase',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const PC: Story = {
  render: () => (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-4 py-20 break-keep sm:px-6">
      <section aria-labelledby="board" className="grid items-center gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Badge content="게시판" variant="soft" colorScheme="primary" className="self-start" />
          <h2 id="board" className="text-headline-h2-bold">
            놓치면 안 되는 공지만 먼저
          </h2>
          <p className="text-body-b1-regular">
            학사, 장학, 행사 게시판 중 구독한 곳의 새 글을 모아 보여 줘요. 마감이 가까운 글은 맨
            위로 올라와요.
          </p>
          <Button asChild variant="outline" className="self-start">
            <a href="#board">
              게시판 보기
              <ArrowRightIcon />
            </a>
          </Button>
        </div>
        <Card variant="soft" aria-hidden>
          <Card>
            <Item.Group variant="bordered" size="tiny">
              {[
                ['2학기 수강 정정 안내', '학사 · 내일 마감', 'D-1'],
                ['근로 장학생 추가 모집', '장학 · 10월 6일까지', 'D-5'],
                ['가을 축제 부스 모집', '행사 · 10월 6일까지', 'D-5'],
              ].map(([title, description, due]) => (
                <Item key={title}>
                  <Item.Media variant="soft">
                    <MegaphoneIcon />
                  </Item.Media>
                  <Item.Content>
                    <Item.Title>{title}</Item.Title>
                    <Item.Description>{description}</Item.Description>
                  </Item.Content>
                  <Item.Actions>
                    <Badge
                      content={due}
                      variant="soft"
                      colorScheme={due === 'D-1' ? 'danger' : 'neutral'}
                    />
                  </Item.Actions>
                </Item>
              ))}
            </Item.Group>
          </Card>
        </Card>
      </section>

      <section aria-labelledby="shuttle" className="grid items-center gap-10 lg:grid-cols-2">
        <Card variant="soft" aria-hidden className="lg:order-first">
          <Card>
            <Card.Header>
              <Card.Description>학생회관 정류장</Card.Description>
              <Card.Title>6분 뒤 광주송정역행</Card.Title>
              <Card.Action>
                <Badge content="12:20" variant="soft" colorScheme="primary" />
              </Card.Action>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <Progress value={80} aria-label="다음 셔틀까지" />
              <Stepper progress={false} orientation="vertical" size="tiny" aria-label="정류장">
                <Stepper.Item completed>
                  <Stepper.Title>학생회관</Stepper.Title>
                  <Stepper.Description>12:20 출발</Stepper.Description>
                </Stepper.Item>
                <Stepper.Item>
                  <Stepper.Title>기숙사 A동</Stepper.Title>
                  <Stepper.Description>12:26</Stepper.Description>
                </Stepper.Item>
                <Stepper.Item>
                  <Stepper.Title>광주송정역</Stepper.Title>
                  <Stepper.Description>12:45 도착</Stepper.Description>
                </Stepper.Item>
              </Stepper>
            </Card.Content>
          </Card>
        </Card>
        <div className="flex flex-col gap-4">
          <Badge content="셔틀" variant="soft" colorScheme="primary" className="self-start" />
          <h2 id="shuttle" className="text-headline-h2-bold">
            정류장에서 기다리지 않게
          </h2>
          <p className="text-body-b1-regular">
            다음 셔틀까지 남은 시간과 정류장별 도착 시간을 보여 줘요. 5분 전에 알림을 받을 수도
            있어요.
          </p>
          <Button asChild variant="outline" className="self-start">
            <a href="#shuttle">셔틀 시간표 보기</a>
          </Button>
        </div>
      </section>

      <section aria-labelledby="people" className="grid items-center gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Badge content="동아리" variant="soft" colorScheme="primary" className="self-start" />
          <h2 id="people" className="text-headline-h2-bold">
            동아리 사람들과 한곳에서
          </h2>
          <p className="text-body-b1-regular">
            채널에서 이야기하고, 자료실에 파일을 모으고, 행사를 만들어 신청을 받아요.
          </p>
          <Button asChild variant="outline" className="self-start">
            <a href="#clubs">동아리 찾기</a>
          </Button>
        </div>
        <Card variant="soft" aria-hidden>
          <Card>
            <Item.Group size="tiny">
              {[
                ['박서연', '부스 배치도 나왔어요! 우리는 B-4 자리예요.'],
                ['이도윤', '좋다! 데모는 Ziggle 새 게시판으로 가요.'],
                ['정예린', '키링 시안 너무 귀여워요.'],
              ].map(([name, text]) => (
                <Item key={name}>
                  <Item.Media>
                    <Avatar name={name} size="tiny" />
                  </Item.Media>
                  <Item.Content>
                    <Item.Title>{name}</Item.Title>
                    <Item.Description>{text}</Item.Description>
                  </Item.Content>
                </Item>
              ))}
            </Item.Group>
          </Card>
        </Card>
      </section>
    </main>
  ),
};
