import { useState, type FormEvent } from 'react';

import { AcademicCapIcon, CubeTransparentIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { Progress } from '../../components/feedback/progress';
import { Spinner } from '../../components/feedback/spinner';
import { toast } from '../../components/feedback/toast';
import { Field } from '../../components/form/field';
import { PasswordField } from '../../components/form/password-field';
import { TextField } from '../../components/form/text-field';
import { Divider } from '../../components/layout/divider';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Login/Split',
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
      <main className="grid min-h-dvh break-keep lg:grid-cols-2">
        <div className="flex flex-col gap-10 p-6 md:p-10">
          <div className="text-subtitle-s2-semibold flex items-center gap-2">
            <Avatar name="인포팀" shape="square" size="tiny" aria-hidden>
              <Avatar.Fallback>
                <CubeTransparentIcon />
              </Avatar.Fallback>
            </Avatar>
            GIST 인포팀
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="flex w-full max-w-xs flex-col gap-8">
              <div className="flex flex-col gap-2 text-center">
                <h1 className="text-headline-h3-bold">다시 만나서 반가워요</h1>
                <p className="text-body-b2-regular">GIST 계정이나 이메일로 로그인하세요.</p>
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
                <Field>
                  <Field.Label>비밀번호</Field.Label>
                  <PasswordField name="password" autoComplete="current-password" required />
                </Field>
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
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button asChild variant="outline" size="tiny">
              <a href="#forgot-password">비밀번호 찾기</a>
            </Button>
            <Button asChild variant="soft" size="tiny">
              <a href="#sign-up">회원가입</a>
            </Button>
          </div>
        </div>

        <div aria-hidden className="hidden p-3 lg:flex">
          <Card variant="soft" className="flex-1 justify-center">
            <div className="mx-auto flex w-full max-w-sm flex-col gap-10">
              <div className="flex flex-col gap-3">
                <Card>
                  <Card.Header>
                    <Card.Description>다음 셔틀 · 학생회관</Card.Description>
                    <Card.Title>8분 뒤 광주송정역행</Card.Title>
                    <Card.Action>
                      <Badge content="12:20" variant="soft" colorScheme="primary" />
                    </Card.Action>
                  </Card.Header>
                  <Card.Content>
                    <Progress value={72} aria-label="다음 셔틀까지 남은 시간" />
                  </Card.Content>
                </Card>

                <Card size="tiny">
                  <Item>
                    <Item.Media variant="soft">
                      <MegaphoneIcon />
                    </Item.Media>
                    <Item.Content>
                      <Item.Title>가을 축제 부스 신청 마감</Item.Title>
                      <Item.Description>총학생회 · 오늘 18:00까지</Item.Description>
                    </Item.Content>
                    <Item.Actions>
                      <Badge content="새 글" variant="soft" colorScheme="danger" />
                    </Item.Actions>
                  </Item>
                </Card>

                <Card size="tiny">
                  <Item>
                    <Item.Media>
                      <Avatar name="박서연" size="tiny" />
                    </Item.Media>
                    <Item.Content>
                      <Item.Title>박서연님이 스터디룸을 예약했어요</Item.Title>
                      <Item.Description>도서관 3층 · 오후 7시</Item.Description>
                    </Item.Content>
                  </Item>
                </Card>
              </div>

              <div className="flex flex-col gap-2 text-center">
                <p className="text-headline-h4-bold">학교생활에 필요한 모든 것</p>
                <p className="text-body-b2-regular">공지, 셔틀, 학식, 도서관을 계정 하나로 써요.</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    );
  },
};
