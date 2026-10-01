import { useState, type FormEvent, type ReactNode } from 'react';

import {
  ArrowUpIcon,
  BuildingLibraryIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  MegaphoneIcon,
  SparklesIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { Item } from '../../components/data/item';
import { toast } from '../../components/feedback/toast';
import { ChipField } from '../../components/form/chip-field';
import { Field } from '../../components/form/field';
import { FileField } from '../../components/form/file-field';
import { Select } from '../../components/form/select';
import { Switch } from '../../components/form/switch';
import { TextArea } from '../../components/form/text-area';
import { TextField } from '../../components/form/text-field';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Agent/Builder',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const INSTRUCTIONS = `동아리 행사 준비를 돕는 에이전트예요.
- 행사 공지를 쓸 때는 날짜, 장소, 신청 방법을 꼭 넣어요.
- 스터디룸이나 강당을 예약하기 전에는 늘 먼저 물어봐요.
- 모르는 학교 규정은 지어내지 말고 학생처 공지를 찾아봐요.`;

const TOOLS: {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  on: boolean;
  asks?: boolean;
}[] = [
  {
    id: 'board',
    title: '게시판 읽고 쓰기',
    description: '공지를 찾고, 초안을 올려요.',
    icon: <MegaphoneIcon />,
    on: true,
  },
  {
    id: 'calendar',
    title: '캘린더에 일정 넣기',
    description: '동아리 캘린더에 행사를 더해요.',
    icon: <CalendarDaysIcon />,
    on: true,
  },
  {
    id: 'rooms',
    title: '장소 예약',
    description: '스터디룸과 강당을 예약해요.',
    icon: <BuildingLibraryIcon />,
    on: true,
    asks: true,
  },
  {
    id: 'mail',
    title: '메일 보내기',
    description: '부원에게 안내 메일을 보내요.',
    icon: <EnvelopeIcon />,
    on: false,
    asks: true,
  },
];

const KNOWLEDGE = [
  { name: '동아리 회칙.pdf', size: '220KB' },
  { name: '작년 축제 회의록.docx', size: '48KB' },
];

const STARTERS = ['가을 축제 부스 준비 계획 세워 줘', '신입 부원 환영회 공지 써 줘'];

export const PC: Story = {
  render: function Render() {
    const [name, setName] = useState('행사 준비 도우미');
    const [starters, setStarters] = useState<string[]>(STARTERS);

    const publish = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      toast.success(`${name}을 게시했어요`, { description: '동아리 부원 누구나 쓸 수 있어요.' });
    };

    return (
      <main className="mx-auto grid w-full max-w-6xl items-start gap-6 px-4 py-10 break-keep sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-14">
        <Card asChild>
          <form onSubmit={publish}>
            <Card.Header className="border-b">
              <Card.Title asChild>
                <h1>에이전트 만들기</h1>
              </Card.Title>
              <Card.Description>사진부 · 초안은 나만 볼 수 있어요</Card.Description>
              <Card.Action>
                <Badge content="초안" variant="soft" colorScheme="neutral" />
              </Card.Action>
            </Card.Header>

            <Card.Content className="flex flex-col gap-6">
              <div className="grid items-start gap-4 sm:grid-cols-2">
                <Field>
                  <Field.Label>이름</Field.Label>
                  <TextField name="name" value={name} onValueChange={setName} required />
                </Field>
                <Field>
                  <Field.Label>모델</Field.Label>
                  <Select name="model" defaultValue="deep">
                    <Select.Item value="fast">빠른 모델 · 짧은 답</Select.Item>
                    <Select.Item value="deep">깊게 생각하는 모델 · 계획과 도구</Select.Item>
                  </Select>
                </Field>
              </div>

              <Field>
                <Field.Label>지시문</Field.Label>
                <Field.Description>에이전트가 늘 지킬 규칙과 말투를 적어요.</Field.Description>
                <TextArea
                  name="instructions"
                  rows={6}
                  maxRows={16}
                  maxLength={4000}
                  defaultValue={INSTRUCTIONS}
                >
                  <TextArea.Input />
                  <TextArea.Count />
                </TextArea>
              </Field>

              <section aria-labelledby="tools" className="flex flex-col gap-3">
                <h2 id="tools" className="text-body-b3-semibold">
                  도구
                </h2>
                <Card size="tiny">
                  <Item.Group variant="bordered" aria-labelledby="tools">
                    {TOOLS.map((tool) => (
                      <Item key={tool.id}>
                        <Item.Media variant="soft">{tool.icon}</Item.Media>
                        <Item.Content>
                          <Item.Title id={`${tool.id}-title`}>
                            {tool.title}
                            {tool.asks && (
                              <Badge content="물어보고 써요" variant="soft" colorScheme="warning" />
                            )}
                          </Item.Title>
                          <Item.Description>{tool.description}</Item.Description>
                        </Item.Content>
                        <Item.Actions>
                          <Switch
                            name={tool.id}
                            defaultChecked={tool.on}
                            aria-labelledby={`${tool.id}-title`}
                          />
                        </Item.Actions>
                      </Item>
                    ))}
                  </Item.Group>
                </Card>
              </section>

              <Field>
                <Field.Label>지식</Field.Label>
                <Field.Description>에이전트가 답할 때 먼저 찾아볼 문서예요.</Field.Description>
                <FileField
                  name="knowledge"
                  appearance="dropzone"
                  multiple
                  accept=".pdf,.docx,.txt,.md"
                />
              </Field>
              <Item.Group variant="separated" size="tiny" aria-label="올린 문서">
                {KNOWLEDGE.map((file) => (
                  <Item key={file.name}>
                    <Item.Media variant="soft">
                      <DocumentTextIcon />
                    </Item.Media>
                    <Item.Content>
                      <Item.Title>{file.name}</Item.Title>
                      <Item.Description>{file.size} · 읽어 둠</Item.Description>
                    </Item.Content>
                    <Item.Actions>
                      <IconButton
                        variant="outline"
                        size="tiny"
                        aria-label={`${file.name} 지우기`}
                        icon={<TrashIcon />}
                      />
                    </Item.Actions>
                  </Item>
                ))}
              </Item.Group>

              <Field>
                <Field.Label>대화 시작 문장</Field.Label>
                <ChipField
                  name="starters"
                  value={starters}
                  onValueChange={setStarters}
                  creatable
                  placeholder="문장을 적고 Enter"
                />
              </Field>
            </Card.Content>

            <Card.Footer className="justify-end border-t">
              <Button variant="outline" onClick={() => toast('초안을 저장했어요')}>
                초안 저장
              </Button>
              <Button type="submit">게시하기</Button>
            </Card.Footer>
          </form>
        </Card>

        <section aria-labelledby="preview" className="flex flex-col gap-3 lg:sticky lg:top-6">
          <h2 id="preview" className="text-body-b3-semibold">
            미리 보기
          </h2>
          <Card>
            <Card.Header>
              <Avatar name={name} aria-hidden>
                <Avatar.Fallback>
                  <SparklesIcon />
                </Avatar.Fallback>
              </Avatar>
              <Card.Title>{name || '이름 없는 에이전트'}</Card.Title>
              <Card.Description>사진부 · 깊게 생각하는 모델</Card.Description>
            </Card.Header>
            <Card.Content className="flex flex-col gap-3">
              <p>안녕하세요. 행사 공지, 일정, 장소 예약을 도와드릴게요.</p>
              <div
                role="group"
                aria-label="대화 시작 문장"
                className="flex flex-col items-start gap-2"
              >
                {starters.map((starter) => (
                  <Chip key={starter} onClick={() => toast(`‘${starter}’로 대화를 시작해요`)}>
                    {starter}
                  </Chip>
                ))}
              </div>
            </Card.Content>
            <Card.Footer className="border-t">
              <TextField aria-label="미리 물어보기" placeholder="미리 물어보기" className="flex-1">
                <TextField.Input />
                <IconButton variant="solid" aria-label="묻기" icon={<ArrowUpIcon />} />
              </TextField>
            </Card.Footer>
          </Card>
        </section>
      </main>
    );
  },
};
