import { useState } from 'react';

import { ClockIcon, FireIcon, StarIcon } from '@heroicons/react/24/outline';

import { Toggle } from '../../components/action/toggle';
import { ToggleGroup } from '../../components/action/toggle-group';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { Image } from '../../components/data/image';
import { Alert } from '../../components/feedback/alert';
import { toast } from '../../components/feedback/toast';
import { Rating } from '../../components/form/rating';
import { Tabs } from '../../components/navigation/tabs';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/Cafeteria',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function dish(hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320"><rect width="480" height="320" fill="hsl(${hue} 45% 90%)"/><ellipse cx="240" cy="176" rx="150" ry="100" fill="hsl(0 0% 99%)"/><ellipse cx="240" cy="170" rx="104" ry="66" fill="hsl(${hue} 60% 62%)"/><circle cx="206" cy="152" r="18" fill="hsl(${(hue + 90) % 360} 50% 55%)"/><circle cx="270" cy="182" r="14" fill="hsl(${(hue + 150) % 360} 55% 60%)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const RESTAURANTS = [
  { id: 'first', name: '제1학생식당', hours: '아침 8:00, 점심 11:30, 저녁 17:30부터 1시간 30분' },
  { id: 'second', name: '제2학생식당', hours: '점심 11:30부터 13:30, 저녁 17:30부터 19:00' },
  { id: 'faculty', name: '교직원식당', hours: '점심 11:30부터 13:00' },
];

const DAYS = [
  { value: 'mon', label: '월 29' },
  { value: 'tue', label: '화 30' },
  { value: 'wed', label: '수 1' },
  { value: 'thu', label: '목 2' },
  { value: 'fri', label: '금 3' },
];

type Meal = {
  id: string;
  restaurant: string;
  time: '아침' | '점심' | '저녁';
  name: string;
  sides: string[];
  price: number;
  kcal: number;
  rating: number;
  hue: number;
  tags: string[];
};

const MEALS: Meal[] = [
  {
    id: 'f1',
    restaurant: 'first',
    time: '아침',
    name: '참치 김밥과 우동',
    sides: ['단무지', '김치'],
    price: 3500,
    kcal: 610,
    rating: 3.9,
    hue: 30,
    tags: [],
  },
  {
    id: 'f2',
    restaurant: 'first',
    time: '점심',
    name: '돈까스 정식',
    sides: ['양배추 샐러드', '미소 된장국', '깍두기'],
    price: 5000,
    kcal: 890,
    rating: 4.4,
    hue: 25,
    tags: ['인기'],
  },
  {
    id: 'f3',
    restaurant: 'first',
    time: '저녁',
    name: '제육볶음',
    sides: ['상추쌈', '계란찜', '배추김치'],
    price: 5000,
    kcal: 820,
    rating: 4.1,
    hue: 5,
    tags: ['매콤'],
  },
  {
    id: 's1',
    restaurant: 'second',
    time: '점심',
    name: '비빔밥과 된장국',
    sides: ['계란 프라이', '열무김치'],
    price: 4500,
    kcal: 680,
    rating: 4.2,
    hue: 90,
    tags: ['채식 가능'],
  },
  {
    id: 's2',
    restaurant: 'second',
    time: '저녁',
    name: '마라탕면',
    sides: ['꿔바로우 두 조각', '단무지'],
    price: 5500,
    kcal: 760,
    rating: 4.6,
    hue: 350,
    tags: ['매콤', '인기'],
  },
  {
    id: 'c1',
    restaurant: 'faculty',
    time: '점심',
    name: '연어 포케',
    sides: ['현미밥', '미소 된장국'],
    price: 7000,
    kcal: 540,
    rating: 4.7,
    hue: 190,
    tags: ['건강식'],
  },
];

const won = new Intl.NumberFormat('ko-KR');

export const Default: Story = {
  render: function Render() {
    const [day, setDay] = useState('wed');

    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 break-keep sm:px-6 lg:py-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-headline-h3-bold">오늘의 학식</h1>
            <p className="text-body-b2-regular text-(--ids-color-on-muted)">10월 1일 수요일</p>
          </div>
          <ToggleGroup
            variant="outline"
            aria-label="요일"
            value={day}
            onValueChange={(next) => {
              if (next !== null) setDay(next);
            }}
          >
            {DAYS.map(({ value, label }) => (
              <Toggle key={value} value={value} variant="outline">
                {label}
              </Toggle>
            ))}
          </ToggleGroup>
        </header>

        <Alert colorScheme="warning">
          <Alert.Title>10월 3일 개천절에는 제2학생식당만 점심을 열어요</Alert.Title>
        </Alert>

        <Tabs defaultValue="first" className="flex flex-col gap-6">
          <Tabs.List aria-label="식당">
            {RESTAURANTS.map(({ id, name }) => (
              <Tabs.Trigger key={id} value={id}>
                {name}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {RESTAURANTS.map((restaurant) => (
            <Tabs.Content key={restaurant.id} value={restaurant.id} className="flex flex-col gap-4">
              <p className="text-body-b3-regular flex items-center gap-1.5 text-(--ids-color-on-muted)">
                <ClockIcon aria-hidden className="size-4" />
                {restaurant.hours}
              </p>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {MEALS.filter((meal) => meal.restaurant === restaurant.id).map((meal) => (
                  <li key={meal.id} className="flex">
                    <Card className="w-full">
                      <Card.Media>
                        <Image src={dish(meal.hue)} alt="" ratio={3 / 2} />
                      </Card.Media>
                      <Card.Header>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge content={meal.time} variant="soft" colorScheme="neutral" />
                          {meal.tags.map((tag) => (
                            <Badge
                              key={tag}
                              content={tag}
                              variant="outline"
                              colorScheme="primary"
                            />
                          ))}
                        </div>
                        <Card.Title>{meal.name}</Card.Title>
                        <Card.Description>{meal.sides.join(', ')}</Card.Description>
                      </Card.Header>
                      <Card.Content className="text-body-b3-regular flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="text-body-b1-bold tabular-nums">
                          {won.format(meal.price)}원
                        </span>
                        <span className="flex items-center gap-1 text-(--ids-color-on-muted)">
                          <FireIcon aria-hidden className="size-4" />
                          {meal.kcal}kcal
                        </span>
                        <span className="flex items-center gap-1 text-(--ids-color-on-muted)">
                          <StarIcon aria-hidden className="size-4" />
                          <span className="sr-only">평점</span>
                          {meal.rating}
                        </span>
                      </Card.Content>
                      <Card.Footer className="flex-col items-start gap-2 border-t border-(--ids-color-border)">
                        <span className="text-caption-c1-medium text-(--ids-color-on-muted)">
                          먹어 봤다면 평가해 주세요
                        </span>
                        <Rating
                          aria-label={`${meal.name} 평가`}
                          onValueChange={(value) =>
                            toast.success(`${meal.name}에 ${value}점을 줬어요`)
                          }
                        />
                      </Card.Footer>
                    </Card>
                  </li>
                ))}
              </ul>
            </Tabs.Content>
          ))}
        </Tabs>

        <section aria-labelledby="allergy" className="flex flex-col gap-3">
          <h2 id="allergy" className="text-body-b2-semibold">
            알레르기 걸러 보기
          </h2>
          <div className="flex flex-wrap gap-2">
            {['우유', '달걀', '밀', '대두', '땅콩', '새우', '돼지고기'].map((allergen) => (
              <Chip key={allergen} defaultSelected={false}>
                {allergen}
              </Chip>
            ))}
          </div>
        </section>
      </main>
    );
  },
};
