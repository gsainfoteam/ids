import { EnvelopeIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Accordion } from '../../components/data/accordion';
import { Card } from '../../components/data/card';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/FAQ/Accordion',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const FAQ = [
  {
    id: 'free',
    question: '돈을 내야 하나요?',
    answer: '아니요. GIST 학생이라면 모든 서비스를 무료로 써요.',
  },
  {
    id: 'who',
    question: '누가 만드나요?',
    answer: 'GIST 학생 개발 동아리 인포팀이 만들고 운영해요. 학교가 아니라 학생이 만들어요.',
  },
  {
    id: 'data',
    question: '제 정보는 어디에 저장되나요?',
    answer: '학교 안 서버에 저장하고, 서비스 운영에만 써요. 탈퇴하면 30일 안에 모두 지워요.',
  },
  {
    id: 'alumni',
    question: '졸업하면 계정은 어떻게 되나요?',
    answer: '졸업 뒤 1년까지는 그대로 쓸 수 있어요. 그 뒤로는 읽기만 할 수 있어요.',
  },
  {
    id: 'join',
    question: '인포팀에 들어가고 싶어요',
    answer: '매 학기 초에 새 부원을 모집해요. 모집 공고는 게시판의 모집 분류에 올라와요.',
  },
];

export const PC: Story = {
  render: () => (
    <section
      aria-labelledby="faq"
      className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-20 break-keep sm:px-6"
    >
      <div className="flex flex-col gap-3 text-center">
        <h2 id="faq" className="text-headline-h2-bold">
          자주 묻는 질문
        </h2>
        <p className="text-body-b1-regular">궁금한 게 여기 없다면 언제든 물어보세요.</p>
      </div>

      <Accordion type="single" variant="outline" defaultValue="free">
        {FAQ.map((item) => (
          <Accordion.Item key={item.id} value={item.id}>
            <Accordion.Trigger>{item.question}</Accordion.Trigger>
            <Accordion.Content>{item.answer}</Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion>

      <Card variant="soft" className="items-center text-center">
        <Card.Header>
          <Card.Title>아직 궁금한 게 있나요?</Card.Title>
          <Card.Description>보통 하루 안에 인포팀이 답해요.</Card.Description>
        </Card.Header>
        <Card.Footer>
          <Button asChild variant="outline">
            <a href="mailto:team@gistory.me">
              <EnvelopeIcon />
              인포팀에 묻기
            </a>
          </Button>
        </Card.Footer>
      </Card>
    </section>
  ),
};
