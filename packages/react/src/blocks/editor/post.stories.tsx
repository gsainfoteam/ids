import { useState } from 'react';

import { CalendarDateTime } from '@internationalized/date';

import { Button } from '../../components/action/button';
import { Card } from '../../components/data/card';
import { toast } from '../../components/feedback/toast';
import { ChipField } from '../../components/form/chip-field';
import { DateTimeField } from '../../components/form/date-time-field';
import { Field } from '../../components/form/field';
import { FileField } from '../../components/form/file-field';
import { RadioGroup } from '../../components/form/radio-group';
import { Select } from '../../components/form/select';
import { Switch } from '../../components/form/switch';
import { TextArea } from '../../components/form/text-area';
import { TextField } from '../../components/form/text-field';
import { Tabs } from '../../components/navigation/tabs';
import { Label } from '../../components/typography/label';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Editor/Post',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const TAGS = ['축제', '동아리', '모집', '학사', '장학', '행사'];

const DRAFT =
  '10월 16일과 17일, 학생회관 앞 광장에서 가을 축제가 열립니다.\n\n부스를 내고 싶은 동아리는 아래 신청서를 채워 메일로 보내 주세요. 자리는 추첨으로 정합니다.';

export const PC: Story = {
  render: function Render() {
    const [title, setTitle] = useState('가을 축제 부스 운영 동아리 모집');
    const [body, setBody] = useState(DRAFT);
    const [scheduled, setScheduled] = useState(false);

    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-headline-h3-bold">글쓰기</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => toast('임시로 저장했어요', { description: '오후 2:14' })}
            >
              임시 저장
            </Button>
            <Button
              disabled={title.trim() === ''}
              onClick={() => toast.success(scheduled ? '예약했어요' : '글을 올렸어요')}
            >
              {scheduled ? '예약하기' : '올리기'}
            </Button>
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-4">
            <Field>
              <Field.Label>제목</Field.Label>
              <TextField name="title" value={title} onValueChange={setTitle} required />
            </Field>
            <div className="grid items-start gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
              <Field>
                <Field.Label>게시판</Field.Label>
                <Select name="board" defaultValue="events">
                  <Select.Item value="notices">공지</Select.Item>
                  <Select.Item value="events">행사</Select.Item>
                  <Select.Item value="free">자유</Select.Item>
                </Select>
              </Field>
              <Field>
                <Field.Label>태그</Field.Label>
                <ChipField
                  name="tags"
                  defaultValue={['축제', '동아리']}
                  creatable
                  placeholder="태그 더하기"
                >
                  {TAGS.map((tag) => (
                    <ChipField.Item key={tag} value={tag}>
                      {tag}
                    </ChipField.Item>
                  ))}
                </ChipField>
              </Field>
            </div>

            <Tabs defaultValue="write" className="flex flex-col gap-3">
              <Tabs.List aria-label="편집 보기">
                <Tabs.Trigger value="write">쓰기</Tabs.Trigger>
                <Tabs.Trigger value="preview">미리 보기</Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="write" forceMount>
                <TextArea
                  aria-label="본문"
                  rows={14}
                  maxRows={28}
                  maxLength={5000}
                  value={body}
                  onValueChange={setBody}
                >
                  <TextArea.Input />
                  <TextArea.Count />
                </TextArea>
              </Tabs.Content>
              <Tabs.Content value="preview">
                <Card>
                  <Card.Header>
                    <Card.Title asChild>
                      <h2 className="text-headline-h4-bold">{title || '제목 없음'}</h2>
                    </Card.Title>
                  </Card.Header>
                  <Card.Content className="text-body-b1-regular flex flex-col gap-3">
                    {body.split('\n\n').map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </Card.Content>
                </Card>
              </Tabs.Content>
            </Tabs>
          </div>

          <aside aria-label="올리기 설정" className="flex flex-col gap-4">
            <Card>
              <Card.Header>
                <Card.Title asChild>
                  <h2>표지</h2>
                </Card.Title>
                <Card.Description>목록과 공유 미리 보기에 보여요.</Card.Description>
              </Card.Header>
              <Card.Content>
                <FileField
                  aria-label="표지 그림"
                  appearance="dropzone"
                  accept="image/*"
                  maxSize={10 * 1024 * 1024}
                />
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title asChild>
                  <h2>공개 범위</h2>
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <RadioGroup<string>
                  name="visibility"
                  defaultValue="everyone"
                  aria-label="공개 범위"
                >
                  {({ Item: Radio }) => (
                    <div className="flex flex-col gap-3">
                      <Label>
                        <Radio value="everyone" />
                        누구나
                      </Label>
                      <Label>
                        <Radio value="campus" />
                        GIST 학생만
                      </Label>
                      <Label>
                        <Radio value="club" />
                        동아리 사람만
                      </Label>
                    </div>
                  )}
                </RadioGroup>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title asChild>
                  <h2>설정</h2>
                </Card.Title>
              </Card.Header>
              <Card.Content className="flex flex-col gap-3">
                <Label>
                  <Switch name="comments" defaultChecked />
                  댓글 받기
                </Label>
                <Label>
                  <Switch name="pinned" />
                  게시판 맨 위에 고정
                </Label>
                <Label>
                  <Switch checked={scheduled} onCheckedChange={setScheduled} />
                  나중에 올리기
                </Label>
                {scheduled && (
                  <Field>
                    <Field.Label>올릴 때</Field.Label>
                    <DateTimeField
                      name="publishAt"
                      defaultValue={new CalendarDateTime(2026, 10, 2, 9, 0)}
                    />
                  </Field>
                )}
              </Card.Content>
            </Card>
          </aside>
        </div>
      </main>
    );
  },
};
