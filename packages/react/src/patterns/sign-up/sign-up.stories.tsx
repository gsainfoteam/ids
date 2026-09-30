import { useState, type FormEvent } from 'react';

import { CheckCircleIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Card } from '../../components/data/card';
import { Empty } from '../../components/data/empty';
import { toast } from '../../components/feedback/toast';
import { Checkbox } from '../../components/form/checkbox';
import { Field } from '../../components/form/field';
import { OTPField } from '../../components/form/otp-field';
import { PasswordField } from '../../components/form/password-field';
import { Select } from '../../components/form/select';
import { TextField } from '../../components/form/text-field';
import { Divider } from '../../components/layout/divider';
import { Stepper } from '../../components/navigation/stepper';
import { Label } from '../../components/typography/label';
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/PC/SignUp',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const STEPS = [
  { title: '계정', description: '메일과 비밀번호' },
  { title: '학생 인증', description: '학번과 인증번호' },
  { title: '약관', description: '동의하고 마치기' },
];

const DEPARTMENTS = [
  '전기전자컴퓨터공학부',
  '신소재공학부',
  '기계로봇공학부',
  '지구환경공학부',
  '생명과학부',
  '물리·광과학과',
  '화학과',
];

const TERMS = [
  { id: 'service', label: '이용 약관', required: true },
  { id: 'privacy', label: '개인정보 수집과 이용', required: true },
  { id: 'news', label: '새 소식 메일 받기', required: false },
];

const link = cn(
  'rounded-indicator text-(--ids-color-accent) underline underline-offset-4 focus-ring hover:decoration-2',
);

const actions = cn('flex items-center justify-between gap-2 pt-2');

export const Default: Story = {
  render: function Render() {
    const [step, setStep] = useState(0);
    const [agreed, setAgreed] = useState<string[]>([]);

    const next = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setStep((current) => current + 1);
    };

    const agreedToAll = agreed.length === TERMS.length;

    return (
      <main className="grid min-h-dvh place-items-center bg-(--ids-color-muted) px-4 py-12 break-keep">
        <Card className="w-full max-w-lg">
          <Card.Header>
            <Card.Title asChild>
              <h1 className="text-headline-h4-bold">회원가입</h1>
            </Card.Title>
            <Card.Description>
              세 단계면 끝나요. 입력한 내용은 단계를 옮겨도 남아 있어요.
            </Card.Description>
          </Card.Header>

          <Card.Content>
            <Stepper
              value={step}
              onValueChange={setStep}
              aria-label="가입 단계"
              className="flex flex-col gap-8"
            >
              {STEPS.map(({ title, description }) => (
                <Stepper.Item key={title}>
                  <Stepper.Title>{title}</Stepper.Title>
                  <Stepper.Description className="hidden sm:block">
                    {description}
                  </Stepper.Description>
                </Stepper.Item>
              ))}

              <Stepper.Content value={0}>
                <form onSubmit={next} className="flex flex-col gap-4">
                  <Field>
                    <Field.Label>이름</Field.Label>
                    <TextField name="name" autoComplete="name" required />
                  </Field>
                  <Field>
                    <Field.Label>GIST 메일</Field.Label>
                    <TextField
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="name@gm.gist.ac.kr"
                      required
                    />
                    <Field.Description>학교 메일로만 가입할 수 있어요.</Field.Description>
                  </Field>
                  <Field>
                    <Field.Label>비밀번호</Field.Label>
                    <PasswordField
                      name="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                    <Field.Description>8자 이상으로, 글자와 숫자를 섞어 주세요.</Field.Description>
                  </Field>
                  <div className={cn(actions, 'justify-end')}>
                    <Button type="submit">다음</Button>
                  </div>
                </form>
              </Stepper.Content>

              <Stepper.Content value={1}>
                <form onSubmit={next} className="flex flex-col gap-4">
                  <div className="grid items-start gap-4 sm:grid-cols-2">
                    <Field>
                      <Field.Label>학번</Field.Label>
                      <TextField
                        name="student-id"
                        inputMode="numeric"
                        pattern="\d{8}"
                        placeholder="20261234"
                        required
                      />
                    </Field>
                    <Field>
                      <Field.Label>학과</Field.Label>
                      <Select name="department" placeholder="학과 고르기" required>
                        {DEPARTMENTS.map((department) => (
                          <Select.Item key={department} value={department}>
                            {department}
                          </Select.Item>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Field>
                      <Field.Label>인증번호</Field.Label>
                      <OTPField name="code" length={6} required />
                      <Field.Description>
                        메일로 온 6자리를 넣어 주세요. 10분 동안 쓸 수 있어요.
                      </Field.Description>
                    </Field>
                    <Button
                      variant="outline"
                      size="tiny"
                      className="self-start"
                      onClick={() =>
                        toast.info('인증번호를 보냈어요', {
                          description: 'GIST 메일함을 확인하세요.',
                        })
                      }
                    >
                      인증번호 받기
                    </Button>
                  </div>
                  <div className={actions}>
                    <Button variant="outline" onClick={() => setStep(0)}>
                      이전
                    </Button>
                    <Button type="submit">다음</Button>
                  </div>
                </form>
              </Stepper.Content>

              <Stepper.Content value={2}>
                <form onSubmit={next} className="flex flex-col gap-4">
                  <Label className="text-body-b1-semibold flex items-center gap-2">
                    <Checkbox
                      checked={agreedToAll ? true : agreed.length > 0 ? 'indeterminate' : false}
                      onCheckedChange={(checked) =>
                        setAgreed(checked ? TERMS.map(({ id }) => id) : [])
                      }
                    />
                    모두 동의합니다
                  </Label>
                  <Divider />
                  <ul className="flex flex-col gap-3">
                    {TERMS.map(({ id, label, required }) => (
                      <li key={id} className="flex items-center justify-between gap-2">
                        <Label className="text-body-b3-medium inline-flex items-center gap-2">
                          <Checkbox
                            name="terms"
                            value={id}
                            required={required}
                            checked={agreed.includes(id)}
                            onCheckedChange={(checked) =>
                              setAgreed((current) =>
                                checked ? [...current, id] : current.filter((term) => term !== id),
                              )
                            }
                          />
                          {required ? '(필수)' : '(선택)'} {label}
                        </Label>
                        <a href={`#${id}`} className={cn(link, 'text-body-b3-regular')}>
                          보기
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className={actions}>
                    <Button variant="outline" onClick={() => setStep(1)}>
                      이전
                    </Button>
                    <Button type="submit">가입하기</Button>
                  </div>
                </form>
              </Stepper.Content>

              <Stepper.Content value={3}>
                <Empty variant="soft" className="py-10">
                  <Empty.Media>
                    <CheckCircleIcon />
                  </Empty.Media>
                  <Empty.Title>가입을 마쳤어요</Empty.Title>
                  <Empty.Description>
                    이제 인포팀의 모든 서비스를 한 계정으로 쓸 수 있어요.
                  </Empty.Description>
                  <Empty.Actions>
                    <Button>시작하기</Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep(0);
                        setAgreed([]);
                      }}
                    >
                      처음으로
                    </Button>
                  </Empty.Actions>
                </Empty>
              </Stepper.Content>
            </Stepper>
          </Card.Content>

          <Card.Footer className="text-body-b3-regular justify-center text-(--ids-color-on-muted)">
            이미 계정이 있나요?
            <a href="#login" className={link}>
              로그인
            </a>
          </Card.Footer>
        </Card>
      </main>
    );
  },
};
