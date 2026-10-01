import { useState, type FormEvent } from 'react';

import {
  ArrowUpIcon,
  GlobeAltIcon,
  PaperClipIcon,
  PencilSquareIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

import { IconButton } from '../../components/action/icon-button';
import { Toggle } from '../../components/action/toggle';
import { Avatar } from '../../components/data/avatar';
import { Card } from '../../components/data/card';
import { toast } from '../../components/feedback/toast';
import { Select } from '../../components/form/select';
import { TextArea } from '../../components/form/text-area';
import { Spacer } from '../../components/layout/spacer';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Chatbot/Welcome',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const STARTERS = [
  { title: '오늘 학식 뭐야?', description: '학생식당과 기숙사식당의 점심, 저녁 메뉴' },
  { title: '다음 셔틀은 언제 와?', description: '지금 있는 정류장에서 가장 빨리 오는 셔틀' },
  { title: '이번 주 행사 알려 줘', description: '축제, 설명회, 동아리 모집까지' },
  { title: '수강 정정 언제까지야?', description: '학사 일정과 공지에서 찾아 볼게요' },
];

export const PC: Story = {
  render: function Render() {
    const [draft, setDraft] = useState('');
    const [model, setModel] = useState<string | null>('fast');

    const ask = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      toast(`‘${draft}’를 물어봤어요`);
      setDraft('');
    };

    return (
      <div className="flex min-h-dvh flex-col break-keep">
        <header className="flex items-center gap-2 px-4 py-3">
          <Select
            aria-label="모델"
            size="tiny"
            value={model}
            onValueChange={setModel}
            className="w-44"
          >
            <Select.Item value="fast">GIST 도우미 · 빠르게</Select.Item>
            <Select.Item value="deep">GIST 도우미 · 깊게 생각</Select.Item>
          </Select>
          <Spacer />
          <IconButton
            variant="outline"
            size="tiny"
            aria-label="새 대화"
            icon={<PencilSquareIcon />}
          />
          <Avatar name="김지수" size="tiny" />
        </header>

        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-4 py-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <Avatar name="GIST 도우미" aria-hidden>
              <Avatar.Fallback>
                <SparklesIcon />
              </Avatar.Fallback>
            </Avatar>
            <h1 className="text-headline-h3-bold">지수님, 무엇을 도와드릴까요?</h1>
          </div>

          <form onSubmit={ask}>
            <TextArea
              aria-label="GIST 도우미에게 묻기"
              placeholder="학식, 셔틀, 학사 일정, 무엇이든 물어보세요"
              rows={3}
              maxRows={10}
              value={draft}
              onValueChange={setDraft}
            >
              <TextArea.Input />
              <IconButton
                variant="outline"
                size="tiny"
                aria-label="파일 붙이기"
                icon={<PaperClipIcon />}
              />
              <Toggle variant="outline" size="tiny">
                <GlobeAltIcon />웹 검색
              </Toggle>
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

          <ul aria-label="이렇게 물어보세요" className="grid gap-3 sm:grid-cols-2">
            {STARTERS.map((starter) => (
              <li key={starter.title} className="flex">
                <Card size="tiny" className="w-full" onClick={() => setDraft(starter.title)}>
                  <Card.Header>
                    <Card.Title>{starter.title}</Card.Title>
                    <Card.Description>{starter.description}</Card.Description>
                  </Card.Header>
                </Card>
              </li>
            ))}
          </ul>
        </main>

        <p className="text-caption-c1-regular px-4 pb-4 text-center">
          GIST 도우미는 틀릴 수 있어요. 중요한 일정은 학교 공지로 한 번 더 확인하세요.
        </p>
      </div>
    );
  },
};
