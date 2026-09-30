import { useState, type FormEvent } from 'react';

import { Button } from '../../components/action/button';
import { Card } from '../../components/data/card';
import { Spinner } from '../../components/feedback/spinner';
import { toast } from '../../components/feedback/toast';
import { Field } from '../../components/form/field';
import { OTPField } from '../../components/form/otp-field';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/OTP/Email',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const CHECKING_TAKES_MS = 1000;

export const PC: Story = {
  render: function Render() {
    const [checking, setChecking] = useState(false);
    const [resent, setResent] = useState(false);

    const check = () => {
      setChecking(true);
      window.setTimeout(() => {
        setChecking(false);
        toast.success('메일 주소를 확인했어요');
      }, CHECKING_TAKES_MS);
    };

    return (
      <main className="flex min-h-dvh items-center justify-center px-4 py-12 break-keep">
        <Card className="w-full max-w-sm">
          <Card.Header>
            <Card.Title asChild>
              <h1>메일을 확인해 주세요</h1>
            </Card.Title>
            <Card.Description>
              seoyeon@gm.gist.ac.kr 로 보낸 6자리 코드를 입력하세요.
            </Card.Description>
          </Card.Header>

          <Card.Content>
            <form
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                check();
              }}
              className="flex flex-col gap-5"
            >
              <Field>
                <Field.Label>인증 코드</Field.Label>
                <OTPField length={6} name="code" onComplete={check} disabled={checking}>
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
                <Field.Hint>코드는 10분 동안 쓸 수 있어요.</Field.Hint>
              </Field>
              <Button type="submit" disabled={checking} className="w-full">
                {checking && <Spinner />}
                {checking ? '확인하는 중' : '확인'}
              </Button>
            </form>
          </Card.Content>

          <Card.Footer className="justify-center border-t">
            메일이 오지 않았나요?
            <Button
              variant="soft"
              size="tiny"
              disabled={resent}
              onClick={() => {
                setResent(true);
                toast('코드를 다시 보냈어요', { description: '스팸함도 확인해 주세요.' });
              }}
            >
              {resent ? '다시 보냈어요' : '다시 보내기'}
            </Button>
          </Card.Footer>
        </Card>
      </main>
    );
  },
};
