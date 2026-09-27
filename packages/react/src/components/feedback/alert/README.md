# Alert

페이지 흐름 안에 머무는 알림 상자입니다. 사용자가 닫을 때까지 남아 있습니다. 잠깐 떴다 사라지는 알림은 `Toast` 를 씁니다.

- **의미와 강도가 따로.** `colorScheme` 은 의미(info, success, warning, danger, neutral), `variant` 는 강도(solid, soft, outline, ghost)입니다. 두 축은 자유롭게 섞입니다.
- **색만으로 말하지 않습니다.** 의미마다 기본 아이콘이 붙어 색을 구분하기 어려운 사용자도 종류를 알 수 있습니다.
- **읽기 좋은 대비.** 제목과 아이콘은 `-strong` 톤을 써서 노란 warning도 WCAG AA(4.5:1)를 넘깁니다.
- **알맞게 알립니다.** warning과 danger는 읽던 것을 끊고 알리고(`role="alert"`), 나머지는 기다렸다 알립니다(`role="status"`).
- **닫기.** `Alert.Close` 를 넣으면 닫을 수 있고, 부모 상태 없이도 스스로 사라집니다. 안에 포커스가 있으면 Escape로도 닫히고, 포커스는 다음 요소로 옮겨 가 페이지 맨 위로 튕기지 않습니다.
- **한글 입력.** 조합 중에 누른 Escape는 조합만 취소하고 알림은 그대로 둡니다.

```tsx
import { Alert } from '@gsainfoteam/ids-react';

<Alert colorScheme="success">
  <Alert.Title>저장 완료</Alert.Title>
  <Alert.Description>변경 사항이 저장되었습니다.</Alert.Description>
</Alert>;
```

## 의미와 강도

```tsx
<Alert colorScheme="info" />       // neutral / info(기본) / success / warning / danger
<Alert variant="soft" />           // 옅은 배경(기본)
<Alert variant="outline" />        // 흰 배경에 중립 테두리
<Alert variant="solid" />          // 의미 색으로 채움. 가장 강하다
<Alert variant="ghost" />          // 배경과 테두리 없이
```

- `soft`, `outline`, `ghost` 에서는 제목과 아이콘만 의미 색이고 본문은 중립색입니다.
- `solid` 는 배경이 의미 색이고 글자는 그 위의 대비 색(`--ids-color-on-*`)입니다.

## 구조

```tsx
<Alert colorScheme="warning" variant="outline">
  <Alert.Icon /> {/* 생략해도 의미별 기본 아이콘이 붙는다 */}
  <Alert.Title>세션 만료 임박</Alert.Title>
  <Alert.Description>5분 뒤 자동으로 로그아웃됩니다.</Alert.Description>
  <Alert.Actions>
    <Button size="tiny">세션 연장</Button>
  </Alert.Actions>
  <Alert.Close /> {/* 어디에 적든 끝 쪽 위 (보통 오른쪽 위) */}
</Alert>
```

- 아이콘은 왼쪽 열에, Title / Description / Actions는 가운데 열에, Close는 오른쪽 열에 놓입니다.
- 기본 아이콘: info, neutral은 ⓘ, success는 ✓, warning은 △, danger는 ⓧ 입니다. `neutral` 은 `Alert.Icon` 을 적었을 때만 아이콘이 붙습니다.

```tsx
<Alert.Icon><SparklesIcon /></Alert.Icon>    // 다른 아이콘
<Alert.Icon hidden />                        // 아이콘 없이
```

- 모든 파트는 `asChild` 로 다른 요소를 그릴 수 있습니다. 제목을 `h3` 로 두려면 `<Alert.Title asChild><h3>…</h3></Alert.Title>`.

## 닫기

```tsx
<Alert>                                             // 비제어: 스스로 사라진다
  <Alert.Title>새 기능</Alert.Title>
  <Alert.Close />
</Alert>

<Alert open={open} onOpenChange={setOpen}>          // 제어
  …
  <Alert.Close aria-label="공지 닫기" />             // 이름 바꾸기 (기본 "닫기")
</Alert>

<Alert.Close onClick={(event) => {
  if (unsaved) event.preventDefault();              // 닫지 않는다
}} />
```

| 동작                         | 결과                                     |
| ---------------------------- | ---------------------------------------- |
| `Alert.Close` 클릭           | 닫힌다                                   |
| 안에 포커스가 있을 때 `Esc`  | 닫힌다. 조합 중인 입력은 조합만 취소한다 |
| 닫힐 때 안에 포커스가 있었음 | 포커스가 다음 요소(없으면 이전 요소)로   |

- 닫힐 때 짧게 흐려지며 사라집니다. `prefers-reduced-motion` 이면 바로 사라집니다.
- `onOpenChange(false)` 는 닫기를 누른 순간 불리고, 요소는 전환이 끝난 뒤에 빠집니다.
- `Alert.Close` 가 없으면 Escape로 닫히지 않습니다.
- 부모가 `open` 을 `false` 로 바꾸거나 Alert를 아예 빼도, 안에 있던 포커스는 다음 요소로 옮겨 갑니다. 안의 동작 버튼으로 닫는 경우에도 포커스를 잃지 않습니다.

## 역할

```tsx
<Alert colorScheme="danger" />          // role="alert", aria-live="assertive"
<Alert colorScheme="info" />            // role="status", aria-live="polite"
<Alert colorScheme="warning" role="note" />  // 늘 떠 있는 안내는 알리지 않게
```

## 상태

| 상태          | 뜻                    |
| ------------- | --------------------- |
| `colorScheme` | 넘긴 의미             |
| `variant`     | 넘긴 강도             |
| `open`        | 열려 있다             |
| `dismissible` | `Alert.Close` 가 있다 |
| `ending`      | 닫히는 전환 중이다    |

```tsx
<Alert className={(state) => (state.dismissible ? 'pe-2' : undefined)} />
```

- 루트에 `data-alert`, `data-color-scheme`, `data-variant`, `data-dismissible`, 닫히는 동안 `data-ending-style` 이 붙습니다.

## 속성

| 속성                   | 기본 / 동작                          |
| ---------------------- | ------------------------------------ |
| `colorScheme`          | `info`                               |
| `variant`              | `soft`                               |
| `open` / `defaultOpen` | 열림. 기본 `true`                    |
| `onOpenChange`         | 닫으려 할 때 `false` 로              |
| `role` / `aria-live`   | 의미에 따라 자동. 넘기면 그 값       |
| `className` / `style`  | 루트로 간다. 상태를 받는 함수도 된다 |
| 그 외 속성             | 루트 div로 간다                      |

## 알아둘 것

- 닫힌 Alert는 아무것도 그리지 않습니다. 다시 보이려면 제어 모드로 `open` 을 `true` 로 돌립니다.
- Title도 Description도 없으면 개발 모드에서 경고가 나옵니다.
- `role="status"` 영역은 처음부터 내용을 갖고 나타나면 스크린 리더가 읽지 않을 수 있습니다. 작업 결과를 알릴 때는 Alert 자리를 먼저 두고 내용을 바꾸는 편이 확실합니다.
