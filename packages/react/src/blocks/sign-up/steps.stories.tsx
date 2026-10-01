import { useState, type FormEvent } from 'react';

import { CheckCircleIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Card } from '../../components/data/card';
import { Empty } from '../../components/data/empty';
import { Checkbox } from '../../components/form/checkbox';
import { CheckboxGroup } from '../../components/form/checkbox-group';
import { Field } from '../../components/form/field';
import { PasswordField } from '../../components/form/password-field';
import { Select } from '../../components/form/select';
import { Switch } from '../../components/form/switch';
import { TextField } from '../../components/form/text-field';
import { Divider } from '../../components/layout/divider';
import { Stepper } from '../../components/navigation/stepper';
import { Label } from '../../components/typography/label';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/SignUp/Steps',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const MAJORS = [
  ['basic', '기초교육학부'],
  ['physics', '물리·광과학과'],
  ['chemistry', '화학과'],
  ['life', '생명과학과'],
  ['earth', '지구환경공학과'],
  ['materials', '신소재공학과'],
  ['mechanical', '기계로봇공학과'],
  ['ee', '전기전자컴퓨터공학과'],
  ['math', '수리과학과'],
] as const;

export const PC: Story = {
  render: function Render() {
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');

    const next = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setStep(step + 1);
    };

    return (
      <main className="flex min-h-dvh justify-center px-4 py-12 break-keep md:py-20">
        <div className="flex w-full max-w-lg flex-col gap-8">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-headline-h3-bold">인포팀 계정 만들기</h1>
            <p className="text-body-b2-regular">세 단계면 끝나요. 1분이면 충분해요.</p>
          </div>

          <Stepper value={step} aria-label="가입 단계" className="flex flex-col gap-8">
            <Stepper.Item>
              <Stepper.Title>계정</Stepper.Title>
              <Stepper.Description className="hidden sm:block">메일과 비밀번호</Stepper.Description>
            </Stepper.Item>
            <Stepper.Item>
              <Stepper.Title>프로필</Stepper.Title>
              <Stepper.Description className="hidden sm:block">이름과 학과</Stepper.Description>
            </Stepper.Item>
            <Stepper.Item>
              <Stepper.Title>동의</Stepper.Title>
              <Stepper.Description className="hidden sm:block">약관과 알림</Stepper.Description>
            </Stepper.Item>

            <Stepper.Content value={0}>
              <Card asChild>
                <form onSubmit={next}>
                  <Card.Header>
                    <Card.Title asChild>
                      <h2>로그인할 계정</h2>
                    </Card.Title>
                    <Card.Description>학교 메일로 본인인지 확인해요.</Card.Description>
                  </Card.Header>
                  <Card.Content className="flex flex-col gap-4">
                    <Field>
                      <Field.Label>GIST 메일</Field.Label>
                      <TextField name="email" autoComplete="username" placeholder="아이디" required>
                        <TextField.Input />
                        <span>@gm.gist.ac.kr</span>
                      </TextField>
                    </Field>
                    <Field>
                      <Field.Label>비밀번호</Field.Label>
                      <PasswordField
                        name="password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                      />
                      <Field.Hint>8자 이상, 영문과 숫자를 섞어 주세요.</Field.Hint>
                    </Field>
                  </Card.Content>
                  <Card.Footer className="justify-end border-t">
                    <Button type="submit">다음</Button>
                  </Card.Footer>
                </form>
              </Card>
            </Stepper.Content>

            <Stepper.Content value={1}>
              <Card asChild>
                <form onSubmit={next}>
                  <Card.Header>
                    <Card.Title asChild>
                      <h2>프로필</h2>
                    </Card.Title>
                    <Card.Description>다른 학생에게 보이는 정보예요.</Card.Description>
                  </Card.Header>
                  <Card.Content className="flex flex-col gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <Field.Label>이름</Field.Label>
                        <TextField
                          name="name"
                          autoComplete="name"
                          value={name}
                          onValueChange={setName}
                          required
                        />
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
                      <Field.Label>학과</Field.Label>
                      <Select name="major" placeholder="학과를 고르세요" required>
                        {MAJORS.map(([value, label]) => (
                          <Select.Item key={value} value={value}>
                            {label}
                          </Select.Item>
                        ))}
                      </Select>
                      <Field.Hint>1학년은 기초교육학부를 고르세요.</Field.Hint>
                    </Field>
                  </Card.Content>
                  <Card.Footer className="justify-between border-t">
                    <Button variant="outline" onClick={() => setStep(0)}>
                      이전
                    </Button>
                    <Button type="submit">다음</Button>
                  </Card.Footer>
                </form>
              </Card>
            </Stepper.Content>

            <Stepper.Content value={2}>
              <Card asChild>
                <form onSubmit={next}>
                  <Card.Header>
                    <Card.Title asChild>
                      <h2>동의와 알림</h2>
                    </Card.Title>
                    <Card.Description>
                      알림은 가입한 뒤에도 설정에서 바꿀 수 있어요.
                    </Card.Description>
                  </Card.Header>
                  <Card.Content className="flex flex-col gap-5">
                    <CheckboxGroup name="terms" aria-label="약관 동의">
                      {({ All, Item }) => (
                        <div className="flex flex-col gap-3">
                          <Label>
                            <All />
                            모두 동의해요
                          </Label>
                          <Divider />
                          <Label>
                            <Item value="service" required />
                            이용약관 (필수)
                          </Label>
                          <Label>
                            <Item value="privacy" required />
                            개인정보 수집과 이용 (필수)
                          </Label>
                        </div>
                      )}
                    </CheckboxGroup>
                    <Divider />
                    <div className="flex flex-col gap-3">
                      <Label>
                        <Switch name="notifyNotices" defaultChecked />
                        학과 공지를 알림으로 받기
                      </Label>
                      <Label>
                        <Switch name="notifyEvents" />
                        행사 소식을 메일로 받기
                      </Label>
                    </div>
                    <Label>
                      <Checkbox name="adult" required />만 14세 이상이에요
                    </Label>
                  </Card.Content>
                  <Card.Footer className="justify-between border-t">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      이전
                    </Button>
                    <Button type="submit">가입하기</Button>
                  </Card.Footer>
                </form>
              </Card>
            </Stepper.Content>

            <Stepper.Content value={3}>
              <Empty variant="outline">
                <Empty.Media>
                  <CheckCircleIcon />
                </Empty.Media>
                <Empty.Title>{name ? `${name}님, 환영해요` : '환영해요'}</Empty.Title>
                <Empty.Description>
                  GIST 메일로 인증 링크를 보냈어요. 링크를 누르면 바로 시작할 수 있어요.
                </Empty.Description>
                <Empty.Actions>
                  <Button asChild>
                    <a href="#home">인포팀 둘러보기</a>
                  </Button>
                </Empty.Actions>
              </Empty>
            </Stepper.Content>
          </Stepper>
        </div>
      </main>
    );
  },
};
