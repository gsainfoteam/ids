# Stepper

회원가입, 결제, 온보딩처럼 순서가 있는 작업에서 지금 몇 번째 단계인지 보여 주고, 단계 사이를 옮기게 합니다. `progress={false}` 로 두면 활동 로그, 배포 기록처럼 일어난 일을 시간순으로 늘어놓는 기록이 됩니다.

- **Tabs 와 다른 점.** Tabs 는 대등한 패널을 바꿔 보여 주고, Stepper 는 순서가 있는 단계의 진행을 보여 줍니다. 앞 단계는 completed, 값의 단계는 current, 뒤 단계는 upcoming 이 저절로 정해집니다.
- **진행과 기록.** 기본은 진행입니다. `progress={false}` 는 현재 단계가 없는 기록이고, 표시하지 않은 항목을 점(neutral)으로 그립니다.
- **구조가 곧 접근성.** 단계 목록은 `ol` 과 `li` 이고, 현재 단계에 `aria-current="step"` 이 붙습니다. 완료와 오류는 스크린 리더가 제목 뒤에 "완료", "오류" 로 읽습니다.
- **키보드.** 단계 목록은 Tab 한 칸이고 현재 단계에서 멈춥니다. 방향키로 단계 사이를 오갑니다.
- **기본 파트.** `Stepper.Item` 안에 제목만 적어도 버튼, 번호 표시, 연결선이 붙습니다.
- **Server Component.** `value` 만 주는 표시 전용 Stepper 와 기록은 서버에서 그대로 그려집니다.

```tsx
import { Stepper } from '@gsainfoteam/ids-react';

const [step, setStep] = useState(0);

<Stepper value={step} onValueChange={setStep}>
  <Stepper.Item>
    <Stepper.Title>계정</Stepper.Title>
    <Stepper.Description>이메일과 비밀번호</Stepper.Description>
  </Stepper.Item>
  <Stepper.Item>
    <Stepper.Title>프로필</Stepper.Title>
  </Stepper.Item>
  <Stepper.Item>
    <Stepper.Title>확인</Stepper.Title>
  </Stepper.Item>
</Stepper>;
```

## 값

값은 현재 단계의 번호입니다. 0 부터 셉니다.

```tsx
<Stepper defaultValue={1} />                          // 비제어. 단계를 누르면 옮긴다
<Stepper value={step} onValueChange={setStep} />      // 제어
<Stepper value={2} />                                 // 표시 전용. 버튼이 없다
<Stepper value={3} />                                 // 단계가 3개면 모두 completed
```

- `value` 를 주고 `onValueChange` 를 주지 않으면 누를 수 없는 표시 전용이 됩니다. 이때는 단계가 버튼이 아니고, 현재 단계의 `li` 에 `aria-current="step"` 이 붙습니다.
- 값이 단계 수와 같으면 모든 단계가 completed 입니다. 끝난 화면은 `<Stepper.Content value={단계 수}>` 로 둡니다.
- 값이 0 보다 작거나 단계 수보다 크면 개발 모드에서 경고합니다.

## linear

```tsx
<Stepper />                  // 기본 linear. 지난 단계와 바로 다음 단계만 누를 수 있다
<Stepper linear={false} />   // 어느 단계든 누를 수 있다
```

- linear 에서 그보다 뒤의 단계는 `disabled` 버튼이라 Tab 과 방향키가 건너뜁니다. 흐리게 그리지는 않습니다.
- `completed` 를 준 단계는 뒤에 있어도 누를 수 있습니다.

## 단계 상태

```tsx
<Stepper.Item />             // 순서로 정해진다: completed / current / upcoming
<Stepper.Item completed />   // 순서와 상관없이 completed
<Stepper.Item completed={false} />  // 지난 단계인데 아직 끝나지 않음
<Stepper.Item error />       // 오류. 현재 단계여도 오류로 그린다
<Stepper.Item disabled />    // 누를 수 없고 흐리게
<Stepper disabled />         // 모든 단계
```

- 상태는 `data-state` 하나(`completed` `current` `upcoming` `error`, 기록의 `neutral`)와 같은 이름의 플래그(`data-completed`, `data-current`, ...)로 모든 파트에 붙습니다. `data-current:` 처럼 씁니다.
- 오류인 현재 단계도 `aria-current="step"` 은 그대로입니다.

## 기록

```tsx
<Stepper progress={false} orientation="vertical" aria-label="최근 활동">
  <Stepper.Item>
    <Stepper.Indicator asChild>
      <Avatar name="김지우" />
    </Stepper.Indicator>
    <Stepper.Title>김지우 님이 댓글을 남겼습니다</Stepper.Title>
    <Stepper.Description>
      <time dateTime="2026-09-30T09:12">5분 전</time>
    </Stepper.Description>
  </Stepper.Item>
  <Stepper.Item completed>
    <Stepper.Title>배포 성공</Stepper.Title>
  </Stepper.Item>
  <Stepper.Item error>
    <Stepper.Title>테스트 실패</Stepper.Title>
  </Stepper.Item>
  <Stepper.Item>
    <Stepper.Title>저장소를 만들었습니다</Stepper.Title>
  </Stepper.Item>
</Stepper>
```

- `progress={false}` 에는 현재 단계도, 순서로 정해지는 completed 도 없습니다.
- 표시하지 않은 항목은 `neutral` 입니다.
  - 표시 자리에 10px 점을 그리고, 점은 제목의 첫 줄에 맞춥니다.
  - 제목은 보통 글자색이고, 스크린 리더가 읽을 상태 문구와 `aria-current` 가 없습니다.
  - Indicator 에 아이콘을 주면 점 대신 muted 원 안에 그립니다.
- `completed`, `error` 를 준 항목은 진행에서처럼 체크와 X 로 그리고 "완료", "오류" 를 읽습니다. 배포 성공과 실패에 씁니다.
- 연결선은 completed 뒤에도 중립색이고, 표시 칸의 아래 끝에서 다음 표시 칸의 위 끝까지 틈 없이 이어집니다.
- 늘 표시 전용이라 버튼이 없습니다. `value`, `defaultValue`, `onValueChange`, `linear` 는 쓰지 않고, 주면 개발 모드에서 경고합니다.
- 목록 이름의 기본값이 없습니다. "진행 단계" 는 기록의 이름이 아니므로 `aria-label` 이나 `aria-labelledby` 를 줍니다. 없으면 개발 모드에서 경고합니다.
- 진행 중인 일(도는 빌드)은 `<Stepper.Indicator><Spinner decorative /></Stepper.Indicator>` 와 제목의 글로 알립니다. 한 단계씩 나아가는 파이프라인이면 기록 대신 `value` 만 준 표시 전용 진행을 씁니다. 도는 단계에 `aria-current="step"` 이 붙습니다.
- 루트의 `className`, `style`, `children` 함수는 `{ value, orientation, disabled, progress }` 를 받습니다. 기록에서 `value` 는 `-1` 입니다.

## Content

```tsx
<Stepper value={step} onValueChange={setStep}>
  <Stepper.Item>...</Stepper.Item>
  <Stepper.Item>...</Stepper.Item>

  <Stepper.Content value={0}><AccountForm /></Stepper.Content>
  <Stepper.Content value={1}><ProfileForm /></Stepper.Content>
  <Stepper.Content value={2}>가입이 끝났습니다.</Stepper.Content>
</Stepper>
```

- 값이 같은 Content 만 보입니다. 다른 Content 는 `hidden` 으로 DOM 에 남아 입력한 값을 지킵니다.
- Content 는 단계 목록 아래에 그려집니다. `Stepper.Item` 안에 두지 않습니다.
- 이전, 다음 버튼은 앱이 둡니다: `setStep((step) => step + 1)`.

## 파트 꾸미기

```tsx
<Stepper.Item>
  <Stepper.Title>계정</Stepper.Title>          {/* Trigger, Indicator, Separator 는 저절로 붙는다 */}
</Stepper.Item>

<Stepper.Item>
  <Stepper.Indicator><UserIcon /></Stepper.Indicator>   {/* 번호 대신 아이콘 */}
  <Stepper.Title>가입</Stepper.Title>
</Stepper.Item>

<Stepper.Item>
  <Stepper.Trigger>
    <Stepper.Indicator>{(step) => (step.status === 'completed' ? '✓' : step.index + 1)}</Stepper.Indicator>
    <Stepper.Title>결제</Stepper.Title>
  </Stepper.Trigger>
  <Stepper.Separator className="bg-(--ids-color-outline)" />
</Stepper.Item>

<Stepper.Indicator className="size-2.5">{null}</Stepper.Indicator>  {/* 빈 점 */}

<Stepper.Indicator asChild>
  <Avatar name="김지우" />                      {/* 표시 크기(32px, tiny 24px)의 아바타 */}
</Stepper.Indicator>

<Stepper.Indicator>
  <Spinner decorative />                        {/* 도는 단계 */}
</Stepper.Indicator>

<Stepper.Description>
  <time dateTime="2026-04-25">4월 25일</time>   {/* 시각은 Description 안의 time */}
</Stepper.Description>
```

- 기본 표시는 upcoming 과 current 가 번호, completed 가 체크, error 가 X, 기록의 neutral 이 점입니다. `children` 에 `null` 을 주면 비웁니다.
- 아바타는 `Stepper.Indicator asChild` 로 둡니다. 표시의 크기와 둥근 모양을 받고 `aria-hidden` 이 되어, 이름은 제목이 읽습니다.
- 시각은 새 파트 없이 `Stepper.Description` 안에 `<time dateTime>` 으로 적습니다. 기계가 읽는 값과 사람이 읽는 글이 함께 남습니다.
- `Trigger` 를 생략하면 Item 의 내용이 기본 Trigger 에 들어갑니다. `Separator` 를 생략하면 마지막이 아닌 단계 끝에 연결선이 붙습니다.
- `Indicator`, `Title`, `Description` 은 `asChild` 로 자식 요소에 속성을 합칩니다.
- 모든 파트의 `className`, `style`, `children` 은 단계 상태 `{ index, status, current, disabled, last }` 를 받는 함수도 됩니다. `Trigger` 는 `hovered`, `focusVisible` 같은 인터랙션 상태도 받습니다.
- `Stepper.Item` 은 `Stepper` 의 바로 아래 자식이어야 합니다. 직접 만든 컴포넌트로 감싸면 단계로 세지 않고, 개발 모드에서 경고합니다.

## 키보드

| 키                | 동작                                        |
| ----------------- | ------------------------------------------- |
| `Tab`             | 현재 단계로 들어오고, 다음 Tab 은 목록 밖   |
| `→` `↓` / `←` `↑` | 다음, 이전 단계. 끝에서 멈춘다              |
| `Home` / `End`    | 처음, 마지막 단계                           |
| `Enter` / `Space` | 그 단계로 옮긴다                            |

- 누를 수 없는 단계(disabled, linear 에서 먼 단계)는 건너뜁니다.
- `dir="rtl"` 에서는 `←` `→` 가 뒤집힙니다.
- 표시 전용과 기록은 키보드로 들르지 않습니다.

## 방향과 크기

```tsx
<Stepper orientation="horizontal" />  // 기본. 단계 사이를 가로선이 잇는다
<Stepper orientation="vertical" />    // 세로. 표시 아래로 선이 내려간다
<Stepper size="tiny" />               // standard(기본) / tiny
```

- 세로에서 제목의 첫 줄은 표시의 가운데에 맞춥니다. 제목이 여러 줄이어도 첫 줄이 표시 옆에 옵니다.

## 상태와 data 속성

| 요소                                                             | 속성                                                                                               |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 루트                                                             | `data-stepper`, `data-orientation`, `data-size`, `data-disabled`                                   |
| `Item`, `Indicator`, `Title`, `Description`, `Separator` | `data-state`, `data-completed`, `data-current`, `data-upcoming`, `data-error`, `data-neutral`      |
| `Item`                                                           | 위에 더해 `data-disabled`                                                                          |
| `Trigger`                                                        | 위에 더해 `data-disabled`, `data-unreachable`(linear 에서 먼 단계), `data-hovered`, `data-focus-visible` |
| `Content`                                                        | `data-current`                                                                                     |

## 속성

| 속성                     | 기본 / 동작                                                        |
| ------------------------ | ------------------------------------------------------------------ |
| `value` / `defaultValue` | 현재 단계 번호. 기본 `0`                                           |
| `onValueChange`          | 단계를 눌러 옮길 때 `(value: number)`                              |
| `linear`                 | 기본 `true`. 지난 단계와 바로 다음 단계만 누를 수 있다             |
| `progress`               | 기본 `true`. `false` 면 현재 단계가 없는 기록                      |
| `orientation`            | `horizontal`(기본) / `vertical`                                    |
| `size`                   | `standard`(기본) / `tiny`                                          |
| `disabled`               | 모든 단계 비활성                                                   |
| `aria-label`             | 단계 목록(`ol`)의 이름. 진행의 기본은 "진행 단계", 기록은 기본 없음 |
| `aria-labelledby`        | 단계 목록의 이름을 다른 요소에서                                   |
| `Item.completed`         | 순서와 상관없이 완료 여부를 정한다. 기록에서는 성공한 일           |
| `Item.error`             | 오류 단계. 기록에서는 실패한 일                                    |
| `Item.disabled`          | 그 단계만 비활성                                                   |
| `Content.value`          | 필수. 보일 단계 번호                                               |
| 그 외                    | 각 파트의 native 속성. `Trigger` 는 `button` 으로 간다 |

## 알아둘 것

- 버튼의 이름은 `Title` 과 상태 문구("완료", "오류")이고, `Description` 은 `aria-describedby` 로 이어집니다. Title 이 없으면 버튼의 글자가 이름이 됩니다.
- 번호와 아이콘 표시는 `aria-hidden` 입니다. 순서는 `ol` 이 알립니다.
- 상태 문구는 `IdsProvider translate` 의 `stepper.completed`, `stepper.error`, 목록 이름은 `stepper.label` 입니다. 기록은 `stepper.label` 을 쓰지 않습니다.
