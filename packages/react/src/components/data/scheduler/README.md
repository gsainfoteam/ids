# Scheduler

일정을 달력이나 주, 며칠, 하루의 시간 격자에 놓는 컴포넌트입니다. 수강 시간표, 스터디룸 예약, 동아리 일정처럼 시각이 정해진 일을 보여 줍니다.

- **보기는 넷.** `month` 는 그달이 든 주들, `week`(기본)는 locale 의 첫 요일부터 7일, `days` 는 `date` 부터 `dayCount` 일(기본 3일), `day` 는 하루입니다.
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
    end: new CalendarDate(2026, 11, 21),
    colorScheme: 'warning',
  },
];

<Scheduler aria-label="일정표" events={events} />;
```

## 구조

| 부분            | IDS 컴포넌트                      | HTML                                        |
| --------------- | --------------------------------- | ------------------------------------------- |
| 이전, 오늘, 다음 | ButtonGroup, IconButton, Button   | `<button>`                                  |
| 날짜로 이동     | Popover, Calendar                 | 기간을 적은 `<button>`                      |
| 보기 전환       | ToggleGroup, Toggle               | `radiogroup`                                |
| 시간 격자       | ScrollArea (가로, 세로)           | 날마다 `<section aria-labelledby>`          |
| 종일 줄, 하루의 일정 | ItemGroup                     | `<ul>`                                      |
| 일정 하나       | Item (`onClick` 이면 Title 이 버튼) | `<li>`, 시작과 끝은 `<time dateTime>`       |
| 지금 시각       | Divider                           | `<hr aria-hidden>`                          |

- root 는 `role="group"` 이고 이름(`aria-label` 이나 `aria-labelledby`)은 필수입니다. 없으면 개발 모드에서 경고합니다.
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

- `start` 가 `CalendarDate` 이거나 `allDay` 면 종일 일정입니다. 머리줄 아래 종일 줄에 `start` 부터 `end` 전날까지 이어진 막대 하나로 놓입니다. `end` 는 iCal, Google Calendar 처럼 마지막 날의 다음 날이라, 11월 19일과 20일 이틀짜리 일정은 `end` 가 21일입니다. `onSlotSelect` 가 넘기는 `end` 와 같은 규칙입니다. `end` 가 `start` 와 같으면 그날 하루로 그립니다. 막대가 겹치면 아래 줄로 내려갑니다.
- 종일 줄은 "종일"이라는 이름의 목록 하나입니다. 막대마다 화면에 보이지 않는 날짜 범위가 설명으로 붙어, 화면 읽기는 "지스트 축제, 2026년 11월 19일 목요일 – 20일 금요일"처럼 읽습니다.
- 시각이 있는 일정은 날짜와 시각으로 자리를 잡습니다. 자정을 넘으면 두 날에 나눠 그리고, 두 칸 모두 원래 시작과 끝 시각을 적습니다.
- `ZonedDateTime` 은 그 시간대의 벽시계 시각으로 놓습니다. 보는 사람의 시간대로 옮기려면 `toTimeZone(value, getLocalTimeZone())` 을 거쳐 넘깁니다.
- 30분보다 짧은 일정도 30분 높이로 그립니다. 시작과 끝이 같아도 보입니다.
- 시간이 겹치는 일정은 칸을 세로로 나눠 나란히 섭니다. 이어서 겹치는 일정들이 한 묶음이 되고, 묶음 안에서 일정마다 먼저 비는 줄에 들어갑니다.
- 옆 줄이 그 일정의 시간 동안 비어 있으면 그만큼 넓게 그립니다. 그래서 서로 덮는 일정이 없고, 큰 일정 안에 들어간 작은 일정이나 아래 끝 손잡이가 가려지지 않습니다.
- `colorScheme` 의 기본은 `primary` 입니다. 색은 `bg-X-soft` 위의 `text-on-X-soft` 입니다.
- 일정의 순서(Tab, 화면 읽기)는 종일 줄, 그다음 날짜와 시작 시각 순입니다.

## 일정 칸 그리기

```tsx
<Scheduler aria-label="일정표" events={events}>
  {(event) => <Scheduler.Event onClick={() => openEvent(event.id)} />}
</Scheduler>

<Scheduler aria-label="일정표" events={rooms}>
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
- `children` 이 없으면 제목과 `<time>` 두 개로 적은 시작, 끝 시각을 그립니다. 종일 일정은 제목만 보이고, 날짜 범위는 화면 읽기에만 있습니다.
- 칸 높이에 맞춰 줄 수를 정합니다(container query). 30분 칸은 제목 한 줄, 1시간 칸부터 시각이 한 줄 더 보이고, 높이가 늘면 제목이 넷째 줄까지 단어 단위로 접힙니다. 넘치는 부분은 말줄임표로 끝납니다.
- `onClick` 이 있으면 제목이 버튼이 되어 Tab 순서에 들어갑니다. 칸 어디를 눌러도 됩니다.
- `Scheduler.Event` 는 이 함수 밖에서 쓰면 오류입니다.

## 옮기기와 길이 바꾸기

```tsx
const [events, setEvents] = useState(initialEvents);

<Scheduler
  aria-label="일정표"
  events={events}
  onEventChange={(event, { start, end }) =>
    setEvents((all) => all.map((item) => (item.id === event.id ? { ...item, start, end } : item)))
  }
/>;
```

- `onEventChange` 를 주면 시각이 있는 일정을 끌어 옮기고, 아래 끝을 끌어 끝 시각을 바꿉니다. 종일 일정은 옮기지 않습니다.
- 둘 다 15분 단위로 맞습니다. 옮기는 동안 일정은 15분 칸과 날짜 칸에 맞춰 움직이고, 놓을 때 한 번 `onEventChange(event, { start, end })` 를 부릅니다.
- `start` 와 `end` 는 넘긴 값과 같은 타입(`CalendarDateTime`, `ZonedDateTime`)입니다. 옮기면 둘이 같은 만큼 움직이고, 길이를 바꾸면 `end` 만 바뀝니다.
- 제어 컴포넌트입니다. 앱이 `events` 를 바꿔야 자리가 바뀌고, 바꾸지 않으면 원래 자리로 돌아갑니다.
- 포인터는 4px 움직여야 끌기가 시작되므로 그냥 누르면 `onClick` 입니다. 끌기를 마친 click 은 삼킵니다. 터치는 250ms 눌러야 시작되어 그 전에는 스크롤됩니다.
- 끄는 동안 일정은 Sidebar, Editor 의 끄는 항목과 같은 그림자와 투명도로 들려 보입니다(`internal/drag-surface.ts`).
- 시작은 그날 0시에서 23:45 사이, 날짜는 보이는 기간 안에서만 옮깁니다. 끝은 그날 24시까지, 길이는 30분부터입니다.
- 아래 끝은 일정의 끝이 든 날의 칸에만 있습니다. 자정을 넘는 일정은 둘째 날 칸에서 끝을 바꿉니다.
- 아래 끝 손잡이는 일정의 아래 경계에 걸쳐 있습니다. 마우스를 올리거나 포커스가 있거나 끄는 중인 일정은 앞으로 올라오므로, 바로 이어지는 일정이 붙어 있어도 손잡이가 가려지지 않습니다. 겹치는 일정은 나란히 놓여서, 앞으로 올라와도 덮는 것은 이어지는 일정의 맨 위 몇 px 뿐입니다. 손잡이 막대는 일정의 색 계열(`border-scheme-strong`, 올리거나 끄는 동안 `text-scheme`)이라 색 있는 일정 위에서도 보입니다.

| 키보드                  | 동작                                                |
| ----------------------- | --------------------------------------------------- |
| 일정에서 `Space`        | 집는다. `onClick` 이 없는 일정도 Tab 순서에 들어온다 |
| `↑` `↓`                 | 15분                                                |
| `Shift` + `↑` `↓`       | 1시간                                               |
| `←` `→`                 | 하루. RTL 에서는 맞바뀐다                           |
| `Enter`, `Space`        | 놓는다                                              |
| `Escape`, 포커스 떠남   | 제자리에 둔다                                       |
| 아래 끝 separator `↑` `↓` | 끝 시각 15분. `Shift` 와 함께 1시간                |

- 아래 끝은 Resizable(`direction="vertical"`, `step` 은 15분 높이)이라 separator "알고리즘 끝 시각"으로 읽히고, 값은 px 대신 끝 시각("오전 10:30")입니다.
- 집고, 옮기고, 놓을 때마다 "집었습니다: 알고리즘", "11월 18일 수요일 오전 9:30 시작", "옮겼습니다: 알고리즘"를 알립니다. 사용법은 root 의 `aria-describedby` 로 읽힙니다.
- 놓은 일정이 다른 날 칸으로 가면 포커스가 그 일정을 따라갑니다.

## 월 보기에서 옮기기

- 월 보기에서는 일정(종일 일정 포함)을 다른 날 칸으로 끌어 놓습니다. 날짜만 하루 단위로 바뀌고 시각은 그대로입니다. `onEventChange(event, { start, end })` 의 두 값이 같은 날 수만큼 움직입니다.
- 끄는 동안 일정은 포인터 아래의 날 칸에 맞춰 붙습니다. 여러 주에 걸친 막대는 잡은 날을 기준으로, 잡은 주의 조각이 움직입니다.
- 보이는 날 칸(앞뒤 달의 날 포함) 안에서만 옮깁니다.
- 포인터 4px, 터치 250ms 규칙과 끌기를 마친 click 을 삼키는 것은 시간 격자와 같습니다.

| 키보드           | 동작                                   |
| ---------------- | -------------------------------------- |
| 일정에서 `Space` | 집는다                                 |
| `←` `→`          | 하루. RTL 에서는 맞바뀐다              |
| `↑` `↓`          | 한 주                                  |
| `Enter`, `Space` | 놓는다                                 |
| `Escape`, 포커스 떠남 | 제자리에 둔다                     |

- 옮길 때마다 "2026년 11월 27일 금요일 시작"처럼 새 시작을 알립니다. 사용법은 root 의 `aria-describedby` 로 읽힙니다.

## 빈 칸을 끌어 고르기

```tsx
<Scheduler
  aria-label="일정표"
  events={events}
  onSlotSelect={({ start, end, allDay }) => openCreateDialog({ start, end, allDay })}
/>
```

- `onSlotSelect` 를 주면 빈 곳을 끌어 기간을 고릅니다. 일정을 옮길 때와 같은 dnd-kit 끌기라서 시작 조건, 자동 스크롤, Escape 가 같습니다. 놓을 때 한 번 `{ start, end, allDay }` 를 넘깁니다. 일정을 만드는 것은 앱입니다.
- 시간 격자에서는 누른 날 칸 안에서 위아래로 끌어 15분 단위로 고릅니다. 끄는 동안 고른 시간("오후 2:00 – 오후 3:30")이 칸 위에 그려지고, `allDay` 는 `false` 입니다.
- 월 보기에서는 날 칸을 가로질러 끌어 여러 날을 고릅니다. 고른 날 칸은 `bg-primary-soft` 로 칠해지고, `start` 는 첫날 `00:00`, `end` 는 마지막 날 다음 날 `00:00`, `allDay` 는 `true` 입니다.
- 마우스는 4px 를 움직여야, 터치는 250ms 를 누르고 있어야 고르기가 시작됩니다. 그 전에 떼면 아무것도 넘기지 않고, 터치는 그 전까지 스크롤됩니다. Escape 는 고르기를 취소합니다.
- 보드 끝으로 끌면 보드가 스크롤되면서 고른 기간이 이어집니다.
- 일정, 버튼(`+N개`) 위에서 누르면 고르지 않습니다. 오른쪽 버튼과 수정 키(`Ctrl`, `Shift`, `Alt`, `Meta`)를 누른 채로 누를 때도 고르지 않습니다.
- 키보드로 고르는 방법은 없습니다. 키보드로 일정을 만들려면 앱이 "새 일정" 버튼이나 `Scheduler.SlotMenu` 를 함께 둡니다.

## 우클릭 메뉴

```tsx
<Scheduler aria-label="일정표" events={events}>
  <Scheduler.EventMenu>
    {(event) => (
      <>
        <Menu.Item onSelect={() => open(event)}>
          <ArrowTopRightOnSquareIcon />
          열기
        </Menu.Item>
        <Menu.Item onSelect={() => remove(event)}>
          <TrashIcon />
          삭제
        </Menu.Item>
      </>
    )}
  </Scheduler.EventMenu>
  <Scheduler.SlotMenu>
    {({ start, end }) => (
      <Menu.Item onSelect={() => create({ start, end })}>
        <PlusIcon />
        여기에 일정 만들기
      </Menu.Item>
    )}
  </Scheduler.SlotMenu>
</Scheduler>
```

- `Scheduler.EventMenu` 의 children 함수 `(event)` 는 일정(종일 일정 포함)을 우클릭했을 때 열 `Menu.Item` 들을 돌려줍니다. 메뉴 이름은 일정 제목입니다.
- `Scheduler.SlotMenu` 의 children 함수 `({ start, end, allDay })` 는 시간 칸의 빈 곳을 우클릭했을 때 엽니다. 포인터 아래의 30분 칸이 `CalendarDateTime` 으로 넘어오고, 메뉴 이름은 "11월 18일 수요일 오후 2:30" 입니다.
- 월 보기에서는 날 칸의 빈 곳을 우클릭하면 그날 하루(`00:00` 부터 다음 날 `00:00` 까지, `allDay: true`)가 넘어오고, 메뉴 이름은 "2026년 11월 25일 수요일" 입니다.
- 메뉴는 `Menu triggerType="contextmenu"` 라서 우클릭한 자리에 뜹니다. 고르는 법, 키보드, 닫는 법은 Menu 와 같습니다.
- 메뉴 part 를 두지 않은 곳(`Scheduler.EventMenu` 없이 일정, `Scheduler.SlotMenu` 없이 빈 칸, 종일 줄의 빈 곳)은 브라우저 메뉴가 그대로 뜹니다.
- 두 part 는 `Scheduler` 의 자식이나 Fragment 안에 둡니다. 일정을 그리는 함수(`{(event) => <Scheduler.Event />}`)와 함께 둘 수 있습니다.
- `onEventChange` 와 함께 써도 우클릭은 일정을 집지 않습니다.

## 보기와 날짜

```tsx
<Scheduler aria-label="일정표" events={events} defaultView="day" defaultDate={new CalendarDate(2026, 11, 17)} />
<Scheduler aria-label="일정표" events={events} defaultView="days" defaultDayCount={4} />

const [view, setView] = useState<Scheduler.View>('week');
const [date, setDate] = useState(today(getLocalTimeZone()));
<Scheduler aria-label="일정표" events={events} view={view} onViewChange={setView} date={date} onDateChange={setDate} />
```

- `date` 는 보이는 기간 안의 아무 날입니다. 월 보기는 그날이 든 달, 주 보기는 그날이 든 주, `days` 는 그날부터 `dayCount` 일을 그립니다.
- 이전, 다음은 보기만큼(한 달, 한 주, `dayCount` 일, 하루) 옮깁니다. 오늘은 오늘로 갑니다.
- `days` 보기에서는 보기 전환 앞에 날 수 칸(NumberField)이 나옵니다. 2일부터 14일까지 직접 입력하거나 위아래 버튼, 방향키로 바꿉니다. 범위 밖이나 빈 값은 칸을 떠날 때 마지막 값으로 돌아갑니다.
- 보기 전환의 N일 버튼 이름은 `dayCount` 를 따릅니다("3일").
- `dayCount` 도 `view`, `date` 처럼 제어하거나(`dayCount` / `onDayCountChange`) 처음 값만 줄 수 있습니다(`defaultDayCount`). 2보다 작거나 14보다 큰 값은 범위 안으로 맞춥니다.
- 기간 버튼은 Calendar 를 엽니다. 포커스가 `date` 로 들어가고, 날을 고르면 그날로 옮기며 닫힙니다. Escape 는 닫고 포커스를 기간 버튼에 돌려줍니다.
- 보기 전환은 라디오 그룹이라 다시 눌러도 풀리지 않습니다.
- `date` 의 기본은 오늘입니다. 서버와 클라이언트가 다른 날이면 hydration 이 어긋나므로, 서버에서 그리는 앱은 `defaultDate` 를 넘깁니다.

## 월 보기

```tsx
<Scheduler aria-label="일정표" events={events} defaultView="month" />
```

- 그달 1일이 든 주부터 마지막 날이 든 주까지 그립니다. 앞뒤 달의 날은 `bg-block` 으로 가라앉힙니다.
- 종일 일정과 여러 날에 걸친 일정은 일정 색으로 칠한 막대입니다. 시간이 있는 하루짜리 일정은 칠하지 않고, 일정 색 점과 시작 시각, 제목을 한 줄에 씁니다. 자정에 끝나는 일정은 그 전날까지만 그립니다.
- 한 주를 넘는 막대는 다음 주 줄로 이어집니다. 잘린 쪽은 모서리를 펴고 주의 가장자리까지 닿아서, 이어지는 일정으로 읽힙니다. 주 보기의 종일 줄도 같습니다.
- 날 칸은 보드 너비에 맞춰 줄어듭니다. 칸이 좁으면(120px 아래) 시작 시각을 숨기고 점과 제목만 남깁니다.
- 긴 막대부터, 같은 길이면 종일 일정, 시작 시각 순으로 빈 줄에 채웁니다.
- 하루에 세 줄을 넘는 일정은 `+N개` 버튼으로 접습니다. 누르면 그날의 일 보기로 가고, `onViewChange('day')` 와 `onDateChange` 를 부릅니다.
- `onEventChange` 를 주면 월 보기의 일정도 다른 날 칸으로 끌어 옮깁니다(아래 "월 보기에서 옮기기"). 길이는 주, N일, 일 보기에서 바꿉니다.
- 각 주는 날짜 범위로 이름 붙은 `group` 이고, 일정은 그 안의 ItemGroup 입니다.

## 지금 시각

```tsx
<Scheduler aria-label="일정표" events={events} />                                          // 클라이언트 시계, 1분마다
<Scheduler aria-label="일정표" events={events} now={new CalendarDateTime(2026, 11, 17, 10, 30)} />  // 고정
```

- 오늘 칸에 지금 시각의 선을 긋습니다. 장식이라 화면 읽기는 읽지 않습니다.
- `now` 가 없으면 hydration 뒤에 클라이언트 시계를 읽어 긋습니다. 서버 HTML 에는 선이 없어서 서버와 클라이언트 시각이 달라도 어긋나지 않습니다.
- 오늘 칸(`aria-current="date"`)도 같은 시계를 따릅니다. 서버 HTML 에는 오늘 칸이 없고, hydration 뒤에 클라이언트의 오늘을 표시합니다.
- `now` 를 주면 그 시각에 고정하고, 오늘도 그 날짜입니다. 스토리와 테스트가 씁니다.

## 스크롤

- 처음 그릴 때 보이는 기간의 가장 이른 일정, 그것이 오전 8시보다 늦으면 오전 8시로 내려 둡니다. 그 시각 글자가 머리줄에 가리지 않도록 15분 위에서 멈춥니다. 날짜를 옮겨도 다시 내리지 않습니다.
- 높이는 기본 `h-144` 입니다. 다른 높이는 새 디자인에서 `className` 으로 줍니다. `h-full` 이면 격자가 남은 높이를 씁니다.
- 월, 주, N일 보기의 하루 칸은 88px 보다 좁아지지 않습니다. 좁은 화면에서는 격자가 가로로 스크롤되고, 시각 열은 왼쪽에 남습니다. 하루 보기는 가로로 스크롤되지 않습니다.

## locale

```tsx
<IdsProvider.Scope locale={en}>
  <Scheduler aria-label="Schedule" />                // Sun 15, "November 15 – 21, 2026", 9:00 AM
</IdsProvider.Scope>
<IdsProvider.Scope locale={{ ...en, language: 'de', tag: 'de-DE' }}>
  <Scheduler aria-label="Kalender" />                // 월요일 시작, "16.–22. November 2026", 9:00
</IdsProvider.Scope>
<Scheduler aria-label="일정표" weekStartsOn={1} />   // 첫 요일을 정한다(0 일요일 ~ 6 토요일)
```

- 가장 가까운 IdsProvider 의 locale 을 따르고, 없으면 `ko-KR` 입니다.
- 이전, 오늘, 다음 버튼과 보기 전환의 이름은 Intl 이 locale 로 그립니다(`지난주`, `오늘`, `다음 주`, `월`, `주`, `3일`, `일`). 영어는 첫 글자를 대문자로 씁니다(`Today`, `Month`).
- `days`, `day` 보기의 이전, 다음은 `3일 전`, `3일 후`, `1일 전`, `1일 후` 입니다. 월 보기의 넘친 일정은 `+2` 입니다.
- 그 밖의 문구(보기, 날짜로 이동, 끌기 안내)는 IdsProvider `locale` 의 `scheduler.*` 문구를 따릅니다.

## Props

| Prop                                    | Type                                  | Default              |
| --------------------------------------- | ------------------------------------- | -------------------- |
| `events`                                | `Scheduler.EventData[]` 를 넓힌 배열   | -                    |
| `view` / `defaultView` / `onViewChange` | `'month' \| 'week' \| 'days' \| 'day'` | `'week'`             |
| `dayCount` / `defaultDayCount` / `onDayCountChange` | `number` (`days` 보기의 날 수, 2 ~ 14) | `3`  |
| `date` / `defaultDate` / `onDateChange` | `CalendarDate`                        | 오늘                 |
| `weekStartsOn`                          | `0` ~ `6`                             | locale 의 첫 요일    |
| `now`                                   | `CalendarDateTime`                    | 클라이언트 시계      |
| `onEventChange`                         | `(event, { start, end }) => void`     | 없음(옮기지 않음)    |
| `onSlotSelect`                          | `({ start, end, allDay }) => void`    | 없음(고르지 않음)    |
| `children`                              | `(event) => ReactNode` 와 아래 part    | `<Scheduler.Event />` |

나머지 `div` props 는 root 에 갑니다.

| Part                  | children                                | 없으면              |
| --------------------- | --------------------------------------- | ------------------- |
| `Scheduler.EventMenu` | `(event) => ReactNode`                  | 일정에 브라우저 메뉴 |
| `Scheduler.SlotMenu`  | `({ start, end, allDay }) => ReactNode` | 빈 칸에 브라우저 메뉴 |

## 다음 판

- 주 보기의 종일 일정 옮기기, 시작 시각 끌기, 자정을 넘겨 늘이기, 월 보기에서 여러 날 일정 늘이기.
- 키보드로 빈 칸 고르기, 보이는 시간 범위(`startHour`, `endHour`)와 숨길 요일.
