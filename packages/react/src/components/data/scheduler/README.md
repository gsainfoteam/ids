# Scheduler

일정을 주나 하루의 시간 격자에 놓는 컴포넌트입니다. 수강 시간표, 스터디룸 예약, 동아리 일정처럼 시각이 정해진 일을 보여 줍니다.

- **보기는 주와 하루.** `week`(기본)는 locale 의 첫 요일부터 7일, `day` 는 하루입니다. 월 보기는 없습니다.
- **IDS 로 짓습니다.** 이동은 ButtonGroup, 보기 전환은 ToggleGroup, 날짜로 이동은 Popover 안의 Calendar, 격자는 ScrollArea, 일정은 Item, 지금 시각은 Divider 입니다.
- **날짜는 `@internationalized/date`.** `date` 는 `CalendarDate`, 일정의 `start` / `end` 는 `CalendarDateTime` 입니다. 시간대가 없는 벽시계 시각이라 로컬 시간대가 값을 흔들지 않습니다.
- **locale.** 요일, 날짜, 시각의 글자와 첫 요일을 Calendar 와 같은 방식으로 locale 에서 읽습니다.

```tsx
import { CalendarDate, CalendarDateTime } from '@internationalized/date';
import { Scheduler } from '@gsainfoteam/ids-react';

const events = [
  {
    id: 'algo',
    title: '알고리즘',
    start: new CalendarDateTime(2026, 11, 17, 9),
    end: new CalendarDateTime(2026, 11, 17, 10, 30),
  },
  {
    id: 'fest',
    title: '지스트 축제',
    start: new CalendarDate(2026, 11, 19),
    end: new CalendarDate(2026, 11, 20),
    colorScheme: 'warning',
  },
];

<Scheduler events={events} />;
```

## 구조

| 부분            | IDS 컴포넌트                      | HTML                                        |
| --------------- | --------------------------------- | ------------------------------------------- |
| 이전, 오늘, 다음 | ButtonGroup, IconButton, Button   | `<button>`                                  |
| 날짜로 이동     | Popover, Calendar                 | 기간을 적은 `<button>`                      |
| 보기 전환       | ToggleGroup, Toggle               | `radiogroup`                                |
| 시간 격자       | ScrollArea (가로, 세로)           | 날마다 `<section aria-labelledby>`          |
| 하루의 일정     | ItemGroup                         | `<ul>`                                      |
| 일정 하나       | Item (`onClick` 이면 Title 이 버튼) | `<li>`, 시작과 끝은 `<time dateTime>`       |
| 지금 시각       | Divider                           | `<hr aria-hidden>`                          |

- root 는 `role="group"` 이고 이름은 기본 "일정표"입니다. `aria-label` 로 바꿉니다.
- 요일 머리줄과 종일 줄은 위에, 시각 열은 왼쪽에 붙어 있고 격자만 움직입니다.
- 머리줄의 각 날짜 칸이 그날 `<section>` 의 이름입니다. 화면에 보이는 "화 17" 대신 "2026년 11월 17일 화요일"로 읽힙니다.
- 오늘 칸은 `aria-current="date"` 입니다.
- 이동하면 바뀐 기간을 `role="status"` 로 알립니다.

## 일정

```tsx
type EventData = {
  id: string;
  title: string;
  start: CalendarDateTime | CalendarDate | ZonedDateTime;
  end: CalendarDateTime | CalendarDate | ZonedDateTime;
  allDay?: boolean;
  colorScheme?: 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';
};
```

- `start` 가 `CalendarDate` 이거나 `allDay` 면 종일 일정입니다. 머리줄 아래 종일 줄에 놓이고, `start` 부터 `end` 까지 양 끝을 포함한 날마다 그립니다. Calendar 의 기간과 같습니다.
- 시각이 있는 일정은 날짜와 시각으로 자리를 잡습니다. 자정을 넘으면 두 날에 나눠 그리고, 두 칸 모두 원래 시작과 끝 시각을 적습니다.
- `ZonedDateTime` 은 그 시간대의 벽시계 시각으로 놓습니다. 보는 사람의 시간대로 옮기려면 `toTimeZone(value, getLocalTimeZone())` 을 거쳐 넘깁니다.
- 30분보다 짧은 일정도 30분 높이로 그립니다. 시작과 끝이 같아도 보입니다.
- 겹치는 일정은 칸을 나눠 나란히 섭니다. 겹침이 끝나면 다음 일정은 칸 폭 전체를 씁니다.
- `colorScheme` 의 기본은 `primary` 입니다. 색은 `bg-X-soft` 위의 `text-on-X-soft` 입니다.
- 일정의 순서(Tab, 화면 읽기)는 종일 줄, 그다음 날짜와 시작 시각 순입니다.

## 일정 칸 그리기

```tsx
<Scheduler events={events}>
  {(event) => <Scheduler.Event onClick={() => openEvent(event.id)} />}
</Scheduler>

<Scheduler events={rooms}>
  {(room) => (
    <Scheduler.Event colorScheme="tertiary">
      <Item.Content>
        <Item.Title truncate>{room.title}</Item.Title>
        <Item.Description>{room.place}</Item.Description>
      </Item.Content>
    </Scheduler.Event>
  )}
</Scheduler>
```

- 자식은 일정 하나를 받아 그 칸을 돌려주는 함수입니다. 없으면 `<Scheduler.Event />` 입니다.
- `events` 에 앱의 필드를 더하면 함수가 그 타입 그대로 받습니다.
- `Scheduler.Event` 는 Item 입니다. `size`, 높이와 모서리는 Scheduler 가 정하고, 나머지 Item props(`onClick`, `selected`, `disabled`, `className`)는 그대로 받습니다.
- `children` 이 없으면 제목과 `<time>` 두 개로 적은 시작, 끝 시각을 그립니다. 종일 일정은 제목만 그립니다.
- `onClick` 이 있으면 제목이 버튼이 되어 Tab 순서에 들어갑니다. 칸 어디를 눌러도 됩니다.
- `Scheduler.Event` 는 이 함수 밖에서 쓰면 오류입니다.

## 보기와 날짜

```tsx
<Scheduler events={events} defaultView="day" defaultDate={new CalendarDate(2026, 11, 17)} />

const [view, setView] = useState<Scheduler.View>('week');
const [date, setDate] = useState(today(getLocalTimeZone()));
<Scheduler events={events} view={view} onViewChange={setView} date={date} onDateChange={setDate} />
```

- `date` 는 보이는 기간 안의 아무 날입니다. 주 보기는 그날이 든 주를 그립니다.
- 이전, 다음은 보기만큼(한 주, 하루) 옮깁니다. 오늘은 오늘로 갑니다.
- 기간 버튼은 Calendar 를 엽니다. 포커스가 `date` 로 들어가고, 날을 고르면 그날로 옮기며 닫힙니다. Escape 는 닫고 포커스를 기간 버튼에 돌려줍니다.
- 보기 전환은 라디오 그룹이라 다시 눌러도 풀리지 않습니다.
- `date` 의 기본은 오늘입니다. 서버와 클라이언트가 다른 날이면 hydration 이 어긋나므로, 서버에서 그리는 앱은 `defaultDate` 를 넘깁니다.

## 지금 시각

```tsx
<Scheduler events={events} />                                          // 클라이언트 시계, 1분마다
<Scheduler events={events} now={new CalendarDateTime(2026, 11, 17, 10, 30)} />  // 고정
```

- 오늘 칸에 지금 시각의 선을 긋습니다. 장식이라 화면 읽기는 읽지 않습니다.
- `now` 가 없으면 hydration 뒤에 클라이언트 시계를 읽어 긋습니다. 서버 HTML 에는 선이 없어서 서버와 클라이언트 시각이 달라도 어긋나지 않습니다.
- 오늘 칸(`aria-current="date"`)도 같은 시계를 따릅니다. 서버 HTML 에는 오늘 칸이 없고, hydration 뒤에 클라이언트의 오늘을 표시합니다.
- `now` 를 주면 그 시각에 고정하고, 오늘도 그 날짜입니다. 스토리와 테스트가 씁니다.

## 스크롤

- 처음 그릴 때 보이는 기간의 가장 이른 일정, 그것이 오전 8시보다 늦으면 오전 8시로 내려 둡니다. 날짜를 옮겨도 다시 내리지 않습니다.
- 높이는 기본 `h-144` 입니다. `className="h-full"` 처럼 바꾸면 격자가 남은 높이를 씁니다.
- 주 보기의 하루 칸은 88px 보다 좁아지지 않습니다. 좁은 화면에서는 격자가 가로로 스크롤되고, 시각 열은 왼쪽에 남습니다. 하루 보기는 가로로 스크롤되지 않습니다.

## locale

```tsx
<Scheduler locale="en-US" />    // Sun 15, "November 15 – 21, 2026", 9:00 AM
<Scheduler locale="de-DE" />    // 월요일 시작, "16.–22. November 2026", 9:00
<Scheduler weekStartsOn={1} />  // 첫 요일을 정한다(0 일요일 ~ 6 토요일)
```

- `locale` 이 없으면 IdsProvider 의 locale, 그다음 `ko-KR` 입니다.
- 버튼 이름 같은 문구는 locale 이 아니라 IdsProvider `translate` 를 따릅니다(`scheduler.*` 키).

## Props

| Prop                                    | Type                                  | Default              |
| --------------------------------------- | ------------------------------------- | -------------------- |
| `events`                                | `Scheduler.EventData[]` 를 넓힌 배열   | -                    |
| `view` / `defaultView` / `onViewChange` | `'week' \| 'day'`                     | `'week'`             |
| `date` / `defaultDate` / `onDateChange` | `CalendarDate`                        | 오늘                 |
| `locale`                                | `string` (BCP 47)                     | Provider locale      |
| `weekStartsOn`                          | `0` ~ `6`                             | locale 의 첫 요일    |
| `now`                                   | `CalendarDateTime`                    | 클라이언트 시계      |
| `children`                              | `(event) => ReactNode`                | `<Scheduler.Event />` |

나머지 `div` props 는 root 에 갑니다.

## 다음 판

- 끌어 옮기기(`onEventChange(event, { start, end })`)와 끌어서 길이 바꾸기. 길이는 Resizable `direction="vertical"` 에 칸 단위 `step` 을 먼저 더합니다.
- 빈 칸을 눌러 일정 만들기, 보이는 시간 범위(`startHour`, `endHour`)와 숨길 요일.
