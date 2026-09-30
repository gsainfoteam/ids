import { useState, type FormEvent } from 'react';

import { AcademicCapIcon, CubeTransparentIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Avatar } from '../../components/data/avatar';
import { Alert } from '../../components/feedback/alert';
import { Field } from '../../components/form/field';
import { TextField } from '../../components/form/text-field';
import { Divider } from '../../components/layout/divider';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Login/Minimal',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const PC: Story = {
  render: function Render() {
    const [sentTo, setSentTo] = useState<string | null>(null);

    const sendLink = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSentTo(String(new FormData(event.currentTarget).get('email')));
    };

    return (
      <main className="flex min-h-dvh items-center justify-center px-4 py-12 break-keep">
        <div className="flex w-full max-w-xs flex-col gap-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <Avatar name="인포팀" shape="square" aria-hidden>
              <Avatar.Fallback>
                <CubeTransparentIcon />
              </Avatar.Fallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <h1 className="text-headline-h4-bold">인포팀에 오신 걸 환영해요</h1>
              <p className="text-body-b3-regular">
                이메일을 적으면 로그인 링크를 보내 드려요. 처음이라면 계정도 바로 만들어져요.
              </p>
            </div>
          </div>

          {sentTo ? (
            <Alert colorScheme="success">
              <Alert.Icon>
                <EnvelopeIcon />
              </Alert.Icon>
              <Alert.Title>메일을 보냈어요</Alert.Title>
              <Alert.Description>
                {sentTo} 받은편지함에서 링크를 누르면 로그인돼요. 10분 동안 쓸 수 있어요.
              </Alert.Description>
              <Alert.Actions>
                <Button variant="outline" size="tiny" onClick={() => setSentTo(null)}>
                  다른 이메일로
                </Button>
              </Alert.Actions>
            </Alert>
          ) : (
            <form onSubmit={sendLink} className="flex flex-col gap-3">
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
              <Button type="submit" className="w-full">
                이메일로 계속하기
              </Button>
            </form>
          )}

          <Divider>또는</Divider>

          <Button variant="outline" className="w-full">
            <AcademicCapIcon />
            GIST 계정으로 계속하기
          </Button>

          <p className="text-caption-c1-regular text-center">
            계속하면 인포팀 이용약관과 개인정보 처리방침에 동의하는 것으로 봐요.
          </p>
        </div>
      </main>
    );
  },
};
