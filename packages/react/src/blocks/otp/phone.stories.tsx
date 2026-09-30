import { useState, type FormEvent } from 'react';

import { Button } from '../../components/action/button';
import { Card } from '../../components/data/card';
import { Alert } from '../../components/feedback/alert';
import { toast } from '../../components/feedback/toast';
import { Field } from '../../components/form/field';
import { OTPField } from '../../components/form/otp-field';
import { TelField } from '../../components/form/tel-field';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/OTP/Phone',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const PC: Story = {
  render: function Render() {
    const [phone, setPhone] = useState('');
    const [sent, setSent] = useState(false);

    return (
      <main className="flex min-h-dvh items-center justify-center px-4 py-12 break-keep">
        <Card className="w-full max-w-sm">
          <Card.Header>
            <Card.Title asChild>
              <h1>휴대폰 인증</h1>
            </Card.Title>
            <Card.Description>
              카풀과 중고 거래는 휴대폰 인증을 마친 뒤 쓸 수 있어요.
            </Card.Description>
          </Card.Header>

          <Card.Content>
            <form
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                toast.success('휴대폰 번호를 인증했어요');
              }}
              className="flex flex-col gap-5"
            >
              <div className="flex items-end gap-2">
                <Field className="flex-1">
                  <Field.Label>휴대폰 번호</Field.Label>
                  <TelField
                    name="phone"
                    defaultCountry="KR"
                    placeholder="010-1234-5678"
                    value={phone}
                    onValueChange={setPhone}
                    readOnly={sent}
                    required
                  />
                </Field>
                <Button
                  variant="outline"
                  disabled={phone === ''}
                  onClick={() => {
                    setSent(true);
                    toast('인증번호를 보냈어요');
                  }}
                >
                  {sent ? '다시 받기' : '인증번호 받기'}
                </Button>
              </div>

              {sent && (
                <>
                  <Alert colorScheme="info">
                    <Alert.Description>
                      문자가 오지 않으면 스팸 문자함을 확인하거나 1분 뒤 다시 받아 주세요.
                    </Alert.Description>
                  </Alert>
                  <Field>
                    <Field.Label>인증번호</Field.Label>
                    <OTPField length={6} name="code" autoFocus />
                    <Field.Hint>3분 안에 입력해 주세요.</Field.Hint>
                  </Field>
                </>
              )}

              <Button type="submit" disabled={!sent} className="w-full">
                인증하기
              </Button>
            </form>
          </Card.Content>
        </Card>
      </main>
    );
  },
};
