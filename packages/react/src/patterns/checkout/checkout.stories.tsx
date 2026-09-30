import { useState, type FormEvent } from 'react';

import {
  CreditCardIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Card } from '../../components/data/card';
import { Empty } from '../../components/data/empty';
import { Image } from '../../components/data/image';
import { Item } from '../../components/data/item';
import { toast } from '../../components/feedback/toast';
import { Checkbox } from '../../components/form/checkbox';
import { Field } from '../../components/form/field';
import { NumberField } from '../../components/form/number-field';
import { RadioGroup } from '../../components/form/radio-group';
import { TelField } from '../../components/form/tel-field';
import { TextField } from '../../components/form/text-field';
import { Divider } from '../../components/layout/divider';
import { Label } from '../../components/typography/label';
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/Checkout',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function product(hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><rect width="240" height="240" fill="hsl(${hue} 60% 92%)"/><rect x="60" y="50" width="120" height="140" rx="18" fill="hsl(${hue} 55% 55%)"/><circle cx="120" cy="120" r="26" fill="hsl(${hue} 70% 88%)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const CART = [
  { id: 'hoodie', name: '인포팀 후드티', option: '회색, L', price: 38000, quantity: 1, hue: 220 },
  { id: 'sticker', name: '로고 스티커 묶음', option: '12장', price: 4000, quantity: 2, hue: 280 },
  { id: 'tumbler', name: '보온 텀블러', option: '473ml', price: 18000, quantity: 1, hue: 160 },
];

const SHIPPING_FEE = 3000;

const won = new Intl.NumberFormat('ko-KR');

const card = cn(
  'flex items-start gap-3 rounded-standard p-4 inset-ring-1 inset-ring-(--ids-color-border)',
  'has-data-[state=checked]:inset-ring-2 has-data-[state=checked]:inset-ring-(--ids-color-primary)',
);

const line = cn('flex items-center justify-between gap-4 text-body-b2-regular');

export const Default: Story = {
  render: function Render() {
    const [cart, setCart] = useState(CART);
    const [delivery, setDelivery] = useState('pickup');
    const [coupon, setCoupon] = useState('');
    const [discount, setDiscount] = useState(0);

    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const shipping = delivery === 'parcel' ? SHIPPING_FEE : 0;
    const total = Math.max(0, subtotal + shipping - discount);

    const applyCoupon = () => {
      if (coupon.trim().toUpperCase() === 'INFOTEAM') {
        setDiscount(5000);
        toast.success('5,000원을 할인했어요');
      } else {
        toast.error('쓸 수 없는 쿠폰이에요');
      }
    };

    const pay = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      toast.success('주문했어요', { description: `${won.format(total)}원을 결제했어요.` });
    };

    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 break-keep sm:px-6 lg:py-12">
        <h1 className="text-headline-h3-bold">주문하기</h1>

        <form onSubmit={pay} className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-6">
            <Card>
              <Card.Header>
                <Card.Title>담은 상품</Card.Title>
                <Card.Description>{cart.length}개</Card.Description>
              </Card.Header>
              {cart.length === 0 ? (
                <Card.Content>
                  <Empty variant="soft" size="tiny">
                    <Empty.Title>담은 상품이 없어요</Empty.Title>
                  </Empty>
                </Card.Content>
              ) : (
                <Item.Group variant="bordered" aria-label="담은 상품">
                  {cart.map((item) => (
                    <Item key={item.id} className="flex-wrap sm:flex-nowrap">
                      <Image
                        src={product(item.hue)}
                        alt=""
                        ratio={1}
                        className="rounded-standard w-16 shrink-0"
                      />
                      <Item.Content>
                        <Item.Title>{item.name}</Item.Title>
                        <Item.Description>{item.option}</Item.Description>
                        <span className="text-body-b2-semibold tabular-nums">
                          {won.format(item.price * item.quantity)}원
                        </span>
                      </Item.Content>
                      <Item.Actions>
                        <NumberField
                          aria-label={`${item.name} 수량`}
                          size="tiny"
                          min={1}
                          max={9}
                          value={item.quantity}
                          onValueChange={(next) =>
                            setCart((current) =>
                              current.map((entry) =>
                                entry.id === item.id ? { ...entry, quantity: next ?? 1 } : entry,
                              ),
                            )
                          }
                          className="w-24"
                        >
                          <NumberField.Decrement />
                          <NumberField.Input className="text-center" />
                          <NumberField.Increment />
                        </NumberField>
                        <IconButton
                          variant="outline"
                          size="tiny"
                          aria-label={`${item.name} 빼기`}
                          icon={<TrashIcon />}
                          onClick={() =>
                            setCart((current) => current.filter((entry) => entry.id !== item.id))
                          }
                        />
                      </Item.Actions>
                    </Item>
                  ))}
                </Item.Group>
              )}
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>받는 방법</Card.Title>
              </Card.Header>
              <Card.Content className="flex flex-col gap-4">
                <RadioGroup<string>
                  aria-label="받는 방법"
                  value={delivery}
                  onValueChange={setDelivery}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {({ Item: Radio }) => (
                    <>
                      <Label className={card}>
                        <Radio value="pickup" />
                        <span className="flex flex-col gap-0.5">
                          <span className="text-body-b2-semibold">학생회관에서 받기</span>
                          <span className="text-body-b3-regular text-(--ids-color-on-muted)">
                            무료, 평일 12시부터 14시
                          </span>
                        </span>
                      </Label>
                      <Label className={card}>
                        <Radio value="parcel" />
                        <span className="flex flex-col gap-0.5">
                          <span className="text-body-b2-semibold">택배로 받기</span>
                          <span className="text-body-b3-regular text-(--ids-color-on-muted)">
                            {won.format(SHIPPING_FEE)}원, 2일에서 3일
                          </span>
                        </span>
                      </Label>
                    </>
                  )}
                </RadioGroup>
                <div className="grid items-start gap-4 sm:grid-cols-2">
                  <Field>
                    <Field.Label>받는 사람</Field.Label>
                    <TextField name="name" autoComplete="name" defaultValue="김지수" required />
                  </Field>
                  <Field>
                    <Field.Label>연락처</Field.Label>
                    <TelField name="phone" autoComplete="tel" defaultCountry="KR" required />
                  </Field>
                  {delivery === 'parcel' && (
                    <Field className="sm:col-span-2">
                      <Field.Label>주소</Field.Label>
                      <TextField
                        name="address"
                        autoComplete="street-address"
                        placeholder="도로명 주소"
                        required
                      />
                    </Field>
                  )}
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>결제 수단</Card.Title>
              </Card.Header>
              <Card.Content>
                <RadioGroup<string>
                  aria-label="결제 수단"
                  defaultValue="card"
                  className="grid gap-3 sm:grid-cols-3"
                >
                  {({ Item: Radio }) => (
                    <>
                      <Label className={card}>
                        <Radio value="card" />
                        <CreditCardIcon aria-hidden className="size-5" />
                        <span className="text-body-b2-semibold">카드</span>
                      </Label>
                      <Label className={card}>
                        <Radio value="transfer" />
                        <BuildingLibraryIcon aria-hidden className="size-5" />
                        <span className="text-body-b2-semibold">계좌 이체</span>
                      </Label>
                      <Label className={card}>
                        <Radio value="phone" />
                        <DevicePhoneMobileIcon aria-hidden className="size-5" />
                        <span className="text-body-b2-semibold">휴대폰</span>
                      </Label>
                    </>
                  )}
                </RadioGroup>
              </Card.Content>
            </Card>
          </div>

          <Card className="lg:sticky lg:top-6">
            <Card.Header>
              <Card.Title>결제 금액</Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-3">
              <div className="flex items-end gap-2">
                <Field className="flex-1">
                  <Field.Label>쿠폰</Field.Label>
                  <TextField value={coupon} onValueChange={setCoupon} placeholder="INFOTEAM" />
                </Field>
                <Button variant="outline" onClick={applyCoupon} disabled={coupon.trim() === ''}>
                  쓰기
                </Button>
              </div>
              <Divider />
              <dl className="flex flex-col gap-2">
                <div className={line}>
                  <dt className="text-(--ids-color-on-muted)">상품</dt>
                  <dd className="tabular-nums">{won.format(subtotal)}원</dd>
                </div>
                <div className={line}>
                  <dt className="text-(--ids-color-on-muted)">배송비</dt>
                  <dd className="tabular-nums">
                    {shipping === 0 ? '무료' : `${won.format(shipping)}원`}
                  </dd>
                </div>
                {discount > 0 && (
                  <div className={line}>
                    <dt className="text-(--ids-color-on-muted)">쿠폰 할인</dt>
                    <dd className="text-(--ids-color-success-strong) tabular-nums">
                      -{won.format(discount)}원
                    </dd>
                  </div>
                )}
                <div
                  className={cn(
                    line,
                    'text-subtitle-s1-bold border-t border-(--ids-color-border) pt-3',
                  )}
                >
                  <dt>합계</dt>
                  <dd className="tabular-nums">{won.format(total)}원</dd>
                </div>
              </dl>
              <Label className="text-body-b3-regular inline-flex items-start gap-2">
                <Checkbox name="agree" required />
                주문 내용을 확인했고 결제에 동의해요
              </Label>
            </Card.Content>
            <Card.Footer>
              <Button type="submit" className="w-full" disabled={cart.length === 0}>
                {won.format(total)}원 결제하기
              </Button>
            </Card.Footer>
          </Card>
        </form>
      </main>
    );
  },
};
