import { useState, type FormEvent } from 'react';

import { DevicePhoneMobileIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Toggle } from '../../components/action/toggle';
import { ToggleGroup } from '../../components/action/toggle-group';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { Alert } from '../../components/feedback/alert';
import { toast } from '../../components/feedback/toast';
import { Field } from '../../components/form/field';
import { Select } from '../../components/form/select';
import { Switch } from '../../components/form/switch';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Notifications/Preferences',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type Channel = 'app' | 'mail';

const GROUPS: {
  title: string;
  events: { id: string; title: string; description: string; channels: Channel[] }[];
}[] = [
  {
    title: '내 글과 댓글',
    events: [
      {
        id: 'comments',
        title: '댓글과 답글',
        description: '내 글에 댓글이, 내 댓글에 답글이 달리면',
        channels: ['app'],
      },
      {
        id: 'mentions',
        title: '멘션',
        description: '누가 글이나 댓글에서 나를 부르면',
        channels: ['app', 'mail'],
      },
      { id: 'likes', title: '좋아요', description: '내 글을 누가 좋아하면', channels: [] },
    ],
  },
  {
    title: '학교생활',
    events: [
      {
        id: 'notices',
        title: '구독한 게시판',
        description: '구독한 게시판에 새 글이 올라오면',
        channels: ['app'],
      },
      {
        id: 'shuttle',
        title: '셔틀 도착',
        description: '즐겨찾은 정류장에 셔틀이 5분 안에 오면',
        channels: ['app'],
      },
      {
        id: 'reservations',
        title: '스터디룸 예약',
        description: '예약이 확정되거나 시작 10분 전이면',
        channels: ['app', 'mail'],
      },
    ],
  },
];

export const PC: Story = {
  render: function Render() {
    const [enabled, setEnabled] = useState(true);

    const save = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      toast.success('알림 설정을 저장했어요');
    };

    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <div className="flex flex-col gap-2">
          <h1 className="text-headline-h3-bold">알림 설정</h1>
          <p className="text-body-b2-regular">알림마다 앱과 메일 중 받을 곳을 골라요.</p>
        </div>

        <form onSubmit={save} className="flex flex-col gap-6">
          <Card>
            <Item>
              <Item.Content>
                <Item.Title id="enabled-title">알림 받기</Item.Title>
                <Item.Description id="enabled-description">
                  끄면 아래 설정과 상관없이 아무 알림도 오지 않아요.
                </Item.Description>
              </Item.Content>
              <Item.Actions>
                <Switch
                  name="enabled"
                  checked={enabled}
                  onCheckedChange={setEnabled}
                  aria-labelledby="enabled-title"
                  aria-describedby="enabled-description"
                />
              </Item.Actions>
            </Item>
          </Card>

          {!enabled && (
            <Alert colorScheme="warning">
              <Alert.Title>알림을 모두 껐어요</Alert.Title>
              <Alert.Description>셔틀 도착과 예약 알림도 오지 않아요.</Alert.Description>
            </Alert>
          )}

          {GROUPS.map((group) => (
            <Card key={group.title}>
              <Card.Header>
                <Card.Title asChild>
                  <h2>{group.title}</h2>
                </Card.Title>
              </Card.Header>
              <Item.Group variant="bordered" aria-label={group.title}>
                {group.events.map((event) => (
                  <Item key={event.id}>
                    <Item.Content>
                      <Item.Title id={`${event.id}-title`}>{event.title}</Item.Title>
                      <Item.Description>{event.description}</Item.Description>
                    </Item.Content>
                    <Item.Actions>
                      <ToggleGroup
                        selectionMode="multiple"
                        variant="outline"
                        size="tiny"
                        defaultValue={event.channels}
                        disabled={!enabled}
                        aria-labelledby={`${event.id}-title`}
                      >
                        <Toggle value="app">
                          <DevicePhoneMobileIcon />앱
                        </Toggle>
                        <Toggle value="mail">
                          <EnvelopeIcon />
                          메일
                        </Toggle>
                      </ToggleGroup>
                    </Item.Actions>
                  </Item>
                ))}
              </Item.Group>
            </Card>
          ))}

          <Card>
            <Card.Header>
              <Card.Title asChild>
                <h2>요약 메일</h2>
              </Card.Title>
              <Card.Description>놓친 알림을 모아서 한 번에 보내요.</Card.Description>
            </Card.Header>
            <Card.Content>
              <Field>
                <Field.Label>보내는 때</Field.Label>
                <Select name="digest" defaultValue="weekly" disabled={!enabled}>
                  <Select.Item value="daily">매일 아침 8시</Select.Item>
                  <Select.Item value="weekly">매주 월요일 아침 8시</Select.Item>
                  <Select.Item value="never">보내지 않기</Select.Item>
                </Select>
              </Field>
            </Card.Content>
          </Card>

          <div className="flex justify-end">
            <Button type="submit">저장</Button>
          </div>
        </form>
      </main>
    );
  },
};
