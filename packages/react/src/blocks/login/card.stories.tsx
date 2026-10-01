import { useState, type FormEvent } from 'react';

import { AcademicCapIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Card } from '../../components/data/card';
import { Spinner } from '../../components/feedback/spinner';
import { toast } from '../../components/feedback/toast';
import { Checkbox } from '../../components/form/checkbox';
import { Field } from '../../components/form/field';
import { PasswordField } from '../../components/form/password-field';
import { TextField } from '../../components/form/text-field';
import { Divider } from '../../components/layout/divider';
import { Label } from '../../components/typography/label';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Login/Card',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const SIGNING_IN_TAKES_MS = 1200;

export const PC: Story = {
  render: function Render() {
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
            <Card.Description>GIST 계정 하나로 인포팀의 모든 서비스를 써요.</Card.Description>
          </Card.Header>

          <Card.Content className="flex flex-col gap-5">
            <Button variant="outline" className="w-full">
              <AcademicCapIcon />
              GIST 계정으로 계속하기
            </Button>

            <Divider>또는 이메일로</Divider>

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
              <div className="flex items-center justify-between gap-3">
                <Label>
                  <Checkbox name="remember" defaultChecked />
                  로그인 상태 유지
                </Label>
                <Button asChild variant="outline" size="tiny">
                  <a href="#forgot-password">비밀번호 찾기</a>
                </Button>
              </div>
              <Button type="submit" disabled={signingIn} className="w-full">
                {signingIn && <Spinner />}
                {signingIn ? '로그인하는 중' : '로그인'}
              </Button>
            </form>
          </Card.Content>

          <Card.Footer className="justify-center border-t">
            처음이신가요?
            <Button asChild variant="soft" size="tiny">
              <a href="#sign-up">회원가입</a>
            </Button>
          </Card.Footer>
        </Card>
      </main>
    );
  },
};
