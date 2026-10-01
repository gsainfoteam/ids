import { useState } from 'react';

import { SparklesIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Avatar } from '../../components/data/avatar';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { Empty } from '../../components/data/empty';
import { Item } from '../../components/data/item';
import { Field } from '../../components/form/field';
import { Switch } from '../../components/form/switch';
import { TextField } from '../../components/form/text-field';
import { Stepper } from '../../components/navigation/stepper';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Onboarding/Steps',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const BOARDS = ['학사', '장학', '행사', '모집', '동아리', '중고 거래', '분실물', '셔틀'];

const ALERTS = [
  {
    id: 'notices',
    title: '구독한 게시판의 새 글',
    description: '고른 게시판에 글이 올라오면',
    on: true,
  },
  {
    id: 'comments',
    title: '댓글과 멘션',
    description: '누가 나에게 답하거나 나를 부르면',
    on: true,
  },
  { id: 'shuttle', title: '셔틀 도착', description: '즐겨찾은 정류장에 5분 안에 오면', on: false },
];

const STEPS = ['관심 게시판', '알림', '프로필'];

export const PC: Story = {
  render: function Render() {
    const [step, setStep] = useState(0);
    const [boards, setBoards] = useState<string[]>(['학사', '행사']);
    const [nickname, setNickname] = useState('jisu');

    const done = step === STEPS.length;

    const toggleBoard = (board: string, selected: boolean) =>
      setBoards(selected ? [...boards, board] : boards.filter((other) => other !== board));

    return (
      <main className="flex min-h-dvh items-center justify-center px-4 py-12 break-keep">
        <Card className="w-full max-w-xl">
          <Card.Header className="gap-6">
            <Stepper value={step} aria-label="처음 설정" size="tiny">
              {STEPS.map((title) => (
                <Stepper.Item key={title}>
                  <Stepper.Title>{title}</Stepper.Title>
                </Stepper.Item>
              ))}
            </Stepper>
          </Card.Header>

          {done ? (
            <Empty variant="soft">
              <Empty.Media>
                <SparklesIcon />
              </Empty.Media>
              <Empty.Title>{nickname}님, 준비가 끝났어요</Empty.Title>
              <Empty.Description>
                고른 게시판 {boards.length}곳의 새 글을 첫 화면에 모아 드릴게요.
              </Empty.Description>
              <Empty.Actions>
                <Button asChild>
                  <a href="#home">인포팀 시작하기</a>
                </Button>
              </Empty.Actions>
            </Empty>
          ) : (
            <>
              <Card.Content className="flex flex-col gap-5">
                {step === 0 && (
                  <>
                    <div className="flex flex-col gap-2">
                      <h1 className="text-headline-h4-bold">어떤 소식이 궁금한가요?</h1>
                      <p className="text-body-b2-regular">
                        고른 게시판의 글을 첫 화면에 먼저 보여 드려요.
                      </p>
                    </div>
                    <div role="group" aria-label="관심 게시판" className="flex flex-wrap gap-2">
                      {BOARDS.map((board) => (
                        <Chip
                          key={board}
                          selected={boards.includes(board)}
                          onSelectedChange={(selected) => toggleBoard(board, selected)}
                        >
                          {board}
                        </Chip>
                      ))}
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="flex flex-col gap-2">
                      <h1 className="text-headline-h4-bold">알림을 받을까요?</h1>
                      <p className="text-body-b2-regular">나중에 설정에서 언제든 바꿀 수 있어요.</p>
                    </div>
                    <Item.Group variant="separated" aria-label="알림">
                      {ALERTS.map((alert) => (
                        <Item key={alert.id}>
                          <Item.Content>
                            <Item.Title id={`${alert.id}-title`}>{alert.title}</Item.Title>
                            <Item.Description>{alert.description}</Item.Description>
                          </Item.Content>
                          <Item.Actions>
                            <Switch
                              defaultChecked={alert.on}
                              aria-labelledby={`${alert.id}-title`}
                            />
                          </Item.Actions>
                        </Item>
                      ))}
                    </Item.Group>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="flex flex-col gap-2">
                      <h1 className="text-headline-h4-bold">다른 학생에게 어떻게 보일까요?</h1>
                      <p className="text-body-b2-regular">게시판과 댓글에 이 이름이 보여요.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Avatar name={nickname || '?'} />
                      <Button variant="outline" size="tiny">
                        사진 올리기
                      </Button>
                    </div>
                    <Field>
                      <Field.Label>닉네임</Field.Label>
                      <TextField value={nickname} onValueChange={setNickname} maxLength={16} />
                      <Field.Hint>한글, 영문, 숫자로 16자까지</Field.Hint>
                    </Field>
                  </>
                )}
              </Card.Content>

              <Card.Footer className="justify-between border-t">
                <Button
                  variant="outline"
                  onClick={() => setStep(step === 0 ? STEPS.length : step - 1)}
                >
                  {step === 0 ? '건너뛰기' : '이전'}
                </Button>
                <Button
                  disabled={
                    (step === 0 && boards.length === 0) || (step === 2 && nickname.trim() === '')
                  }
                  onClick={() => setStep(step + 1)}
                >
                  {step === STEPS.length - 1 ? '끝내기' : '다음'}
                </Button>
              </Card.Footer>
            </>
          )}
        </Card>
      </main>
    );
  },
};
