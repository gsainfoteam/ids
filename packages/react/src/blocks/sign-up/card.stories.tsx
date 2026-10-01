import { useState, type FormEvent } from 'react';

import { AcademicCapIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { toast } from '../../components/feedback/toast';
import { CheckboxGroup } from '../../components/form/checkbox-group';
import { Field } from '../../components/form/field';
import { PasswordField } from '../../components/form/password-field';
import { TextField } from '../../components/form/text-field';
import { Divider } from '../../components/layout/divider';
import { Label } from '../../components/typography/label';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/SignUp/Card',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type Term = 'service' | 'privacy' | 'news';

const TERMS: { value: Term; label: string; required: boolean }[] = [
  { value: 'service', label: '이용약관', required: true },
  { value: 'privacy', label: '개인정보 수집과 이용', required: true },
  { value: 'news', label: '행사 소식 받기', required: false },
];

export const PC: Story = {
  render: function Render() {
    const [agreed, setAgreed] = useState<Term[]>([]);

    const requiredAgreed = TERMS.every((term) => !term.required || agreed.includes(term.value));

    const signUp = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      toast.success('가입 신청을 받았어요', { description: 'GIST 메일로 인증 코드를 보냈어요.' });
    };

    return (
      <main className="flex min-h-dvh items-center justify-center px-4 py-12 break-keep">
        <Card className="w-full max-w-md">
          <Card.Header>
            <Card.Title asChild>
              <h1>회원가입</h1>
            </Card.Title>
            <Card.Description>GIST 메일로 인포팀 계정을 만들어요.</Card.Description>
          </Card.Header>

          <Card.Content className="flex flex-col gap-5">
            <Button variant="outline" className="w-full">
              <AcademicCapIcon />
              GIST 계정으로 가입하기
            </Button>

            <Divider>또는 직접 입력</Divider>

            <form onSubmit={signUp} className="flex flex-col gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <Field.Label>이름</Field.Label>
                  <TextField name="name" autoComplete="name" required />
                </Field>
                <Field>
                  <Field.Label>학번</Field.Label>
                  <TextField
                    name="studentId"
                    inputMode="numeric"
                    pattern="\d{8}"
                    placeholder="20251234"
                    required
                  />
                </Field>
              </div>
              <Field>
                <Field.Label>GIST 메일</Field.Label>
                <TextField name="email" autoComplete="username" placeholder="아이디" required>
                  <TextField.Input />
                  <span>@gm.gist.ac.kr</span>
                </TextField>
                <Field.Hint>인증 코드를 이 주소로 보내요.</Field.Hint>
              </Field>
              <Field>
                <Field.Label>비밀번호</Field.Label>
                <PasswordField name="password" autoComplete="new-password" minLength={8} required />
                <Field.Hint>8자 이상, 영문과 숫자를 섞어 주세요.</Field.Hint>
              </Field>

              <CheckboxGroup<Term>
                name="terms"
                value={agreed}
                onValueChange={setAgreed}
                aria-label="약관 동의"
              >
                {({ All, Item }) => (
                  <div className="flex flex-col gap-3">
                    <Label>
                      <All />
                      모두 동의해요
                    </Label>
                    <Divider />
                    {TERMS.map((term) => (
                      <Label key={term.value}>
                        <Item value={term.value} />
                        {term.label}
                        <Badge
                          content={term.required ? '필수' : '선택'}
                          variant="soft"
                          colorScheme={term.required ? 'primary' : 'neutral'}
                        />
                      </Label>
                    ))}
                  </div>
                )}
              </CheckboxGroup>

              <Button type="submit" disabled={!requiredAgreed} className="w-full">
                가입하기
              </Button>
            </form>
          </Card.Content>

          <Card.Footer className="justify-center border-t">
            이미 계정이 있나요?
            <Button asChild variant="soft" size="tiny">
              <a href="#login">로그인</a>
            </Button>
          </Card.Footer>
        </Card>
      </main>
    );
  },
};
