# Timeline

활동 로그, 배포 기록, 댓글처럼 일어난 일을 시간순으로 늘어놓습니다. 현재 항목도, 값도, 버튼도 없는 표시 전용 목록입니다.

- **Stepper 와 다른 점.** 순서대로 나아가는 작업(가입, 결제, 파이프라인)은 [Stepper](../../navigation/stepper/README.md) 입니다. Timeline 은 같은 모양이지만 현재 항목이 없고, 표시하지 않은 항목을 점(neutral)으로 그립니다.
- **구조가 곧 접근성.** 목록은 `ol` 과 `li` 입니다. 완료와 오류는 스크린 리더가 제목 뒤에 "완료", "오류" 로 읽습니다.
- **기본 파트.** `Timeline.Item` 안에 제목만 적어도 점과 연결선이 붙습니다.
- **Server Component.** 훅이 없어 서버에서 그대로 그려집니다.

```tsx
import { Timeline } from '@gsainfoteam/ids-react';

<Timeline aria-label="최근 활동">
  <Timeline.Item>
    <Timeline.Indicator asChild>
      <Avatar name="김지우" />
    </Timeline.Indicator>
    <Timeline.Title>김지우 님이 댓글을 남겼습니다</Timeline.Title>
    <Timeline.Description>
      <time dateTime="2026-09-30T09:12">5분 전</time>
    </Timeline.Description>
    <Timeline.Body>
      <Card variant="soft">좋은 의견이네요!</Card>
    </Timeline.Body>
  </Timeline.Item>
  <Timeline.Item status="completed">
    <Timeline.Title>배포 성공</Timeline.Title>
  </Timeline.Item>
  <Timeline.Item status="error">
    <Timeline.Title>테스트 실패</Timeline.Title>
  </Timeline.Item>
  <Timeline.Item>
    <Timeline.Title>저장소를 만들었습니다</Timeline.Title>
  </Timeline.Item>
</Timeline>;
```

## 항목 상태

```tsx
<Timeline.Item />                    // neutral. 점
<Timeline.Item status="completed" /> // 체크. 성공한 일
<Timeline.Item status="error" />     // X. 실패한 일
```

- `neutral` 인 항목은 표시 자리에 10px 점을 그리고, 점은 제목의 첫 줄에 맞춥니다.
  - 제목은 보통 글자색이고, 스크린 리더가 읽을 상태 문구가 없습니다.
  - Indicator 에 아이콘을 주면 점 대신 `bg-neutral-soft` 원 안에 그립니다.
- `completed`, `error` 는 Stepper 에서처럼 체크와 X 로 그리고 "완료", "오류" 를 읽습니다.
- 연결선은 늘 중립색이고, 표시 칸의 아래 끝에서 다음 표시 칸의 위 끝까지 틈 없이 이어집니다.
- 진행 중인 일(도는 빌드)은 `<Timeline.Indicator><Spinner aria-hidden /></Timeline.Indicator>` 와 제목의 글로 알립니다. 한 단계씩 나아가는 일이면 `value` 만 준 표시 전용 Stepper 를 씁니다.

## Body

```tsx
<Timeline.Item>
  <Timeline.Title>박서준 님의 댓글</Timeline.Title>
  <Timeline.Body>
    <Card variant="soft">다음 회의에서 같이 봐요.</Card>
  </Timeline.Body>
</Timeline.Item>

<Timeline.Body asChild>
  <Card variant="soft">댓글 내용</Card>                  {/* 감싸는 div 없이 Card 에 속성을 합친다 */}
</Timeline.Body>
```

- 제목과 설명 아래에 두는 자유로운 내용입니다. 링크, 버튼, `Item`, `Card` 를 담고, 안의 링크와 버튼은 순서대로 Tab 이 멈춥니다.
- 세로에서는 제목 칸에 맞춰 들여 쓰고, 연결선이 옆으로 이어져 다음 항목까지 닿습니다.
- 가로에서는 항목이 나란히 놓여 자리가 없으므로 숨깁니다. 개발 모드에서 경고합니다.

## 파트 바꾸기

```tsx
<Timeline.Item>
  <Timeline.Indicator><CommandLineIcon /></Timeline.Indicator>   {/* 점 대신 아이콘 */}
  <Timeline.Title>빌드를 시작했습니다</Timeline.Title>
</Timeline.Item>

<Timeline.Indicator asChild>
  <Avatar name="김지우" />                      {/* 표시 크기(32px, tiny 24px)의 아바타 */}
</Timeline.Indicator>

<Timeline.Description>
  <time dateTime="2026-04-25">4월 25일</time>   {/* 시각은 Description 안의 time */}
</Timeline.Description>
```

- 아바타는 `Timeline.Indicator asChild` 로 둡니다. 표시의 크기와 둥근 모양을 받고 `aria-hidden` 이 되어, 이름은 제목이 읽습니다.
- 시각은 새 파트 없이 `Timeline.Description` 안에 `<time dateTime>` 으로 적습니다.
- `Separator` 를 생략하면 마지막이 아닌 항목 끝에 연결선(장식용 `Divider`)이 붙습니다.
- `Indicator`, `Title`, `Description`, `Body` 는 `asChild` 로 자식 요소에 속성을 합칩니다.
- `Timeline.Item` 은 `Timeline` 의 바로 아래 자식이어야 합니다. 직접 만든 컴포넌트로 감싸면 항목으로 세지 않고, 개발 모드에서 경고합니다.

## 방향과 크기

```tsx
<Timeline aria-label="최근 활동" />                           // 기본 세로
<Timeline aria-label="배포 기록" orientation="horizontal" />   // 가로
<Timeline aria-label="최근 활동" size="tiny" />                // standard(기본) / tiny
```

- 부모의 너비를 다 채웁니다. 높이는 내용만큼입니다.
- 너비와 자리는 부모가 정합니다. 좁게 둘 때는 앱의 요소로 감쌉니다.

## 상태

- Timeline 은 상태를 갖지 않습니다. 항목의 `status` 는 앱이 줍니다.
- 새 디자인을 그릴 때만 상태를 받는 함수를 씁니다. `className`, `style`, `children` 이 함수를 받습니다.

| 받는 곳                                                                         | 필드                                                  |
| ------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 루트                                                                            | `orientation`                                         |
| `Item`, `Indicator`, `Title`, `Description`, `Body`, `Separator`(children 없음) | `index`, `status`(`neutral` `completed` `error`), `last` |

## 속성

| 속성              | 기본 / 동작                                       |
| ----------------- | ------------------------------------------------- |
| `orientation`     | `vertical`(기본) / `horizontal`                   |
| `size`            | `standard`(기본) / `tiny`                         |
| `aria-label`      | 필수. 목록(`ol`)의 이름. 기본값이 없다            |
| `aria-labelledby` | `aria-label` 대신, 보이는 제목의 `id`             |
| `Item.status`     | `neutral`(기본) / `completed` / `error`           |
| `Body.asChild`    | 감싸는 `div` 없이 자식 요소에 속성을 합친다       |
| 그 외             | 각 파트의 native 속성. `Body` 는 `div` 로 간다    |

## 알아둘 것

- 표시는 `aria-hidden` 입니다. 순서는 `ol` 이 알립니다.
- 목록 이름은 필수입니다. 둘 다 없으면 개발 모드에서 경고합니다.
- 상태 문구는 `IdsProvider locale` 의 `stepper.completed`, `stepper.error` 입니다.
