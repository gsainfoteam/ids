import { useState, type FormEvent } from 'react';

import {
  ArrowUpIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  HandThumbDownIcon,
  HandThumbUpIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

import { IconButton } from '../../components/action/icon-button';
import { IconToggle } from '../../components/action/icon-toggle';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { Alert } from '../../components/feedback/alert';
import { toast } from '../../components/feedback/toast';
import { TextArea } from '../../components/form/text-area';
import { Spacer } from '../../components/layout/spacer';
import { Tabs } from '../../components/navigation/tabs';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Chatbot/Research',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const SOURCES = [
  { id: 's1', site: '생활관 공지', title: '2학기 외박 신청 안내', date: '9월 2일' },
  { id: 's2', site: '생활관 규정', title: '생활관 운영 규정 제12조', date: '2026년 3월' },
  { id: 's3', site: '포털 도움말', title: '외박 신청 화면 쓰는 법', date: '8월 28일' },
  { id: 's4', site: '게시판', title: '외박 신청 마감 시간 질문', date: '어제' },
];

const STEPS = [
  { text: '포털의 생활관 메뉴에서 외박 신청을 열어요.', source: 3 },
  { text: '나가는 날과 돌아오는 날, 행선지를 적어요.', source: 1 },
  { text: '보호자 연락처를 확인하고 신청해요.', source: 1 },
];

const RELATED = ['기숙사 통금은 몇 시야?', '외박을 취소하려면?', '주말에도 외박 신청이 필요해?'];

export const PC: Story = {
  render: function Render() {
    const [draft, setDraft] = useState('');

    const ask = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      toast(`‘${draft}’를 물어봤어요`);
      setDraft('');
    };

    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <h1 className="text-headline-h3-bold">기숙사 외박 신청은 어떻게 하나요?</h1>

        <Tabs defaultValue="answer" className="flex flex-col gap-6">
          <Tabs.List aria-label="답변 보기">
            <Tabs.Trigger value="answer">답변</Tabs.Trigger>
            <Tabs.Trigger value="sources">출처 {SOURCES.length}</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="answer" className="text-body-b1-regular flex flex-col gap-5">
            <ol aria-label="출처" className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {SOURCES.map((source, index) => (
                <li key={source.id} className="flex">
                  <Card size="tiny" variant="soft" asChild className="w-full">
                    <a href={`#${source.id}`}>
                      <Card.Header>
                        <Card.Description>
                          {index + 1} · {source.site}
                        </Card.Description>
                        <Card.Title>{source.title}</Card.Title>
                      </Card.Header>
                    </a>
                  </Card>
                </li>
              ))}
            </ol>

            <Item size="tiny" variant="outline" className="w-auto self-start">
              <Item.Media>
                <CheckCircleIcon />
              </Item.Media>
              <Item.Content>
                <Item.Title>출처 4곳을 읽고 답했어요</Item.Title>
              </Item.Content>
            </Item>

            <p>
              외박은 나가기 전날 밤 10시까지 포털에서 신청해요{' '}
              <Badge
                content={
                  <>
                    <span className="sr-only">출처 </span>1
                  </>
                }
                variant="outline"
                colorScheme="neutral"
              />
              . 신청하지 않고 외박하면 벌점 3점이 쌓여요{' '}
              <Badge
                content={
                  <>
                    <span className="sr-only">출처 </span>2
                  </>
                }
                variant="outline"
                colorScheme="neutral"
              />
              .
            </p>

            <Item.Group ordered aria-label="신청하는 순서">
              {STEPS.map((step, index) => (
                <Item key={step.text}>
                  <Item.Media variant="soft" aria-hidden>
                    {index + 1}
                  </Item.Media>
                  <Item.Content>
                    <Item.Title>{step.text}</Item.Title>
                    <Item.Description>출처 {step.source}</Item.Description>
                  </Item.Content>
                </Item>
              ))}
            </Item.Group>

            <Alert colorScheme="info">
              <Alert.Title>주말과 공휴일 외박도 신청해요</Alert.Title>
              <Alert.Description>
                금요일에 나가면 목요일 밤까지 신청해야 해요. 게시판에도 같은 질문이 있었어요 (출처
                4).
              </Alert.Description>
            </Alert>

            <div className="flex gap-1">
              <IconButton
                variant="outline"
                size="tiny"
                aria-label="답 복사"
                icon={<DocumentDuplicateIcon />}
                onClick={() => toast.success('답을 복사했어요')}
              />
              <IconButton variant="outline" size="tiny" aria-label="답 공유" icon={<ShareIcon />} />
              <IconToggle
                variant="outline"
                size="tiny"
                aria-label="좋은 답"
                icon={<HandThumbUpIcon />}
              />
              <IconToggle
                variant="outline"
                size="tiny"
                aria-label="아쉬운 답"
                icon={<HandThumbDownIcon />}
              />
            </div>

            <section aria-labelledby="related" className="flex flex-col gap-3">
              <h2 id="related" className="text-headline-h5-bold">
                이어서 많이 묻는 질문
              </h2>
              <Card size="tiny">
                <Item.Group variant="bordered" aria-label="이어서 많이 묻는 질문">
                  {RELATED.map((question) => (
                    <Item key={question} onClick={() => setDraft(question)}>
                      <Item.Content>
                        <Item.Title>{question}</Item.Title>
                      </Item.Content>
                    </Item>
                  ))}
                </Item.Group>
              </Card>
            </section>
          </Tabs.Content>

          <Tabs.Content value="sources">
            <Card size="tiny">
              <Item.Group variant="bordered" aria-label="출처">
                {SOURCES.map((source, index) => (
                  <Item key={source.id} asChild>
                    <a href={`#${source.id}`}>
                      <Item.Media variant="soft" aria-hidden>
                        {index + 1}
                      </Item.Media>
                      <Item.Content>
                        <Item.Title>{source.title}</Item.Title>
                        <Item.Description>
                          {source.site} · {source.date}
                        </Item.Description>
                      </Item.Content>
                    </a>
                  </Item>
                ))}
              </Item.Group>
            </Card>
          </Tabs.Content>
        </Tabs>

        <form onSubmit={ask}>
          <TextArea
            aria-label="더 물어보기"
            placeholder="더 물어보기"
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
        </form>
      </main>
    );
  },
};
