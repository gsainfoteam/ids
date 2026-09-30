import { useState } from 'react';

import { ArrowPathIcon, MapPinIcon, StarIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconToggle } from '../../components/action/icon-toggle';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { Item } from '../../components/data/item';
import { toast } from '../../components/feedback/toast';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Shuttle/Stop',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const STOPS = ['학생회관', '기숙사 A동', '도서관', '대학 A동'];

const ARRIVALS: Record<
  string,
  { id: string; route: string; toward: string; wait: number; time: string }[]
> = {
  학생회관: [
    { id: 's1', route: '광주송정역', toward: '첨단 우체국 방면', wait: 6, time: '12:20' },
    { id: 's2', route: '교내 순환', toward: '대학 A동 방면', wait: 16, time: '12:30' },
    { id: 's3', route: '유스퀘어 터미널', toward: '상무지구 방면', wait: 26, time: '12:40' },
  ],
  '기숙사 A동': [
    { id: 'd1', route: '광주송정역', toward: '첨단 우체국 방면', wait: 12, time: '12:26' },
    { id: 'd2', route: '교내 순환', toward: '학생회관 방면', wait: 21, time: '12:35' },
  ],
  도서관: [{ id: 'l1', route: '교내 순환', toward: '체육관 방면', wait: 9, time: '12:23' }],
  '대학 A동': [{ id: 'a1', route: '교내 순환', toward: '도서관 방면', wait: 4, time: '12:18' }],
};

export const PC: Story = {
  render: function Render() {
    const [stop, setStop] = useState(STOPS[0]);

    const arrivals = ARRIVALS[stop];

    return (
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10 break-keep">
        <div className="flex items-start gap-3">
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-body-b3-regular">지금 12:14 · 1분마다 새로 고쳐요</p>
            <h1 className="text-headline-h3-bold">{stop} 정류장</h1>
          </div>
          <IconToggle
            variant="outline"
            aria-label="즐겨찾기"
            icon={<StarIcon />}
            defaultPressed
            onPressedChange={(pressed) =>
              toast(pressed ? '즐겨찾기에 넣었어요' : '즐겨찾기에서 뺐어요')
            }
          />
        </div>

        <div role="group" aria-label="정류장" className="flex flex-wrap gap-2">
          {STOPS.map((option) => (
            <Chip key={option} selected={option === stop} onSelectedChange={() => setStop(option)}>
              {option}
            </Chip>
          ))}
        </div>

        <Card size="tiny">
          <Item.Group variant="bordered" aria-label={`${stop}에 곧 오는 셔틀`}>
            {arrivals.map((arrival, index) => (
              <Item key={arrival.id}>
                <Item.Content>
                  <Item.Title>
                    {arrival.route}
                    {index === 0 && <Badge content="곧 도착" variant="soft" colorScheme="danger" />}
                  </Item.Title>
                  <Item.Description>
                    {arrival.toward} · {arrival.time}
                  </Item.Description>
                </Item.Content>
                <Item.Actions>
                  <Badge content={`${arrival.wait}분`} variant="soft" colorScheme="primary" />
                </Item.Actions>
              </Item>
            ))}
          </Item.Group>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            <MapPinIcon />
            지도에서 보기
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => toast('새로 고쳤어요')}>
            <ArrowPathIcon />
            새로 고치기
          </Button>
        </div>
      </main>
    );
  },
};
