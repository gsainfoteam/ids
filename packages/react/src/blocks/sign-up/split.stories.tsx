import { type FormEvent } from 'react';

import {
  AcademicCapIcon,
  BellAlertIcon,
  BookOpenIcon,
  CubeTransparentIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Avatar } from '../../components/data/avatar';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { toast } from '../../components/feedback/toast';
import { Checkbox } from '../../components/form/checkbox';
import { Field } from '../../components/form/field';
import { PasswordField } from '../../components/form/password-field';
import { TextField } from '../../components/form/text-field';
import { Divider } from '../../components/layout/divider';
import { Label } from '../../components/typography/label';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/SignUp/Split',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const BENEFITS = [
  {
    title: '공지를 놓치지 않아요',
    description: '학과, 장학, 행사 공지 중 구독한 것만 알림으로 받아요.',
    icon: <BellAlertIcon />,
  },
  {
    title: '셔틀을 기다리지 않아요',
    description: '정류장마다 다음 셔틀이 언제 오는지 바로 보여요.',
    icon: <TruckIcon />,
  },
  {
    title: '스터디룸을 1분 만에',
    description: '도서관 빈자리와 스터디룸을 보고 그 자리에서 예약해요.',
    icon: <BookOpenIcon />,
  },
];

export const PC: Story = {
  render: () => (
    <main className="grid min-h-dvh break-keep lg:grid-cols-2">
      <div className="hidden p-3 lg:flex">
        <Card variant="soft" className="flex-1">
          <div className="flex flex-1 flex-col justify-between gap-10 p-6">
            <div className="text-subtitle-s2-semibold flex items-center gap-2">
              <Avatar name="인포팀" shape="square" size="tiny" aria-hidden>
                <Avatar.Fallback>
                  <CubeTransparentIcon />
                </Avatar.Fallback>
              </Avatar>
              GIST 인포팀
            </div>

            <div className="flex flex-col gap-8">
              <h2 className="text-headline-h2-bold">
                계정 하나로
                <br />
                학교생활이 가벼워져요
              </h2>
              <Item.Group aria-label="가입하면 좋은 점">
                {BENEFITS.map((benefit) => (
                  <Item key={benefit.title}>
                    <Item.Media variant="outline">{benefit.icon}</Item.Media>
                    <Item.Content>
                      <Item.Title>{benefit.title}</Item.Title>
                      <Item.Description>{benefit.description}</Item.Description>
                    </Item.Content>
                  </Item>
                ))}
              </Item.Group>
            </div>

            <Item>
              <Item.Media>
                <Avatar name="정예린" />
              </Item.Media>
              <Item.Content>
                <Item.Title>“조별 과제 스터디룸 잡는 게 제일 편해졌어요.”</Item.Title>
                <Item.Description>정예린 · 생명과학과 25학번</Item.Description>
              </Item.Content>
            </Item>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-center px-4 py-12 md:px-10">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-headline-h3-bold">계정 만들기</h1>
            <p className="text-body-b2-regular">GIST 학생이라면 누구나 무료로 써요.</p>
          </div>

          <Button variant="outline" className="w-full">
            <AcademicCapIcon />
            GIST 계정으로 가입하기
          </Button>

          <Divider>또는</Divider>

          <form
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              toast.success('가입 신청을 받았어요', {
                description: 'GIST 메일로 인증 코드를 보냈어요.',
              });
            }}
            className="flex flex-col gap-4"
          >
            <Field>
              <Field.Label>이름</Field.Label>
              <TextField name="name" autoComplete="name" required />
            </Field>
            <Field>
              <Field.Label>GIST 메일</Field.Label>
              <TextField
                type="email"
                name="email"
                autoComplete="username"
                placeholder="name@gm.gist.ac.kr"
                required
              />
            </Field>
            <Field>
              <Field.Label>비밀번호</Field.Label>
              <PasswordField name="password" autoComplete="new-password" minLength={8} required />
              <Field.Hint>8자 이상, 영문과 숫자를 섞어 주세요.</Field.Hint>
            </Field>
            <Label>
              <Checkbox name="terms" required />
              이용약관과 개인정보 처리방침에 동의해요
            </Label>
            <Button type="submit" className="w-full">
              가입하기
            </Button>
          </form>

          <div className="text-body-b3-regular flex items-center justify-center gap-2">
            이미 계정이 있나요?
            <Button asChild variant="soft" size="tiny">
              <a href="#login">로그인</a>
            </Button>
          </div>
        </div>
      </div>
    </main>
  ),
};
