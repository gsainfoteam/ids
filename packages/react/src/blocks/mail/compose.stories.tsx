import { useState, type FormEvent } from 'react';

import {
  ChevronDownIcon,
  ClockIcon,
  PaperAirplaneIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { ButtonGroup } from '../../components/action/button-group';
import { IconButton } from '../../components/action/icon-button';
import { Card } from '../../components/data/card';
import { toast } from '../../components/feedback/toast';
import { ChipField } from '../../components/form/chip-field';
import { Field } from '../../components/form/field';
import { FileField } from '../../components/form/file-field';
import { TextArea } from '../../components/form/text-area';
import { TextField } from '../../components/form/text-field';
import { Menu } from '../../components/overlay/menu';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Mail/Compose',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const CONTACTS = [
  { value: 'seoyeon@gm.gist.ac.kr', label: '박서연' },
  { value: 'doyun@gm.gist.ac.kr', label: '이도윤' },
  { value: 'yerin@gm.gist.ac.kr', label: '정예린' },
  { value: 'team@gistory.me', label: '인포팀' },
  { value: 'academic@gist.ac.kr', label: '학사팀' },
];

export const PC: Story = {
  render: function Render() {
    const [to, setTo] = useState<string[]>(['team@gistory.me']);

    const send = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      toast.success('메일을 보냈어요', { description: `받는 사람 ${to.length}명` });
    };

    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <Card asChild>
          <form onSubmit={send}>
            <Card.Header className="border-b">
              <Card.Title asChild>
                <h1>새 메일</h1>
              </Card.Title>
              <Card.Description>임시 저장됨 · 오후 2:14</Card.Description>
              <Card.Action>
                <IconButton
                  variant="outline"
                  colorScheme="danger"
                  aria-label="메일 버리기"
                  icon={<TrashIcon />}
                  onClick={() => toast('쓰던 메일을 버렸어요')}
                />
              </Card.Action>
            </Card.Header>

            <Card.Content className="flex flex-col gap-4">
              <Field>
                <Field.Label>받는 사람</Field.Label>
                <ChipField
                  name="to"
                  value={to}
                  onValueChange={setTo}
                  creatable
                  placeholder="이름이나 메일 주소"
                  required
                >
                  {CONTACTS.map((contact) => (
                    <ChipField.Item key={contact.value} value={contact.value}>
                      {contact.label}
                    </ChipField.Item>
                  ))}
                </ChipField>
              </Field>
              <Field>
                <Field.Label>제목</Field.Label>
                <TextField name="subject" defaultValue="10월 정기 회의 안건 보충" required />
              </Field>
              <Field>
                <Field.Label>내용</Field.Label>
                <TextArea
                  name="body"
                  rows={8}
                  maxRows={20}
                  maxLength={10000}
                  defaultValue={
                    '안녕하세요, 지수입니다.\n\n회의 안건에 해커톤 참가 팀 구성을 하나 더 넣었어요. 금요일 전까지 참가 여부를 댓글로 알려 주세요.'
                  }
                >
                  <TextArea.Input />
                  <TextArea.Count />
                </TextArea>
              </Field>
              <Field>
                <Field.Label>첨부 파일</Field.Label>
                <FileField name="attachments" multiple maxSize={25 * 1024 * 1024} />
                <Field.Hint>한 파일에 25MB 까지 붙일 수 있어요.</Field.Hint>
              </Field>
            </Card.Content>

            <Card.Footer className="justify-end border-t">
              <Button type="button" variant="outline" onClick={() => toast('임시 저장했어요')}>
                임시 저장
              </Button>
              <ButtonGroup variant="solid" aria-label="보내기">
                <Button type="submit" disabled={to.length === 0}>
                  <PaperAirplaneIcon />
                  보내기
                </Button>
                <Menu>
                  <Menu.Trigger asChild>
                    <IconButton aria-label="보내기 옵션" icon={<ChevronDownIcon />} />
                  </Menu.Trigger>
                  <Menu.Content>
                    <Menu.Label>예약 보내기</Menu.Label>
                    <Menu.Item onSelect={() => toast.success('내일 오전 9시에 보낼게요')}>
                      <ClockIcon />
                      내일 오전 9시
                    </Menu.Item>
                    <Menu.Item onSelect={() => toast.success('월요일 오전 9시에 보낼게요')}>
                      <ClockIcon />
                      월요일 오전 9시
                    </Menu.Item>
                  </Menu.Content>
                </Menu>
              </ButtonGroup>
            </Card.Footer>
          </form>
        </Card>
      </main>
    );
  },
};
