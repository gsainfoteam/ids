import { useState } from 'react';

import { ShoppingBagIcon, TrashIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Avatar } from '../../components/data/avatar';
import { Card } from '../../components/data/card';
import { Empty } from '../../components/data/empty';
import { Item } from '../../components/data/item';
import { Alert } from '../../components/feedback/alert';
import { toast } from '../../components/feedback/toast';
import { NumberField } from '../../components/form/number-field';
import { TextField } from '../../components/form/text-field';
import { Divider } from '../../components/layout/divider';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Checkout/Cart',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const PRODUCTS = [
  { id: 'hoodie', name: '인포팀 후드티', option: '블랙 · L', price: 32000 },
  { id: 'sticker', name: '로고 스티커 팩', option: '5장', price: 3000 },
  { id: 'keyring', name: '셔틀 키링', option: '아크릴', price: 6000 },
];

const FREE_SHIPPING_FROM = 30000;

const SHIPPING = 3000;

const won = new Intl.NumberFormat('ko-KR');

export const PC: Story = {
  render: function Render() {
    const [quantities, setQuantities] = useState<Record<string, number>>({
      hoodie: 1,
      sticker: 2,
      keyring: 1,
    });
    const [coupon, setCoupon] = useState('');
    const [discount, setDiscount] = useState(0);

    const lines = PRODUCTS.filter((product) => (quantities[product.id] ?? 0) > 0);
    const subtotal = lines.reduce(
      (sum, product) => sum + product.price * quantities[product.id],
      0,
    );
    const shipping = subtotal >= FREE_SHIPPING_FROM || subtotal === 0 ? 0 : SHIPPING;
    const total = subtotal + shipping - discount;

    return (
      <main className="mx-auto grid w-full max-w-5xl items-start gap-6 px-4 py-10 break-keep sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-14">
        <section aria-labelledby="cart" className="flex flex-col gap-4">
          <h1 id="cart" className="text-headline-h3-bold">
            장바구니
          </h1>
          {lines.length === 0 ? (
            <Empty variant="outline">
              <Empty.Media>
                <ShoppingBagIcon />
              </Empty.Media>
              <Empty.Title>장바구니가 비었어요</Empty.Title>
              <Empty.Actions>
                <Button asChild variant="outline">
                  <a href="#shop">굿즈 둘러보기</a>
                </Button>
              </Empty.Actions>
            </Empty>
          ) : (
            <Card size="tiny">
              <Item.Group variant="bordered" aria-label="담은 상품">
                {lines.map((product) => (
                  <Item key={product.id}>
                    <Item.Media>
                      <Avatar name={product.name} shape="square" />
                    </Item.Media>
                    <Item.Content>
                      <Item.Title>{product.name}</Item.Title>
                      <Item.Description>
                        {product.option} · {won.format(product.price)}원
                      </Item.Description>
                    </Item.Content>
                    <Item.Actions>
                      <NumberField
                        aria-label={`${product.name} 수량`}
                        size="tiny"
                        min={1}
                        max={9}
                        value={quantities[product.id]}
                        onValueChange={(next) =>
                          setQuantities({ ...quantities, [product.id]: next ?? 1 })
                        }
                        className="w-24"
                      />
                      <IconButton
                        variant="outline"
                        colorScheme="danger"
                        size="tiny"
                        aria-label={`${product.name} 빼기`}
                        icon={<TrashIcon />}
                        onClick={() => setQuantities({ ...quantities, [product.id]: 0 })}
                      />
                    </Item.Actions>
                  </Item>
                ))}
              </Item.Group>
            </Card>
          )}
        </section>

        <Card className="lg:sticky lg:top-6">
          <Card.Header>
            <Card.Title asChild>
              <h2>주문 금액</h2>
            </Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-col gap-3">
            <p className="flex justify-between">
              상품 금액<span>{won.format(subtotal)}원</span>
            </p>
            <p className="flex justify-between">
              배송비<span>{shipping === 0 ? '무료' : `${won.format(shipping)}원`}</span>
            </p>
            {discount > 0 && (
              <p className="flex justify-between">
                쿠폰 할인<span>−{won.format(discount)}원</span>
              </p>
            )}
            <Divider />
            <p className="text-subtitle-s2-semibold flex justify-between">
              결제 금액<span>{won.format(Math.max(total, 0))}원</span>
            </p>
            <TextField
              aria-label="쿠폰 번호"
              placeholder="쿠폰 번호"
              value={coupon}
              onValueChange={setCoupon}
            >
              <TextField.Input />
              <Button
                variant="soft"
                size="tiny"
                disabled={coupon.trim() === ''}
                onClick={() => {
                  setDiscount(2000);
                  toast.success('쿠폰을 적용했어요', { description: '2,000원 할인' });
                }}
              >
                적용
              </Button>
            </TextField>
            {shipping > 0 && (
              <Alert colorScheme="info">
                <Alert.Description>
                  {won.format(FREE_SHIPPING_FROM - subtotal)}원 더 담으면 배송비가 무료예요.
                </Alert.Description>
              </Alert>
            )}
          </Card.Content>
          <Card.Footer>
            <Button asChild className="w-full">
              <a href="#payment">{lines.length}개 주문하기</a>
            </Button>
          </Card.Footer>
        </Card>
      </main>
    );
  },
};
