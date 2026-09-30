import { useState, type ReactNode } from 'react';

import { BellIcon, LinkIcon, LockClosedIcon, UserCircleIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { Table } from '../../components/data/table';
import { toast } from '../../components/feedback/toast';
import { Checkbox } from '../../components/form/checkbox';
import { RadioGroup } from '../../components/form/radio-group';
import { Select } from '../../components/form/select';
import { Switch } from '../../components/form/switch';
import { Label } from '../../components/typography/label';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Settings/Sidebar',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type Section = 'account' | 'notifications' | 'privacy' | 'apps';

const SECTIONS: { id: Section; label: string; icon: ReactNode }[] = [
  { id: 'account', label: '계정', icon: <UserCircleIcon /> },
  { id: 'notifications', label: '알림', icon: <BellIcon /> },
  { id: 'privacy', label: '개인정보', icon: <LockClosedIcon /> },
  { id: 'apps', label: '연결된 앱', icon: <LinkIcon /> },
];

const isSection = (value: string): value is Section =>
  SECTIONS.some((section) => section.id === value);

const ACCOUNT = [
  { id: 'email', label: 'GIST 메일', value: 'jisu@gm.gist.ac.kr', action: null },
  { id: 'phone', label: '휴대폰', value: '010-2345-6789', action: '바꾸기' },
  { id: 'password', label: '비밀번호', value: '석 달 전에 바꿨어요', action: '바꾸기' },
  {
    id: 'student',
    label: '학생 인증',
    value: '2025학번 · 전기전자컴퓨터공학과',
    action: '다시 인증',
  },
];

const EVENTS = [
  { id: 'comments', label: '댓글과 답글', app: true, mail: false },
  { id: 'mentions', label: '나를 언급한 글', app: true, mail: true },
  { id: 'notices', label: '구독한 게시판의 새 글', app: true, mail: false },
  { id: 'reservations', label: '스터디룸 예약', app: true, mail: true },
];

const APPS = [
  {
    id: 'calendar',
    name: 'Google Calendar',
    description: '예약과 행사를 내 캘린더에 넣어요.',
    connected: true,
  },
  { id: 'github', name: 'GitHub', description: '동아리 저장소 알림을 받아요.', connected: false },
  { id: 'notion', name: 'Notion', description: '회의록을 게시판 글로 옮겨요.', connected: false },
];

export const PC: Story = {
  render: function Render() {
    const [section, setSection] = useState<Section>('account');

    const current = SECTIONS.find(({ id }) => id === section)!;

    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <div className="flex flex-col gap-2">
          <h1 className="text-headline-h3-bold">설정</h1>
          <p className="text-body-b2-regular">인포팀 계정 하나로 쓰는 모든 서비스에 적용돼요.</p>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
          <nav aria-label="설정 분류" className="hidden w-52 shrink-0 md:block">
            <Item.Group size="tiny" aria-label="설정 분류">
              {SECTIONS.map(({ id, label, icon }) => (
                <Item
                  key={id}
                  asChild
                  selected={section === id}
                  aria-current={section === id ? 'page' : undefined}
                >
                  <a
                    href={`#${id}`}
                    onClick={(event) => {
                      event.preventDefault();
                      setSection(id);
                    }}
                  >
                    <Item.Media>{icon}</Item.Media>
                    <Item.Content>
                      <Item.Title>{label}</Item.Title>
                    </Item.Content>
                  </a>
                </Item>
              ))}
            </Item.Group>
          </nav>

          <Select
            aria-label="설정 분류"
            value={section}
            onValueChange={(next) => {
              if (next !== null && isSection(next)) setSection(next);
            }}
            className="md:hidden"
          >
            {SECTIONS.map(({ id, label }) => (
              <Select.Item key={id} value={id}>
                {label}
              </Select.Item>
            ))}
          </Select>

          <section
            aria-labelledby="settings-section"
            className="flex min-w-0 flex-1 flex-col gap-6"
          >
            <h2 id="settings-section" className="text-headline-h5-bold">
              {current.label}
            </h2>

            {section === 'account' && (
              <Card>
                <Item.Group variant="bordered" aria-label="계정 정보">
                  {ACCOUNT.map((row) => (
                    <Item key={row.id}>
                      <Item.Content>
                        <Item.Title>{row.label}</Item.Title>
                        <Item.Description>{row.value}</Item.Description>
                      </Item.Content>
                      {row.action && (
                        <Item.Actions>
                          <Button
                            variant="outline"
                            size="tiny"
                            aria-label={`${row.label} ${row.action}`}
                          >
                            {row.action}
                          </Button>
                        </Item.Actions>
                      )}
                    </Item>
                  ))}
                </Item.Group>
              </Card>
            )}

            {section === 'notifications' && (
              <Table aria-label="알림 받을 곳">
                <Table.Header>
                  <Table.Row>
                    <Table.Head>알림</Table.Head>
                    <Table.Head align="center">앱</Table.Head>
                    <Table.Head align="center">메일</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {EVENTS.map((event) => (
                    <Table.Row key={event.id}>
                      <Table.Cell>{event.label}</Table.Cell>
                      <Table.Cell align="center">
                        <Checkbox
                          name={`${event.id}-app`}
                          defaultChecked={event.app}
                          aria-label={`${event.label}, 앱`}
                        />
                      </Table.Cell>
                      <Table.Cell align="center">
                        <Checkbox
                          name={`${event.id}-mail`}
                          defaultChecked={event.mail}
                          aria-label={`${event.label}, 메일`}
                        />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}

            {section === 'privacy' && (
              <Card>
                <Card.Header>
                  <Card.Title asChild>
                    <h3>프로필 공개 범위</h3>
                  </Card.Title>
                  <Card.Description>이름과 학과, 소개를 볼 수 있는 사람이에요.</Card.Description>
                </Card.Header>
                <Card.Content className="flex flex-col gap-5">
                  <RadioGroup<string>
                    name="visibility"
                    defaultValue="campus"
                    aria-label="프로필 공개 범위"
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
                          <Radio value="nobody" />
                          나만
                        </Label>
                      </div>
                    )}
                  </RadioGroup>
                </Card.Content>
                <Card.Footer className="flex-col items-stretch gap-3 border-t">
                  <Label>
                    <Switch name="searchable" defaultChecked />
                    이름으로 나를 찾을 수 있게 하기
                  </Label>
                  <Label>
                    <Switch name="activity" />
                    최근 활동을 프로필에 보이기
                  </Label>
                </Card.Footer>
              </Card>
            )}

            {section === 'apps' && (
              <Item.Group variant="separated" aria-label="연결된 앱">
                {APPS.map((app) => (
                  <Item key={app.id}>
                    <Item.Media>
                      <Avatar name={app.name} shape="square" />
                    </Item.Media>
                    <Item.Content>
                      <Item.Title>
                        {app.name}
                        {app.connected && (
                          <Badge content="연결됨" variant="soft" colorScheme="success" />
                        )}
                      </Item.Title>
                      <Item.Description>{app.description}</Item.Description>
                    </Item.Content>
                    <Item.Actions>
                      <Button
                        variant={app.connected ? 'outline' : 'soft'}
                        size="tiny"
                        aria-label={`${app.name} ${app.connected ? '연결 끊기' : '연결하기'}`}
                        onClick={() =>
                          toast.success(
                            app.connected
                              ? `${app.name} 연결을 끊었어요`
                              : `${app.name}에 연결했어요`,
                          )
                        }
                      >
                        {app.connected ? '연결 끊기' : '연결하기'}
                      </Button>
                    </Item.Actions>
                  </Item>
                ))}
              </Item.Group>
            )}
          </section>
        </div>
      </main>
    );
  },
};
