import { useState, type FormEvent } from 'react';

import { ComputerDesktopIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { Time } from '@internationalized/date';

import { Button } from '../../components/action/button';
import { Toggle } from '../../components/action/toggle';
import { ToggleGroup } from '../../components/action/toggle-group';
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
import { TextField } from '../../components/form/text-field';
import { TimeField } from '../../components/form/time-field';
import { Divider } from '../../components/layout/divider';
import { Tabs } from '../../components/navigation/tabs';
import { Label } from '../../components/typography/label';
import { IdsProvider, defineIdsTheme, useTheme } from '../../components/utility/ids-provider';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Settings/Tabs',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const THEMES = {
  blue: defineIdsTheme({
    palette: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bedbff',
      300: '#8ec5ff',
      400: '#51a2ff',
      500: '#2b7fff',
      600: '#155dfc',
      700: '#1447e6',
      800: '#193cb8',
      900: '#1c398e',
      950: '#162456',
    },
  }),
  green: defineIdsTheme({
    palette: {
      50: '#f0fdf0',
      100: '#dcfcdc',
      200: '#bbf7bb',
      300: '#86ef86',
      400: '#4ade5e',
      500: '#22c53e',
      600: '#418501',
      700: '#366e01',
      800: '#2a5701',
      900: '#1e4001',
      950: '#0f2400',
    },
  }),
  orange: defineIdsTheme({
    palette: {
      50: '#fff6f2',
      100: '#ffe8de',
      200: '#ffc8b4',
      300: '#ffa082',
      400: '#ff7650',
      500: '#ff5722',
      600: '#ff4500',
      700: '#d63a00',
      800: '#a32d00',
      900: '#7a2200',
      950: '#451300',
    },
  }),
  teal: defineIdsTheme({
    palette: {
      50: '#f0fdfa',
      100: '#cbfbf1',
      200: '#96f7e4',
      300: '#46ecd5',
      400: '#00d5be',
      500: '#00bba7',
      600: '#009689',
      700: '#00786f',
      800: '#005f5a',
      900: '#0b4f4a',
      950: '#022f2e',
    },
  }),
  violet: defineIdsTheme({
    palette: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6ff',
      300: '#c4b4ff',
      400: '#a684ff',
      500: '#8e51ff',
      600: '#7f22fe',
      700: '#7008e7',
      800: '#5d0ec0',
      900: '#4d179a',
      950: '#2f0d68',
    },
  }),
  rose: defineIdsTheme({
    palette: {
      50: '#fff1f2',
      100: '#ffe4e6',
      200: '#ffccd3',
      300: '#ffa1ad',
      400: '#ff637e',
      500: '#ff2056',
      600: '#ec003f',
      700: '#c70036',
      800: '#a50036',
      900: '#8b0836',
      950: '#4d0218',
    },
  }),
};

type ThemeColor = keyof typeof THEMES;

const COLOR_NAMES: Record<ThemeColor, string> = {
  blue: '파랑',
  green: '초록',
  orange: '주황',
  teal: '청록',
  violet: '제비꽃',
  rose: '장미',
};

const isColor = (value: string): value is ThemeColor => value in COLOR_NAMES;

const MODES = ['light', 'dark', 'system'] as const;

const isMode = (value: string): value is IdsProvider.Mode =>
  (MODES as readonly string[]).includes(value);

const save = (message: string) => (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  toast.success(message);
};

export const PC: Story = {
  render: function Render() {
    const theme = useTheme();
    const [color, setColor] = useState<ThemeColor>('blue');
    const [mode, setMode] = useState<IdsProvider.Mode>(theme.mode);
    const [quiet, setQuiet] = useState(true);

    return (
      <IdsProvider.Scope theme={THEMES[color]} mode={mode} className="min-h-dvh">
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 break-keep sm:px-6 lg:py-14">
          <div className="flex flex-col gap-2">
            <h1 className="text-headline-h3-bold">설정</h1>
            <p className="text-body-b2-regular">
              바꾼 내용은 저장을 눌러야 반영돼요. 화면은 바로 바뀌어요.
            </p>
          </div>

          <Tabs defaultValue="general" className="flex flex-col gap-6">
            <Tabs.List aria-label="설정 분류">
              <Tabs.Trigger value="general">일반</Tabs.Trigger>
              <Tabs.Trigger value="notifications">알림</Tabs.Trigger>
              <Tabs.Trigger value="appearance">화면</Tabs.Trigger>
              <Tabs.Trigger value="security">보안</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="general">
              <Card asChild>
                <form onSubmit={save('일반 설정을 저장했어요')}>
                  <Card.Header>
                    <Card.Title asChild>
                      <h2>일반</h2>
                    </Card.Title>
                    <Card.Description>
                      이름과 언어, 앱을 열면 처음 보일 화면이에요.
                    </Card.Description>
                  </Card.Header>
                  <Card.Content className="grid items-start gap-5 sm:grid-cols-2">
                    <Field>
                      <Field.Label>이름</Field.Label>
                      <TextField name="name" defaultValue="김지수" autoComplete="name" />
                    </Field>
                    <Field>
                      <Field.Label>GIST 메일</Field.Label>
                      <TextField name="email" defaultValue="jisu@gm.gist.ac.kr" readOnly />
                      <Field.Hint>학교 메일은 바꿀 수 없어요.</Field.Hint>
                    </Field>
                    <Field>
                      <Field.Label>언어</Field.Label>
                      <Select name="language" defaultValue="ko">
                        <Select.Item value="ko">한국어</Select.Item>
                        <Select.Item value="en">English</Select.Item>
                      </Select>
                    </Field>
                    <Field>
                      <Field.Label>시작 화면</Field.Label>
                      <Select name="home" defaultValue="board">
                        <Select.Item value="board">게시판</Select.Item>
                        <Select.Item value="shuttle">셔틀 시간표</Select.Item>
                        <Select.Item value="cafeteria">오늘 학식</Select.Item>
                      </Select>
                    </Field>
                  </Card.Content>
                  <Card.Footer className="justify-end border-t">
                    <Button type="submit">저장</Button>
                  </Card.Footer>
                </form>
              </Card>
            </Tabs.Content>

            <Tabs.Content value="notifications">
              <Card asChild>
                <form onSubmit={save('알림 설정을 저장했어요')}>
                  <Card.Header>
                    <Card.Title asChild>
                      <h2>알림</h2>
                    </Card.Title>
                    <Card.Description>어떤 글을 알림으로 받을지 골라요.</Card.Description>
                  </Card.Header>
                  <Card.Content className="flex flex-col gap-6">
                    <RadioGroup<string>
                      name="scope"
                      defaultValue="subscribed"
                      aria-label="알림 범위"
                    >
                      {({ Item: Radio }) => (
                        <div className="flex flex-col gap-3">
                          <Label>
                            <Radio value="all" />
                            모든 새 글
                          </Label>
                          <Label>
                            <Radio value="subscribed" />
                            구독한 게시판의 글만
                          </Label>
                          <Label>
                            <Radio value="mentions" />
                            나를 언급한 글만
                          </Label>
                        </div>
                      )}
                    </RadioGroup>
                    <Divider />
                    <Item>
                      <Item.Content>
                        <Item.Title id="quiet-title">조용한 시간</Item.Title>
                        <Item.Description id="quiet-description">
                          이 시간에는 소리와 진동 없이 알림만 쌓여요.
                        </Item.Description>
                      </Item.Content>
                      <Item.Actions>
                        <Switch
                          checked={quiet}
                          onCheckedChange={setQuiet}
                          aria-labelledby="quiet-title"
                          aria-describedby="quiet-description"
                        />
                      </Item.Actions>
                    </Item>
                    {quiet && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                          <Field.Label>시작</Field.Label>
                          <TimeField name="quietFrom" defaultValue={new Time(23, 0)} />
                        </Field>
                        <Field>
                          <Field.Label>끝</Field.Label>
                          <TimeField name="quietTo" defaultValue={new Time(7, 30)} />
                        </Field>
                      </div>
                    )}
                  </Card.Content>
                  <Card.Footer className="justify-end border-t">
                    <Button type="submit">저장</Button>
                  </Card.Footer>
                </form>
              </Card>
            </Tabs.Content>

            <Tabs.Content value="appearance">
              <Card>
                <Card.Header>
                  <Card.Title asChild>
                    <h2>화면</h2>
                  </Card.Title>
                  <Card.Description>고른 모드와 색이 이 화면에 바로 들어가요.</Card.Description>
                </Card.Header>
                <Card.Content className="flex flex-col gap-6">
                  <div className="grid items-start gap-5 sm:grid-cols-2">
                    <Field>
                      <Field.Label>모드</Field.Label>
                      <ToggleGroup
                        variant="outline"
                        value={mode}
                        onValueChange={(next) => {
                          if (next !== null && isMode(next)) setMode(next);
                        }}
                      >
                        <Toggle value="light">
                          <SunIcon />
                          라이트
                        </Toggle>
                        <Toggle value="dark">
                          <MoonIcon />
                          다크
                        </Toggle>
                        <Toggle value="system">
                          <ComputerDesktopIcon />
                          시스템
                        </Toggle>
                      </ToggleGroup>
                    </Field>
                    <Field>
                      <Field.Label>테마 색</Field.Label>
                      <Select
                        value={color}
                        onValueChange={(next) => {
                          if (next !== null && isColor(next)) setColor(next);
                        }}
                      >
                        {(Object.keys(COLOR_NAMES) as ThemeColor[]).map((value) => (
                          <Select.Item key={value} value={value}>
                            <IdsProvider.Scope theme={THEMES[value]} asChild>
                              <Badge dot colorScheme="primary" aria-hidden />
                            </IdsProvider.Scope>
                            {COLOR_NAMES[value]}
                          </Select.Item>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <Divider />
                  <Card variant="soft" size="tiny">
                    <Card.Header>
                      <Card.Title asChild>
                        <h3>미리 보기</h3>
                      </Card.Title>
                      <Card.Action>
                        <Badge content="새 글 3" variant="soft" colorScheme="primary" />
                      </Card.Action>
                    </Card.Header>
                    <Card.Content className="flex flex-col gap-4">
                      <Progress value={62} aria-label="이번 학기 출석" />
                      <div className="flex flex-wrap gap-2">
                        <Button size="tiny">기본 버튼</Button>
                        <Button size="tiny" variant="soft">
                          옅은 버튼
                        </Button>
                        <Button size="tiny" variant="outline">
                          테두리 버튼
                        </Button>
                      </div>
                    </Card.Content>
                  </Card>
                </Card.Content>
              </Card>
            </Tabs.Content>

            <Tabs.Content value="security">
              <Card asChild>
                <form onSubmit={save('비밀번호를 바꿨어요')}>
                  <Card.Header>
                    <Card.Title asChild>
                      <h2>보안</h2>
                    </Card.Title>
                    <Card.Description>비밀번호는 석 달에 한 번 바꾸는 게 좋아요.</Card.Description>
                  </Card.Header>
                  <Card.Content className="flex flex-col gap-5">
                    <div className="grid items-start gap-5 sm:grid-cols-2">
                      <Field>
                        <Field.Label>지금 비밀번호</Field.Label>
                        <PasswordField name="current" autoComplete="current-password" />
                      </Field>
                      <Field>
                        <Field.Label>새 비밀번호</Field.Label>
                        <PasswordField name="next" autoComplete="new-password" minLength={8} />
                        <Field.Hint>8자 이상, 영문과 숫자를 섞어 주세요.</Field.Hint>
                      </Field>
                    </div>
                    <Divider />
                    <Item>
                      <Item.Content>
                        <Item.Title id="two-factor-title">2단계 인증</Item.Title>
                        <Item.Description id="two-factor-description">
                          새 기기에서 로그인하면 인증 앱의 코드를 한 번 더 물어요.
                        </Item.Description>
                      </Item.Content>
                      <Item.Actions>
                        <Switch
                          defaultChecked
                          aria-labelledby="two-factor-title"
                          aria-describedby="two-factor-description"
                        />
                      </Item.Actions>
                    </Item>
                  </Card.Content>
                  <Card.Footer className="justify-end border-t">
                    <Button type="submit">비밀번호 바꾸기</Button>
                  </Card.Footer>
                </form>
              </Card>
            </Tabs.Content>
          </Tabs>
        </main>
      </IdsProvider.Scope>
    );
  },
};
