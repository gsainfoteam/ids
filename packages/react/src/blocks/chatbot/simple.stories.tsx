import { useState, type FormEvent } from 'react';

import {
  ArrowUpIcon,
  BellAlertIcon,
  DocumentDuplicateIcon,
  HandThumbDownIcon,
  HandThumbUpIcon,
  PlusIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { IconToggle } from '../../components/action/icon-toggle';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { Item } from '../../components/data/item';
import { Table } from '../../components/data/table';
import { toast } from '../../components/feedback/toast';
import { TextArea } from '../../components/form/text-area';
import { Divider } from '../../components/layout/divider';
import { ScrollArea } from '../../components/layout/scroll-area';
import { Spacer } from '../../components/layout/spacer';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Chatbot/Simple',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const MENU = [
  { corner: '한식', dishes: '제육볶음, 된장찌개', price: '5,000원' },
  { corner: '양식', dishes: '크림 파스타, 마늘빵', price: '5,500원' },
  { corner: '분식', dishes: '참치김밥, 라면', price: '4,000원' },
];

const SHUTTLES = [
  { id: 'station', route: '광주송정역행', time: '12:20', wait: '6분 뒤' },
  { id: 'campus', route: '교내 순환', time: '12:30', wait: '16분 뒤' },
];

const SUGGESTIONS = ['도서관 빈자리', '이번 주 행사', '수강 정정 마감'];

export const PC: Story = {
  render: function Render() {
    const [draft, setDraft] = useState('');

    const ask = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setDraft('');
    };

    const feedback = (
      <div className="flex gap-1">
        <IconToggle variant="outline" size="tiny" aria-label="좋은 답" icon={<HandThumbUpIcon />} />
        <IconToggle
          variant="outline"
          size="tiny"
          aria-label="아쉬운 답"
          icon={<HandThumbDownIcon />}
        />
        <IconButton
          variant="outline"
          size="tiny"
          aria-label="답 복사"
          icon={<DocumentDuplicateIcon />}
          onClick={() => toast.success('답을 복사했어요')}
        />
      </div>
    );

    const assistant = (
      <Avatar name="GIST 도우미" size="tiny" aria-hidden>
        <Avatar.Fallback>
          <SparklesIcon />
        </Avatar.Fallback>
      </Avatar>
    );

    return (
      <div className="flex h-dvh flex-col break-keep">
        <header>
          <Item>
            <Item.Media>
              <Avatar name="GIST 도우미" aria-hidden>
                <Avatar.Fallback>
                  <SparklesIcon />
                </Avatar.Fallback>
              </Avatar>
            </Item.Media>
            <Item.Content>
              <Item.Title asChild>
                <h1>GIST 도우미</h1>
              </Item.Title>
              <Item.Description>학식, 셔틀, 학사 일정을 물어보세요.</Item.Description>
            </Item.Content>
            <Item.Actions>
              <Button variant="outline" size="tiny">
                <PlusIcon />새 대화
              </Button>
            </Item.Actions>
          </Item>
        </header>
        <Divider />

        <ScrollArea fade className="min-h-0 flex-1">
          <ol aria-label="대화" className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6">
            <li className="flex justify-end">
              <Card variant="soft" className="max-w-[80%]">
                <Card.Content>오늘 학식 뭐야?</Card.Content>
              </Card>
            </li>

            <li className="flex gap-3">
              {assistant}
              <div className="text-body-b2-regular flex min-w-0 flex-1 flex-col gap-3">
                <p>오늘(10월 1일 수요일) 학생식당 점심이에요. 11시 30분부터 1시 30분까지 열어요.</p>
                <Table aria-label="오늘 점심 메뉴">
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>코너</Table.Head>
                      <Table.Head>메뉴</Table.Head>
                      <Table.Head align="end">가격</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {MENU.map((row) => (
                      <Table.Row key={row.corner}>
                        <Table.Cell>{row.corner}</Table.Cell>
                        <Table.Cell>{row.dishes}</Table.Cell>
                        <Table.Cell align="end">{row.price}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
                <p>저녁은 5시 30분부터예요. 오늘 저녁 메뉴도 알려 드릴까요?</p>
                {feedback}
              </div>
            </li>

            <li className="flex justify-end">
              <Card variant="soft" className="max-w-[80%]">
                <Card.Content>학생회관에서 셔틀은 언제 와?</Card.Content>
              </Card>
            </li>

            <li className="flex gap-3">
              {assistant}
              <div className="text-body-b2-regular flex min-w-0 flex-1 flex-col gap-3">
                <p>학생회관 정류장에 곧 오는 셔틀이에요.</p>
                <Item.Group variant="separated" size="tiny" aria-label="곧 오는 셔틀">
                  {SHUTTLES.map((shuttle) => (
                    <Item key={shuttle.id}>
                      <Item.Content>
                        <Item.Title>
                          {shuttle.time} {shuttle.route}
                        </Item.Title>
                      </Item.Content>
                      <Item.Actions>
                        <Badge content={shuttle.wait} variant="soft" colorScheme="primary" />
                      </Item.Actions>
                    </Item>
                  ))}
                </Item.Group>
                <Button
                  variant="soft"
                  size="tiny"
                  className="self-start"
                  onClick={() => toast.success('12:20 셔틀 5분 전에 알려 드릴게요')}
                >
                  <BellAlertIcon />
                  5분 전에 알려 주기
                </Button>
                {feedback}
              </div>
            </li>
          </ol>
        </ScrollArea>

        <form onSubmit={ask} className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <Chip key={suggestion} onClick={() => setDraft(suggestion)}>
                {suggestion}
              </Chip>
            ))}
          </div>
          <TextArea
            aria-label="GIST 도우미에게 묻기"
            placeholder="무엇이든 물어보세요"
            rows={1}
            maxRows={6}
            value={draft}
            onValueChange={setDraft}
          >
            <TextArea.Input />
            <Spacer />
            <IconButton
              type="submit"
              variant="solid"
              size="tiny"
              aria-label="묻기"
              icon={<ArrowUpIcon />}
              disabled={draft.trim() === ''}
            />
          </TextArea>
          <p className="text-caption-c1-regular text-center">
            GIST 도우미는 틀릴 수 있어요. 중요한 일정은 학사 공지로 한 번 더 확인하세요.
          </p>
        </form>
      </div>
    );
  },
};
