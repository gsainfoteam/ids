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
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/PC/Login',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const SIGNING_IN_TAKES_MS = 1200;

const link = cn(
  'rounded-indicator text-(--ids-color-accent) underline underline-offset-4 focus-ring hover:decoration-2',
);

const logo = cn(
  'grid size-10 place-items-center rounded-standard bg-(--ids-color-primary) text-subtitle-s1-bold text-(--ids-color-on-primary)',
);

export const Default: Story = {
  render: function Render() {
    const [signingIn, setSigningIn] = useState(false);

    const signIn = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSigningIn(true);
      window.setTimeout(() => {
        setSigningIn(false);
        toast.success('로그인했어요', { description: '보던 화면으로 돌아갑니다.' });
      }, SIGNING_IN_TAKES_MS);
    };

    return (
      <main className="grid min-h-dvh place-items-center bg-(--ids-color-muted) px-4 py-12 break-keep">
        <Card className="w-full max-w-sm">
          <Card.Header className="items-center text-center">
            <span aria-hidden className={logo}>
              i
            </span>
            <Card.Title asChild>
              <h1 className="text-headline-h4-bold">인포팀에 로그인</h1>
            </Card.Title>
            <Card.Description>계정 하나로 인포팀의 모든 서비스를 씁니다.</Card.Description>
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
              <div className="flex flex-col gap-2">
                <Field>
                  <Field.Label>비밀번호</Field.Label>
                  <PasswordField name="password" autoComplete="current-password" required />
                </Field>
                <a href="#forgot-password" className={cn(link, 'text-body-b3-regular self-end')}>
                  비밀번호를 잊었나요?
                </a>
              </div>
              <Label className="text-body-b3-medium inline-flex items-center gap-2">
                <Checkbox name="remember" defaultChecked />
                로그인 상태 유지
              </Label>
              <Button type="submit" disabled={signingIn} className="w-full">
                {signingIn && <Spinner />}
                {signingIn ? '로그인하는 중' : '로그인'}
              </Button>
            </form>
          </Card.Content>

          <Card.Footer className="text-body-b3-regular justify-center text-(--ids-color-on-muted)">
            처음이신가요?
            <a href="#sign-up" className={link}>
              회원가입
            </a>
          </Card.Footer>
        </Card>
      </main>
    );
  },
};

export const Split: Story = {
  render: function Render() {
    const [signingIn, setSigningIn] = useState(false);

    const signIn = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSigningIn(true);
      window.setTimeout(() => {
        setSigningIn(false);
        toast.success('로그인했어요', { description: '보던 화면으로 돌아갑니다.' });
      }, SIGNING_IN_TAKES_MS);
    };

    return (
      <main className="grid min-h-dvh break-keep lg:grid-cols-2">
        <section
          aria-label="인포팀 소개"
          className="hidden flex-col justify-between gap-12 bg-(--ids-color-primary) p-10 text-(--ids-color-on-primary) lg:flex"
        >
          <p className="text-subtitle-s1-bold flex items-center gap-3">
            <span
              aria-hidden
              className="rounded-standard grid size-10 place-items-center bg-(--ids-color-on-primary) text-(--ids-color-primary)"
            >
              i
            </span>
            GIST 인포팀
          </p>
          <figure className="flex flex-col gap-4">
            <blockquote className="text-headline-h4-semibold">
              “IDS 로 화면을 짜니까 새 서비스를 2주 만에 열 수 있었어요. 디자이너 없이도 모든 화면이
              한 벌처럼 보여요.”
            </blockquote>
            <figcaption className="text-body-b2-medium">
              박서연, Ziggle 프론트엔드 개발자
            </figcaption>
          </figure>
        </section>

        <div className="flex items-center justify-center px-4 py-12 sm:px-8">
          <div className="flex w-full max-w-sm flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-headline-h3-bold">다시 만나서 반가워요</h1>
              <p className="text-body-b2-regular text-(--ids-color-on-muted)">
                GIST 메일과 비밀번호로 로그인하세요.
              </p>
            </div>

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
              <div className="flex flex-col gap-2">
                <Field>
                  <Field.Label>비밀번호</Field.Label>
                  <PasswordField name="password" autoComplete="current-password" required />
                </Field>
                <a href="#forgot-password" className={cn(link, 'text-body-b3-regular self-end')}>
                  비밀번호를 잊었나요?
                </a>
              </div>
              <Button type="submit" disabled={signingIn} className="w-full">
                {signingIn && <Spinner />}
                {signingIn ? '로그인하는 중' : '로그인'}
              </Button>
            </form>

            <Divider>또는</Divider>

            <Button variant="outline" className="w-full">
              <AcademicCapIcon />
              GIST 계정으로 계속하기
            </Button>

            <p className="text-body-b3-regular text-center text-(--ids-color-on-muted)">
              처음이신가요?{' '}
              <a href="#sign-up" className={link}>
                회원가입
              </a>
            </p>
          </div>
        </div>
      </main>
    );
  },
};
