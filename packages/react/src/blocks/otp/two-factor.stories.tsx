import { type FormEvent } from 'react';

import { DevicePhoneMobileIcon, KeyIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Card } from '../../components/data/card';
import { toast } from '../../components/feedback/toast';
import { Checkbox } from '../../components/form/checkbox';
import { Field } from '../../components/form/field';
import { OTPField } from '../../components/form/otp-field';
import { Tabs } from '../../components/navigation/tabs';
import { Label } from '../../components/typography/label';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/OTP/TwoFactor',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const signIn = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  toast.success('로그인했어요');
};

export const PC: Story = {
  render: () => (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12 break-keep">
      <Card className="w-full max-w-sm">
        <Card.Header>
          <Card.Title asChild>
            <h1>2단계 인증</h1>
          </Card.Title>
          <Card.Description>새 기기에서 로그인해서 한 번 더 확인해요.</Card.Description>
        </Card.Header>

        <Card.Content>
          <Tabs defaultValue="app" className="flex flex-col gap-5">
            <Tabs.List aria-label="인증 방법">
              <Tabs.Trigger value="app" className="flex-1">
                <DevicePhoneMobileIcon />
                인증 앱
              </Tabs.Trigger>
              <Tabs.Trigger value="recovery" className="flex-1">
                <KeyIcon />
                복구 코드
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="app">
              <form onSubmit={signIn} className="flex flex-col gap-5">
                <Field>
                  <Field.Label>인증 앱의 6자리 코드</Field.Label>
                  <OTPField length={6} name="code">
                    <OTPField.Group>
                      <OTPField.Slot index={0} />
                      <OTPField.Slot index={1} />
                      <OTPField.Slot index={2} />
                    </OTPField.Group>
                    <OTPField.Separator />
                    <OTPField.Group>
                      <OTPField.Slot index={3} />
                      <OTPField.Slot index={4} />
                      <OTPField.Slot index={5} />
                    </OTPField.Group>
                  </OTPField>
                  <Field.Hint>코드는 30초마다 바뀌어요.</Field.Hint>
                </Field>
                <Label>
                  <Checkbox name="trustDevice" />이 기기에서 30일 동안 묻지 않기
                </Label>
                <Button type="submit" className="w-full">
                  확인
                </Button>
              </form>
            </Tabs.Content>

            <Tabs.Content value="recovery">
              <form onSubmit={signIn} className="flex flex-col gap-5">
                <Field>
                  <Field.Label>복구 코드</Field.Label>
                  <OTPField length={8} name="recoveryCode" pattern="alphanumeric">
                    <OTPField.Group>
                      <OTPField.Slot index={0} />
                      <OTPField.Slot index={1} />
                      <OTPField.Slot index={2} />
                      <OTPField.Slot index={3} />
                    </OTPField.Group>
                    <OTPField.Separator />
                    <OTPField.Group>
                      <OTPField.Slot index={4} />
                      <OTPField.Slot index={5} />
                      <OTPField.Slot index={6} />
                      <OTPField.Slot index={7} />
                    </OTPField.Group>
                  </OTPField>
                  <Field.Hint>
                    2단계 인증을 켤 때 받은 코드예요. 한 번 쓰면 다시 쓸 수 없어요.
                  </Field.Hint>
                </Field>
                <Button type="submit" className="w-full">
                  복구 코드로 로그인
                </Button>
              </form>
            </Tabs.Content>
          </Tabs>
        </Card.Content>

        <Card.Footer className="justify-center border-t">
          휴대폰을 잃어버렸나요?
          <Button asChild variant="soft" size="tiny">
            <a href="#account-recovery">도움 받기</a>
          </Button>
        </Card.Footer>
      </Card>
    </main>
  ),
};
