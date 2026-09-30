import { useState } from 'react';

import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Accordion } from '../../components/data/accordion';
import { Tabs } from '../../components/navigation/tabs';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/FAQ/Columns',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const TOPICS = [
  {
    id: 'account',
    label: '계정',
    items: [
      {
        id: 'sso',
        question: 'GIST 계정으로 바로 쓸 수 있나요?',
        answer: '네, 학교 메일과 비밀번호로 로그인하면 계정이 저절로 만들어져요.',
      },
      {
        id: 'password',
        question: '비밀번호를 잊었어요',
        answer: '로그인 화면의 비밀번호 찾기에서 GIST 메일로 재설정 링크를 받아요.',
      },
      {
        id: 'delete',
        question: '탈퇴는 어떻게 하나요?',
        answer: '설정의 계정 지우기에서 할 수 있어요. 30일 안에 모든 정보를 지워요.',
      },
    ],
  },
  {
    id: 'shuttle',
    label: '셔틀',
    items: [
      {
        id: 'accuracy',
        question: '도착 시간이 정확한가요?',
        answer: '셔틀의 GPS 로 1분마다 다시 계산해요. 길이 막히면 몇 분 틀릴 수 있어요.',
      },
      {
        id: 'holiday',
        question: '공휴일에도 다니나요?',
        answer: '공휴일에는 주말 시간표로 다녀요. 그날은 앱 첫 화면에 알려 드려요.',
      },
    ],
  },
  {
    id: 'board',
    label: '게시판',
    items: [
      {
        id: 'write',
        question: '누구나 글을 쓸 수 있나요?',
        answer: '자유 게시판은 누구나, 공지 게시판은 학과와 학생회처럼 인증된 곳만 써요.',
      },
      {
        id: 'report',
        question: '이상한 글은 어떻게 신고하나요?',
        answer: '글의 더 보기 메뉴에서 신고하면 인포팀이 하루 안에 살펴봐요.',
      },
    ],
  },
];

export const PC: Story = {
  render: function Render() {
    const [topic, setTopic] = useState(TOPICS[0].id);

    return (
      <section
        aria-labelledby="faq"
        className="mx-auto grid w-full max-w-6xl items-start gap-10 px-4 py-20 break-keep sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)]"
      >
        <div className="flex flex-col gap-4">
          <h2 id="faq" className="text-headline-h2-bold">
            도움말
          </h2>
          <p className="text-body-b1-regular">
            주제를 고르면 그 주제의 질문만 보여요. 찾는 답이 없으면 GIST 도우미에게 물어보세요.
          </p>
          <Button asChild variant="soft" className="self-start">
            <a href="#assistant">
              <ChatBubbleLeftRightIcon />
              도우미에게 묻기
            </a>
          </Button>
        </div>

        <Tabs
          value={topic}
          onValueChange={setTopic}
          appearance="pill"
          className="flex flex-col gap-6"
        >
          <Tabs.List aria-label="주제">
            {TOPICS.map((item) => (
              <Tabs.Trigger key={item.id} value={item.id}>
                {item.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {TOPICS.map((item) => (
            <Tabs.Content key={item.id} value={item.id}>
              <Accordion type="multiple" variant="soft">
                {item.items.map((faq) => (
                  <Accordion.Item key={faq.id} value={faq.id}>
                    <Accordion.Trigger>{faq.question}</Accordion.Trigger>
                    <Accordion.Content>{faq.answer}</Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Tabs.Content>
          ))}
        </Tabs>
      </section>
    );
  },
};
