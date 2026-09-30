import { useState, type FormEvent } from 'react';

import {
  ArrowPathIcon,
  CubeTransparentIcon,
  KeyIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { QRCode } from '../../components/data/qr-code';
import { Spinner } from '../../components/feedback/spinner';
import { toast } from '../../components/feedback/toast';
import { Field } from '../../components/form/field';
import { PasswordField } from '../../components/form/password-field';
import { TextField } from '../../components/form/text-field';
import { Tabs } from '../../components/navigation/tabs';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Login/QR',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const SIGNING_IN_TAKES_MS = 1200;

const SESSIONS = ['7F3K-92QD', 'M4TX-0B7R', 'Q8LZ-5HWN'];

const STEPS = [
  '휴대폰에서 GIST 앱을 열어요',
  '오른쪽 위 스캔 버튼을 눌러요',
  '이 화면의 QR 코드를 비춰요',
];

export const PC: Story = {
  render: function Render() {
    const [session, setSession] = useState(0);
    const [signingIn, setSigningIn] = useState(false);

    const signIn = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSigningIn(true);
      window.setTimeout(() => {
        setSigningIn(false);
        toast.success('로그인했어요');
      }, SIGNING_IN_TAKES_MS);
    };

    return (
      <main className="flex min-h-dvh items-center justify-center px-4 py-12 break-keep">
        <Card className="w-full max-w-sm">
          <Card.Header>
            <Card.Title asChild>
              <h1>로그인</h1>
            </Card.Title>
            <Card.Description>휴대폰에 GIST 앱이 있다면 QR 코드가 더 빨라요.</Card.Description>
          </Card.Header>

          <Card.Content>
            <Tabs defaultValue="qr" appearance="pill" className="flex flex-col gap-5">
              <Tabs.List aria-label="로그인 방법">
                <Tabs.Trigger value="qr" className="flex-1">
                  <QrCodeIcon />
                  QR 코드
                </Tabs.Trigger>
                <Tabs.Trigger value="password" className="flex-1">
                  <KeyIcon />
                  비밀번호
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="qr" className="flex flex-col items-center gap-5">
                <QRCode
                  value={`https://gistory.me/login/qr/${SESSIONS[session]}`}
                  aria-label="로그인 QR 코드"
                  shape="rounded"
                  size={176}
                >
                  <QRCode.Logo>
                    <CubeTransparentIcon />
                  </QRCode.Logo>
                </QRCode>

                <Item.Group
                  ordered
                  aria-label="QR 코드로 로그인하는 법"
                  size="tiny"
                  className="w-full"
                >
                  {STEPS.map((step, index) => (
                    <Item key={step}>
                      <Item.Media variant="soft" aria-hidden>
                        {index + 1}
                      </Item.Media>
                      <Item.Content>
                        <Item.Title>{step}</Item.Title>
                      </Item.Content>
                    </Item>
                  ))}
                </Item.Group>

                <Button
                  variant="outline"
                  size="tiny"
                  onClick={() => setSession((session + 1) % SESSIONS.length)}
                >
                  <ArrowPathIcon />새 코드 받기
                </Button>
              </Tabs.Content>

              <Tabs.Content value="password">
                <form onSubmit={signIn} className="flex flex-col gap-4">
                  <Field>
                    <Field.Label>이메일</Field.Label>
                    <TextField
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="name@gm.gist.ac.kr"
                      required
                    />
                  </Field>
                  <Field>
                    <Field.Label>비밀번호</Field.Label>
                    <PasswordField name="password" autoComplete="current-password" required />
                  </Field>
                  <Button type="submit" disabled={signingIn} className="w-full">
                    {signingIn && <Spinner />}
                    {signingIn ? '로그인하는 중' : '로그인'}
                  </Button>
                </form>
              </Tabs.Content>
            </Tabs>
          </Card.Content>
        </Card>
      </main>
    );
  },
};
