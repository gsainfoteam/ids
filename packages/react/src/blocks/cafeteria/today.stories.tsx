import { useState } from 'react';

import { Toggle } from '../../components/action/toggle';
import { ToggleGroup } from '../../components/action/toggle-group';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { toast } from '../../components/feedback/toast';
import { Rating } from '../../components/form/rating';
import { Tabs } from '../../components/navigation/tabs';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Cafeteria/Today',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type Meal = 'breakfast' | 'lunch' | 'dinner';

type Allergen = '우유' | '달걀' | '밀' | '돼지고기' | '대두';

const ALLERGENS: Allergen[] = ['우유', '달걀', '밀', '돼지고기', '대두'];

const MEALS: Record<Meal, string> = { breakfast: '아침', lunch: '점심', dinner: '저녁' };

const isMeal = (value: string): value is Meal => value in MEALS;

const MENUS: Record<
  string,
  Record<
    Meal,
    {
      corner: string;
      main: string;
      sides: string;
      price: number;
      kcal: number;
      score: number;
      allergens: Allergen[];
    }[]
  >
> = {
  student: {
    breakfast: [
      {
        corner: '한식',
        main: '북엇국',
        sides: '계란말이, 김치, 김',
        price: 3500,
        kcal: 540,
        score: 4.1,
        allergens: ['달걀', '대두'],
      },
    ],
    lunch: [
      {
        corner: '한식',
        main: '제육볶음',
        sides: '된장찌개, 콩나물무침, 깍두기',
        price: 5000,
        kcal: 820,
        score: 4.4,
        allergens: ['돼지고기', '대두', '밀'],
      },
      {
        corner: '양식',
        main: '크림 파스타',
        sides: '마늘빵, 피클, 샐러드',
        price: 5500,
        kcal: 910,
        score: 3.8,
        allergens: ['우유', '밀', '달걀'],
      },
      {
        corner: '분식',
        main: '참치김밥과 라면',
        sides: '단무지, 김치',
        price: 4000,
        kcal: 760,
        score: 4.0,
        allergens: ['밀', '대두', '달걀'],
      },
    ],
    dinner: [
      {
        corner: '한식',
        main: '닭갈비 덮밥',
        sides: '미역국, 무생채',
        price: 5000,
        kcal: 780,
        score: 4.2,
        allergens: ['대두', '밀'],
      },
      {
        corner: '특식',
        main: '수제 버거',
        sides: '감자튀김, 콜라',
        price: 6500,
        kcal: 1050,
        score: 4.6,
        allergens: ['우유', '밀', '달걀', '대두'],
      },
    ],
  },
  dorm: {
    breakfast: [
      {
        corner: '간편식',
        main: '토스트와 우유',
        sides: '과일, 요거트',
        price: 3000,
        kcal: 480,
        score: 3.9,
        allergens: ['우유', '밀', '달걀'],
      },
    ],
    lunch: [
      {
        corner: '한식',
        main: '김치찌개',
        sides: '계란찜, 멸치볶음',
        price: 4500,
        kcal: 690,
        score: 4.0,
        allergens: ['돼지고기', '달걀', '대두'],
      },
    ],
    dinner: [
      {
        corner: '한식',
        main: '소불고기',
        sides: '잡채, 시금치나물',
        price: 5000,
        kcal: 760,
        score: 4.3,
        allergens: ['대두', '밀'],
      },
    ],
  },
};

const won = new Intl.NumberFormat('ko-KR');

export const PC: Story = {
  render: function Render() {
    const [meal, setMeal] = useState<Meal>('lunch');
    const [avoid, setAvoid] = useState<Allergen[]>([]);

    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-headline-h3-bold">오늘 학식</h1>
            <p className="text-body-b2-regular">
              10월 1일 수요일 · 점심은 11시 30분부터 1시 30분까지
            </p>
          </div>
          <ToggleGroup
            variant="outline"
            aria-label="끼니"
            value={meal}
            onValueChange={(next) => {
              if (next !== null && isMeal(next)) setMeal(next);
            }}
          >
            {(Object.keys(MEALS) as Meal[]).map((value) => (
              <Toggle key={value} value={value}>
                {MEALS[value]}
              </Toggle>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <p className="text-body-b3-semibold" id="allergy-label">
            피하고 싶은 재료
          </p>
          <div role="group" aria-labelledby="allergy-label" className="flex flex-wrap gap-2">
            {ALLERGENS.map((allergen) => (
              <Chip
                key={allergen}
                colorScheme="danger"
                selected={avoid.includes(allergen)}
                onSelectedChange={(selected) =>
                  setAvoid(
                    selected ? [...avoid, allergen] : avoid.filter((other) => other !== allergen),
                  )
                }
              >
                {allergen}
              </Chip>
            ))}
          </div>
        </div>

        <Tabs defaultValue="student" className="flex flex-col gap-6">
          <Tabs.List aria-label="식당">
            <Tabs.Trigger value="student">학생식당</Tabs.Trigger>
            <Tabs.Trigger value="dorm">기숙사식당</Tabs.Trigger>
          </Tabs.List>

          {Object.entries(MENUS).map(([restaurant, meals]) => (
            <Tabs.Content key={restaurant} value={restaurant}>
              <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {meals[meal].map((menu) => {
                  const warned = menu.allergens.filter((allergen) => avoid.includes(allergen));

                  return (
                    <li key={menu.corner} className="flex">
                      <Card className="w-full">
                        <Card.Header>
                          <Card.Description>
                            {menu.corner} · {menu.kcal}kcal
                          </Card.Description>
                          <Card.Title className="text-headline-h5-bold">{menu.main}</Card.Title>
                          <Card.Action>
                            <Badge
                              content={`${won.format(menu.price)}원`}
                              variant="outline"
                              colorScheme="neutral"
                            />
                          </Card.Action>
                        </Card.Header>
                        <Card.Content className="flex flex-col gap-3">
                          <p>{menu.sides}</p>
                          {warned.length > 0 && (
                            <Badge
                              content={`${warned.join(', ')} 들어 있어요`}
                              variant="soft"
                              colorScheme="danger"
                              className="self-start"
                            />
                          )}
                        </Card.Content>
                        <Card.Footer className="justify-between border-t">
                          평점 {menu.score.toFixed(1)}
                          <Rating
                            size="tiny"
                            aria-label={`${menu.main} 평가`}
                            onValueChange={(value) =>
                              toast.success(`${menu.main}에 ${value}점을 줬어요`)
                            }
                          />
                        </Card.Footer>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            </Tabs.Content>
          ))}
        </Tabs>
      </main>
    );
  },
};
