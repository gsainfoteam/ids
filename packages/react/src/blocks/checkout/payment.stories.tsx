import { useState, type FormEvent, type ReactNode } from 'react';

import {
  BanknotesIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  LockClosedIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Avatar } from '../../components/data/avatar';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { toast } from '../../components/feedback/toast';
import { Checkbox } from '../../components/form/checkbox';
import { Field } from '../../components/form/field';
import { RadioGroup } from '../../components/form/radio-group';
import { TelField } from '../../components/form/tel-field';
import { TextField } from '../../components/form/text-field';
import { Divider } from '../../components/layout/divider';
import { Label } from '../../components/typography/label';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Checkout/Payment',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const LINES = [
  { id: 'hoodie', name: '인포팀 후드티', option: '블랙 · L · 1개', price: 32000 },
  { id: 'sticker', name: '로고 스티커 팩', option: '5장 · 2개', price: 6000 },
];

const DELIVERY: {
  value: string;
  label: string;
  description: string;
  fee: number;
  icon: ReactNode;
}[] = [
  {
    value: 'pickup',
    label: '학생회관에서 받기',
    description: '평일 낮 12시부터 1시 · 무료',
    fee: 0,
    icon: <BuildingStorefrontIcon />,
  },
  {
    value: 'parcel',
    label: '택배로 받기',
    description: '2~3일 걸려요 · 3,000원',
    fee: 3000,
    icon: <TruckIcon />,
  },
];

const METHODS: { value: string; label: string; icon: ReactNode }[] = [
  { value: 'card', label: '신용·체크카드', icon: <CreditCardIcon /> },
  { value: 'transfer', label: '계좌이체', icon: <BanknotesIcon /> },
  { value: 'easy', label: '간편결제', icon: <DevicePhoneMobileIcon /> },
];

const won = new Intl.NumberFormat('ko-KR');

export const PC: Story = {
  render: function Render() {
    const [delivery, setDelivery] = useState('pickup');
    const [method, setMethod] = useState('card');

    const fee = DELIVERY.find(({ value }) => value === delivery)!.fee;
    const subtotal = LINES.reduce((sum, line) => sum + line.price, 0);
    const total = subtotal + fee;

    const pay = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      toast.success('결제했어요', { description: '주문 내역을 메일로 보냈어요.' });
    };

    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10 break-keep sm:px-6 lg:py-14">
        <form onSubmit={pay} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col gap-6">
            <h1 className="text-headline-h3-bold">주문하기</h1>

            <Card>
              <Card.Header>
                <Card.Title asChild>
                  <h2>받는 방법</h2>
                </Card.Title>
              </Card.Header>
              <Card.Content className="flex flex-col gap-5">
                <RadioGroup<string>
                  name="delivery"
                  value={delivery}
                  onValueChange={setDelivery}
                  aria-label="받는 방법"
                >
                  {({ Item: Radio }) => (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {DELIVERY.map((option) => (
                        <Item
                          key={option.value}
                          variant="outline"
                          asChild
                          selected={option.value === delivery}
                        >
                          <label>
                            <Item.Media variant="soft">{option.icon}</Item.Media>
                            <Item.Content>
                              <Item.Title>{option.label}</Item.Title>
                              <Item.Description>{option.description}</Item.Description>
                            </Item.Content>
                            <Item.Actions>
                              <Radio value={option.value} />
                            </Item.Actions>
                          </label>
                        </Item>
                      ))}
                    </div>
                  )}
                </RadioGroup>

                <div className="grid items-start gap-4 sm:grid-cols-2">
                  <Field>
                    <Field.Label>받는 사람</Field.Label>
                    <TextField name="name" autoComplete="name" defaultValue="김지수" required />
                  </Field>
                  <Field>
                    <Field.Label>휴대폰</Field.Label>
                    <TelField
                      name="phone"
                      defaultCountry="KR"
                      defaultValue="010-2345-6789"
                      required
                    />
                  </Field>
                </div>
                {delivery === 'parcel' && (
                  <Field>
                    <Field.Label>주소</Field.Label>
                    <TextField
                      name="address"
                      autoComplete="street-address"
                      placeholder="광주광역시 북구 첨단과기로 123"
                      required
                    />
                    <Field.Hint>기숙사라면 동과 호수까지 적어 주세요.</Field.Hint>
                  </Field>
                )}
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title asChild>
                  <h2>결제 수단</h2>
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <RadioGroup<string>
                  name="method"
                  value={method}
                  onValueChange={setMethod}
                  aria-label="결제 수단"
                >
                  {({ Item: Radio }) => (
                    <div className="grid gap-2 sm:grid-cols-3">
                      {METHODS.map((option) => (
                        <Item
                          key={option.value}
                          variant="outline"
                          asChild
                          selected={option.value === method}
                        >
                          <label>
                            <Item.Media>{option.icon}</Item.Media>
                            <Item.Content>
                              <Item.Title>{option.label}</Item.Title>
                            </Item.Content>
                            <Item.Actions>
                              <Radio value={option.value} />
                            </Item.Actions>
                          </label>
                        </Item>
                      ))}
                    </div>
                  )}
                </RadioGroup>
              </Card.Content>
            </Card>
          </div>

          <Card className="lg:sticky lg:top-6">
            <Card.Header>
              <Card.Title asChild>
                <h2>주문 상품</h2>
              </Card.Title>
            </Card.Header>
            <Item.Group size="tiny" aria-label="주문 상품">
              {LINES.map((line) => (
                <Item key={line.id}>
                  <Item.Media>
                    <Avatar name={line.name} shape="square" size="tiny" />
                  </Item.Media>
                  <Item.Content>
                    <Item.Title>{line.name}</Item.Title>
                    <Item.Description>{line.option}</Item.Description>
                  </Item.Content>
                  <Item.Actions>{won.format(line.price)}원</Item.Actions>
                </Item>
              ))}
            </Item.Group>
            <Card.Content className="flex flex-col gap-3">
              <Divider />
              <p className="flex justify-between">
                상품 금액<span>{won.format(subtotal)}원</span>
              </p>
              <p className="flex justify-between">
                배송비<span>{fee === 0 ? '무료' : `${won.format(fee)}원`}</span>
              </p>
              <Divider />
              <p className="text-subtitle-s2-semibold flex justify-between">
                결제 금액<span>{won.format(total)}원</span>
              </p>
              <Label>
                <Checkbox name="agree" required />
                주문 내용을 확인했고 결제에 동의해요
              </Label>
            </Card.Content>
            <Card.Footer>
              <Button type="submit" className="w-full">
                <LockClosedIcon />
                {won.format(total)}원 결제하기
              </Button>
            </Card.Footer>
          </Card>
        </form>
      </main>
    );
  },
};
