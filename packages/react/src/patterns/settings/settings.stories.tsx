import { useState, type FormEvent } from 'react';

import {
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconToggle } from '../../components/action/icon-toggle';
import { Toggle } from '../../components/action/toggle';
import { ToggleGroup } from '../../components/action/toggle-group';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { Progress } from '../../components/feedback/progress';
import { toast } from '../../components/feedback/toast';
import { Field } from '../../components/form/field';
import { PasswordField } from '../../components/form/password-field';
import { RadioGroup } from '../../components/form/radio-group';
import { Select } from '../../components/form/select';
import { Switch } from '../../components/form/switch';
import { TextArea } from '../../components/form/text-area';
import { TextField } from '../../components/form/text-field';
import { Tabs } from '../../components/navigation/tabs';
import { Dialog } from '../../components/overlay/dialog';
import { Label } from '../../components/typography/label';
import { IdsProvider, useTheme } from '../../components/utility/ids-provider';
import { cn } from '../../utils';

import type { IdsColor } from '../../tokens/types';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/Settings',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const COLOR_NAMES: Record<IdsColor, string> = {
  red: '빨강',
  orange: '주황',
  amber: '호박',
  yellow: '노랑',
  lime: '라임',
  green: '초록',
  emerald: '에메랄드',
  teal: '청록',
  cyan: '시안',
  sky: '하늘',
  blue: '파랑',
  indigo: '남색',
  violet: '제비꽃',
  purple: '보라',
  fuchsia: '자홍',
  pink: '분홍',
  rose: '장미',
};

function isColor(value: string): value is IdsColor {
  return value in COLOR_NAMES;
}

const MODES = ['light', 'dark', 'system'] as const;

function isMode(value: string): value is IdsProvider.Mode {
  return (MODES as readonly string[]).includes(value);
}

const DEPARTMENTS = [
  '전기전자컴퓨터공학부',
  '신소재공학부',
  '기계로봇공학부',
  '생명과학부',
  '물리·광과학과',
  '화학과',
];

const NOTIFICATIONS = [
  {
    id: 'notices',
    title: '새 공지',
    description: '구독한 게시판에 글이 올라오면 알려요.',
    on: true,
  },
  {
    id: 'comments',
    title: '댓글과 답글',
    description: '내 글에 댓글이, 내 댓글에 답글이 달리면 알려요.',
    on: true,
  },
  {
    id: 'shuttle',
    title: '셔틀 도착',
    description: '즐겨찾은 정류장에 셔틀이 5분 안에 오면 알려요.',
    on: false,
  },
  {
    id: 'marketing',
    title: '행사와 혜택',
    description: '학생회와 동아리의 행사 소식을 받아요.',
    on: false,
  },
];

const DEVICES = [
  {
    id: 'mac',
    name: 'MacBook Air',
    where: '광주, 지금',
    icon: <ComputerDesktopIcon />,
    current: true,
  },
  {
    id: 'phone',
    name: 'iPhone 16',
    where: '광주, 2시간 전',
    icon: <DevicePhoneMobileIcon />,
    current: false,
  },
  {
    id: 'tablet',
    name: 'Galaxy Tab S10',
    where: '서울, 3일 전',
    icon: <DeviceTabletIcon />,
    current: false,
  },
];

const sectionTitle = cn('text-body-b2-semibold');

const option = cn('inline-flex items-center gap-2 text-body-b3-medium');

export const Default: Story = {
  render: function Render() {
    const theme = useTheme();
    const [color, setColor] = useState<IdsColor>(theme.color);
    const [mode, setMode] = useState<IdsProvider.Mode>(theme.mode);
    const [confirmation, setConfirmation] = useState('');

    const save = (message: string) => (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      toast.success(message);
    };

    return (
      <IdsProvider
        color={color}
        mode={mode}
        className="min-h-dvh bg-(--ids-color-surface) break-keep text-(--ids-color-on-surface)"
      >
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 break-keep sm:px-6 lg:py-12">
          <header className="flex flex-col gap-1">
            <h1 className="text-headline-h3-bold">설정</h1>
            <p className="text-body-b2-regular text-(--ids-color-on-muted)">
              프로필과 알림, 화면, 보안을 바꿉니다.
            </p>
          </header>

          <Tabs defaultValue="profile" className="flex flex-col gap-6">
            <Tabs.List aria-label="설정 분류">
              <Tabs.Trigger value="profile">프로필</Tabs.Trigger>
              <Tabs.Trigger value="notifications">알림</Tabs.Trigger>
              <Tabs.Trigger value="appearance">화면</Tabs.Trigger>
              <Tabs.Trigger value="security">보안</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="profile">
              <Card>
                <Card.Header>
                  <Card.Title>프로필</Card.Title>
                  <Card.Description>다른 학생에게 보이는 정보예요.</Card.Description>
                </Card.Header>
                <Card.Content>
                  <form
                    id="profile"
                    onSubmit={save('프로필을 저장했어요')}
                    className="flex flex-col gap-5"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar name="김지수" />
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="tiny">
                          사진 바꾸기
                        </Button>
                        <Button variant="outline" size="tiny" colorScheme="danger">
                          지우기
                        </Button>
                      </div>
                    </div>
                    <div className="grid items-start gap-4 sm:grid-cols-2">
                      <Field>
                        <Field.Label>이름</Field.Label>
                        <TextField name="name" defaultValue="김지수" autoComplete="name" required />
                      </Field>
                      <Field>
                        <Field.Label>닉네임</Field.Label>
                        <TextField name="nickname" defaultValue="jisu" />
                        <Field.Description>게시판에 이 이름으로 보여요.</Field.Description>
                      </Field>
                    </div>
                    <Field>
                      <Field.Label>학과</Field.Label>
                      <Select name="department" defaultValue="전기전자컴퓨터공학부">
                        {DEPARTMENTS.map((department) => (
                          <Select.Item key={department} value={department}>
                            {department}
                          </Select.Item>
                        ))}
                      </Select>
                    </Field>
                    <Field>
                      <Field.Label>소개</Field.Label>
                      <TextArea
                        name="bio"
                        rows={3}
                        maxLength={160}
                        defaultValue="웹 프론트엔드와 디자인 시스템을 좋아해요. 인포팀에서 Ziggle 을 만들어요."
                      >
                        <TextArea.Input />
                        <TextArea.Count />
                      </TextArea>
                    </Field>
                  </form>
                </Card.Content>
                <Card.Footer className="justify-end">
                  <Button type="submit" form="profile">
                    저장
                  </Button>
                </Card.Footer>
              </Card>
            </Tabs.Content>

            <Tabs.Content value="notifications">
              <Card>
                <Card.Header>
                  <Card.Title>알림</Card.Title>
                  <Card.Description>무엇을 언제 받을지 고릅니다.</Card.Description>
                </Card.Header>
                <Card.Content className="flex flex-col gap-6">
                  <ul className="flex flex-col divide-y divide-(--ids-color-border)">
                    {NOTIFICATIONS.map(({ id, title, description, on }) => (
                      <li key={id} className="py-3 first:pt-0 last:pb-0">
                        <Label className="flex items-center justify-between gap-4">
                          <span className="flex flex-col gap-0.5">
                            <span className={sectionTitle}>{title}</span>
                            <span className="text-body-b3-regular text-(--ids-color-on-muted)">
                              {description}
                            </span>
                          </span>
                          <Switch defaultChecked={on} />
                        </Label>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-3">
                    <p className={sectionTitle}>메일로 받기</p>
                    <RadioGroup<string> aria-label="메일로 받기" defaultValue="daily">
                      {({ Item: Radio }) => (
                        <>
                          <Label className={option}>
                            <Radio value="instant" />
                            바로 받기
                          </Label>
                          <Label className={option}>
                            <Radio value="daily" />
                            하루에 한 번 모아서 받기
                          </Label>
                          <Label className={option}>
                            <Radio value="never" />
                            받지 않기
                          </Label>
                        </>
                      )}
                    </RadioGroup>
                  </div>
                </Card.Content>
              </Card>
            </Tabs.Content>

            <Tabs.Content value="appearance">
              <Card>
                <Card.Header>
                  <Card.Title>화면</Card.Title>
                  <Card.Description>고른 색과 모드가 이 화면에 바로 들어가요.</Card.Description>
                </Card.Header>
                <Card.Content className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <p className={sectionTitle}>테마 색 · {COLOR_NAMES[color]}</p>
                    <ToggleGroup
                      variant="outline"
                      aria-label="테마 색"
                      value={color}
                      onValueChange={(next) => {
                        if (next !== null && isColor(next)) setColor(next);
                      }}
                      className="flex-wrap"
                    >
                      {(Object.keys(COLOR_NAMES) as IdsColor[]).map((value) => (
                        <IconToggle
                          key={value}
                          value={value}
                          aria-label={COLOR_NAMES[value]}
                          icon={
                            <IdsProvider
                              color={value}
                              className="size-5 rounded-full bg-(--ids-color-primary)"
                            />
                          }
                        />
                      ))}
                    </ToggleGroup>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className={sectionTitle}>모드</p>
                    <ToggleGroup
                      variant="outline"
                      aria-label="모드"
                      value={mode}
                      onValueChange={(next) => {
                        if (next !== null && isMode(next)) setMode(next);
                      }}
                    >
                      <Toggle value="light">
                        <SunIcon />
                        밝게
                      </Toggle>
                      <Toggle value="dark">
                        <MoonIcon />
                        어둡게
                      </Toggle>
                      <Toggle value="system">
                        <ComputerDesktopIcon />
                        시스템
                      </Toggle>
                    </ToggleGroup>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className={sectionTitle}>미리 보기</p>
                    <div className="rounded-container flex flex-wrap items-center gap-3 border border-(--ids-color-border) p-4">
                      <Button size="tiny">저장</Button>
                      <Button size="tiny" variant="soft">
                        임시 저장
                      </Button>
                      <Badge content="새 글" variant="soft" colorScheme="primary" />
                      <Switch aria-label="미리 보기 스위치" defaultChecked />
                      <Progress value={64} aria-label="미리 보기 진행" className="w-32" />
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </Tabs.Content>

            <Tabs.Content value="security" className="flex flex-col gap-6">
              <Card>
                <Card.Header>
                  <Card.Title>비밀번호</Card.Title>
                  <Card.Description>90일마다 바꾸기를 권해요.</Card.Description>
                </Card.Header>
                <Card.Content>
                  <form
                    id="password"
                    onSubmit={save('비밀번호를 바꿨어요')}
                    className="grid items-start gap-4 sm:grid-cols-2"
                  >
                    <Field className="sm:col-span-2">
                      <Field.Label>지금 비밀번호</Field.Label>
                      <PasswordField
                        name="current-password"
                        autoComplete="current-password"
                        required
                      />
                    </Field>
                    <Field>
                      <Field.Label>새 비밀번호</Field.Label>
                      <PasswordField
                        name="new-password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                      />
                    </Field>
                    <Field>
                      <Field.Label>새 비밀번호 확인</Field.Label>
                      <PasswordField
                        name="confirm-password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                      />
                    </Field>
                  </form>
                </Card.Content>
                <Card.Footer className="justify-end">
                  <Button type="submit" form="password">
                    바꾸기
                  </Button>
                </Card.Footer>
              </Card>

              <Card>
                <Card.Header>
                  <Card.Title>로그인한 기기</Card.Title>
                  <Card.Description>모르는 기기가 있으면 로그아웃하세요.</Card.Description>
                </Card.Header>
                <Item.Group variant="bordered" aria-label="로그인한 기기">
                  {DEVICES.map(({ id, name, where, icon, current }) => (
                    <Item key={id}>
                      <Item.Media variant="soft">{icon}</Item.Media>
                      <Item.Content>
                        <Item.Title>{name}</Item.Title>
                        <Item.Description>{where}</Item.Description>
                      </Item.Content>
                      <Item.Actions>
                        {current ? (
                          <Badge content="이 기기" variant="soft" colorScheme="primary" />
                        ) : (
                          <Button variant="outline" size="tiny">
                            로그아웃
                          </Button>
                        )}
                      </Item.Actions>
                    </Item>
                  ))}
                </Item.Group>
              </Card>

              <Card>
                <Card.Header>
                  <Card.Title>계정 삭제</Card.Title>
                  <Card.Description>글과 댓글이 모두 지워지고 되돌릴 수 없어요.</Card.Description>
                </Card.Header>
                <Card.Footer>
                  <Dialog role="alertdialog" onOpenChange={() => setConfirmation('')}>
                    <Dialog.Trigger asChild>
                      <Button variant="outline" colorScheme="danger">
                        계정 삭제
                      </Button>
                    </Dialog.Trigger>
                    <Dialog.Content>
                      <Dialog.Header>
                        <Dialog.Title>계정을 지울까요?</Dialog.Title>
                        <Dialog.Description>
                          글 24개와 댓글 118개가 함께 지워집니다. 지운 계정은 되살릴 수 없어요.
                        </Dialog.Description>
                      </Dialog.Header>
                      <Field>
                        <Field.Label>확인하려면 &lsquo;삭제&rsquo;라고 입력하세요</Field.Label>
                        <TextField
                          value={confirmation}
                          onValueChange={setConfirmation}
                          autoComplete="off"
                        />
                      </Field>
                      <Dialog.Footer>
                        <Dialog.Close>취소</Dialog.Close>
                        <Button colorScheme="danger" disabled={confirmation !== '삭제'}>
                          계정 삭제
                        </Button>
                      </Dialog.Footer>
                    </Dialog.Content>
                  </Dialog>
                </Card.Footer>
              </Card>
            </Tabs.Content>
          </Tabs>
        </main>
      </IdsProvider>
    );
  },
};
