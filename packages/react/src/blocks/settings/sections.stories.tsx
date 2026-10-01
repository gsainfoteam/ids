import { useState, type FormEvent } from 'react';

import {
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { toast } from '../../components/feedback/toast';
import { Field } from '../../components/form/field';
import { Select } from '../../components/form/select';
import { Switch } from '../../components/form/switch';
import { TextArea } from '../../components/form/text-area';
import { TextField } from '../../components/form/text-field';
import { Dialog } from '../../components/overlay/dialog';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Settings/Sections',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const MAJORS = [
  '기초교육학부',
  '전기전자컴퓨터공학과',
  '신소재공학과',
  '기계로봇공학과',
  '생명과학과',
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
    id: 'events',
    title: '행사와 혜택',
    description: '학생회와 동아리의 행사 소식을 받아요.',
    on: false,
  },
];

const DEVICES = [
  {
    id: 'mac',
    name: 'MacBook Air',
    where: '광주 · 지금',
    icon: <ComputerDesktopIcon />,
    current: true,
  },
  {
    id: 'phone',
    name: 'iPhone 16',
    where: '광주 · 2시간 전',
    icon: <DevicePhoneMobileIcon />,
    current: false,
  },
  {
    id: 'tablet',
    name: 'Galaxy Tab S10',
    where: '서울 · 3일 전',
    icon: <DeviceTabletIcon />,
    current: false,
  },
];

const CONFIRMATION = '계정 지우기';

export const PC: Story = {
  render: function Render() {
    const [confirmation, setConfirmation] = useState('');

    const saveProfile = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      toast.success('프로필을 저장했어요');
    };

    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <div className="flex flex-col gap-2">
          <h1 className="text-headline-h3-bold">설정</h1>
          <p className="text-body-b2-regular">프로필, 알림, 로그인한 기기를 관리해요.</p>
        </div>

        <Card asChild>
          <form onSubmit={saveProfile}>
            <Card.Header>
              <Card.Title asChild>
                <h2>프로필</h2>
              </Card.Title>
              <Card.Description>다른 학생에게 보이는 정보예요.</Card.Description>
            </Card.Header>
            <Card.Content className="flex flex-col gap-5">
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
                  <Field.Hint>게시판에 이 이름으로 보여요.</Field.Hint>
                </Field>
              </div>
              <Field>
                <Field.Label>학과</Field.Label>
                <Select name="major" defaultValue="전기전자컴퓨터공학과">
                  {MAJORS.map((major) => (
                    <Select.Item key={major} value={major}>
                      {major}
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
            </Card.Content>
            <Card.Footer className="justify-end border-t">
              <Button type="submit">저장</Button>
            </Card.Footer>
          </form>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title asChild>
              <h2>알림</h2>
            </Card.Title>
            <Card.Description>휴대폰과 브라우저로 받을 알림을 골라요.</Card.Description>
          </Card.Header>
          <Item.Group variant="bordered" aria-label="알림">
            {NOTIFICATIONS.map((notification) => (
              <Item key={notification.id}>
                <Item.Content>
                  <Item.Title id={`${notification.id}-title`}>{notification.title}</Item.Title>
                  <Item.Description id={`${notification.id}-description`}>
                    {notification.description}
                  </Item.Description>
                </Item.Content>
                <Item.Actions>
                  <Switch
                    name={notification.id}
                    defaultChecked={notification.on}
                    aria-labelledby={`${notification.id}-title`}
                    aria-describedby={`${notification.id}-description`}
                  />
                </Item.Actions>
              </Item>
            ))}
          </Item.Group>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title asChild>
              <h2>로그인한 기기</h2>
            </Card.Title>
            <Card.Description>모르는 기기가 있으면 바로 로그아웃하세요.</Card.Description>
            <Card.Action>
              <Button
                variant="outline"
                size="tiny"
                onClick={() => toast.success('다른 기기에서 모두 로그아웃했어요')}
              >
                모두 로그아웃
              </Button>
            </Card.Action>
          </Card.Header>
          <Item.Group variant="bordered" aria-label="로그인한 기기">
            {DEVICES.map((device) => (
              <Item key={device.id}>
                <Item.Media variant="soft">{device.icon}</Item.Media>
                <Item.Content>
                  <Item.Title>{device.name}</Item.Title>
                  <Item.Description>{device.where}</Item.Description>
                </Item.Content>
                <Item.Actions>
                  {device.current ? (
                    <Badge content="이 기기" variant="soft" colorScheme="primary" />
                  ) : (
                    <Button
                      variant="outline"
                      size="tiny"
                      aria-label={`${device.name} 로그아웃`}
                      onClick={() => toast.success(`${device.name}에서 로그아웃했어요`)}
                    >
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
            <Card.Title asChild>
              <h2>계정 지우기</h2>
            </Card.Title>
            <Card.Description>
              글과 댓글, 예약 기록이 모두 지워지고 되돌릴 수 없어요.
            </Card.Description>
          </Card.Header>
          <Card.Footer className="justify-end border-t">
            <Dialog onOpenChange={() => setConfirmation('')}>
              <Dialog.Trigger asChild>
                <Button variant="outline" colorScheme="danger">
                  계정 지우기
                </Button>
              </Dialog.Trigger>
              <Dialog.Content role="alertdialog">
                <Dialog.Header>
                  <Dialog.Title>정말 계정을 지울까요?</Dialog.Title>
                  <Dialog.Description>
                    지운 계정은 되돌릴 수 없어요. 계속하려면 아래에 ‘{CONFIRMATION}’를 적어 주세요.
                  </Dialog.Description>
                </Dialog.Header>
                <Field>
                  <Field.Label>확인 문구</Field.Label>
                  <TextField
                    value={confirmation}
                    onValueChange={setConfirmation}
                    placeholder={CONFIRMATION}
                    autoComplete="off"
                  />
                </Field>
                <Dialog.Footer>
                  <Dialog.Close asChild>
                    <Button variant="outline">취소</Button>
                  </Dialog.Close>
                  <Dialog.Close asChild>
                    <Button
                      colorScheme="danger"
                      disabled={confirmation !== CONFIRMATION}
                      onClick={() => toast('계정을 지웠어요')}
                    >
                      지우기
                    </Button>
                  </Dialog.Close>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog>
          </Card.Footer>
        </Card>
      </main>
    );
  },
};
