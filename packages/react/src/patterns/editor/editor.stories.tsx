import { useState } from 'react';

import {
  BoldIcon,
  CodeBracketIcon,
  ItalicIcon,
  LinkIcon,
  ListBulletIcon,
  PhotoIcon,
  StrikethroughIcon,
} from '@heroicons/react/24/outline';
import { CalendarDateTime } from '@internationalized/date';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { IconToggle } from '../../components/action/icon-toggle';
import { ToggleGroup } from '../../components/action/toggle-group';
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
import { Divider } from '../../components/layout/divider';
import { Tabs } from '../../components/navigation/tabs';
import { Label } from '../../components/typography/label';
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/PC/Editor',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const TAGS = ['축제', '동아리', '모집', '학사', '장학', '행사'];

const DRAFT =
  '10월 16일과 17일, 학생회관 앞 광장에서 가을 축제가 열립니다.\n\n부스를 내고 싶은 동아리는 아래 신청서를 채워 메일로 보내 주세요. 자리는 추첨으로 정합니다.';

const row = cn('flex items-center justify-between gap-3 text-body-b3-medium');

const option = cn('inline-flex items-center gap-2 text-body-b3-medium');

export const Default: Story = {
  render: function Render() {
    const [title, setTitle] = useState('가을 축제 부스 운영 동아리 모집');
    const [body, setBody] = useState(DRAFT);
    const [marks, setMarks] = useState<string[]>([]);
    const [scheduled, setScheduled] = useState(false);

    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 break-keep sm:px-6 lg:py-10">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-headline-h3-bold">글쓰기</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => toast('임시로 저장했어요', { description: '오후 2:14' })}
            >
              임시 저장
            </Button>
            <Button
              onClick={() => toast.success(scheduled ? '예약했어요' : '글을 올렸어요')}
              disabled={title.trim() === ''}
            >
              {scheduled ? '예약하기' : '올리기'}
            </Button>
          </div>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-4">
            <TextField
              aria-label="제목"
              placeholder="제목"
              value={title}
              onValueChange={setTitle}
              className="text-headline-h5-semibold"
            />
            <div className="grid items-start gap-3 sm:grid-cols-[180px_1fr]">
              <Select aria-label="게시판" defaultValue="events">
                <Select.Item value="notices">공지</Select.Item>
                <Select.Item value="events">행사</Select.Item>
                <Select.Item value="free">자유</Select.Item>
              </Select>
              <ChipField
                aria-label="태그"
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
            </div>

            <Tabs defaultValue="write" className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Tabs.List aria-label="편집 보기">
                  <Tabs.Trigger value="write">쓰기</Tabs.Trigger>
                  <Tabs.Trigger value="preview">미리 보기</Tabs.Trigger>
                </Tabs.List>
                <div className="flex items-center gap-1">
                  <ToggleGroup
                    variant="outline"
                    selectionMode="multiple"
                    aria-label="서식"
                    size="tiny"
                    value={marks}
                    onValueChange={setMarks}
                  >
                    <IconToggle value="bold" icon={<BoldIcon />} aria-label="굵게" />
                    <IconToggle value="italic" icon={<ItalicIcon />} aria-label="기울임" />
                    <IconToggle value="strike" icon={<StrikethroughIcon />} aria-label="취소선" />
                    <IconToggle value="code" icon={<CodeBracketIcon />} aria-label="코드" />
                  </ToggleGroup>
                  <Divider orientation="vertical" className="mx-1 h-5" />
                  <IconButton
                    variant="outline"
                    size="tiny"
                    aria-label="목록"
                    icon={<ListBulletIcon />}
                  />
                  <IconButton variant="outline" size="tiny" aria-label="링크" icon={<LinkIcon />} />
                  <IconButton
                    variant="outline"
                    size="tiny"
                    aria-label="사진"
                    icon={<PhotoIcon />}
                  />
                </div>
              </div>
              <Tabs.Content value="write" forceMount>
                <TextArea
                  aria-label="본문"
                  rows={12}
                  maxRows={24}
                  maxLength={5000}
                  value={body}
                  onValueChange={setBody}
                  className={cn(
                    marks.includes('bold') && 'font-bold',
                    marks.includes('italic') && 'italic',
                    marks.includes('strike') && 'line-through',
                    marks.includes('code') && 'font-mono',
                  )}
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
                <Card.Title>표지</Card.Title>
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
                <Card.Title>공개 범위</Card.Title>
              </Card.Header>
              <Card.Content>
                <RadioGroup<string> aria-label="공개 범위" defaultValue="everyone">
                  {({ Item: Radio }) => (
                    <>
                      <Label className={option}>
                        <Radio value="everyone" />
                        누구나
                      </Label>
                      <Label className={option}>
                        <Radio value="campus" />
                        GIST 학생만
                      </Label>
                      <Label className={option}>
                        <Radio value="club" />
                        동아리 사람만
                      </Label>
                    </>
                  )}
                </RadioGroup>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>설정</Card.Title>
              </Card.Header>
              <Card.Content className="flex flex-col gap-3">
                <Label className={row}>
                  댓글 받기
                  <Switch defaultChecked />
                </Label>
                <Label className={row}>
                  게시판 맨 위에 고정
                  <Switch />
                </Label>
                <Label className={row}>
                  나중에 올리기
                  <Switch checked={scheduled} onCheckedChange={setScheduled} />
                </Label>
                {scheduled && (
                  <Field>
                    <Field.Label>올릴 때</Field.Label>
                    <DateTimeField defaultValue={new CalendarDateTime(2026, 10, 2, 9, 0)} />
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
