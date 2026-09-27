# Divider

내용을 나누는 1px 선입니다. 가로와 세로를 모두 그리고, 가운데에 "또는" 같은 글자를 둘 수 있습니다.

- **글자가 이름이 됩니다.** separator 안의 글자는 스크린 리더가 내용으로 읽지 않으므로, 가운데 글자를 `aria-labelledby` 로 연결해 "또는, 구분선" 으로 읽히게 합니다.
- **중립색.** 선은 `--ids-color-border`, 글자는 `--ids-color-on-muted` 입니다. 테마 색을 쓰지 않습니다.
- **알아서 늘어납니다.** 세로 구분선은 flex 행의 높이까지 늘고, 행 밖에서도 한 줄 높이는 지킵니다.
- **쓰는 방향을 따릅니다.** `align="start"` 는 왼쪽에서 오른쪽 글에서는 왼쪽, 오른쪽에서 왼쪽 글에서는 오른쪽입니다.
- **포커스를 받지 않습니다.** 크기 조절 핸들이 아니라 구분선입니다.

```tsx
import { Divider } from '@gsainfoteam/ids-react';

<Divider />
<Divider>또는</Divider>
```

## 방향

```tsx
<Divider />                                   // 가로(기본). 부모 폭만큼

<div className="flex h-8 items-center gap-3">
  <span>계정</span>
  <Divider orientation="vertical" />          {/* 행 높이만큼 */}
  <span>설정</span>
</div>
```

## 가운데 글자

```tsx
<Divider>또는</Divider>                        // 양쪽 선 사이에
<Divider align="start">최근 항목</Divider>      // 글자를 시작 쪽에, 선은 끝 쪽으로
<Divider align="end">더 보기</Divider>

<Divider orientation="vertical">또는</Divider> // 세로선 가운데에
```

- 글자가 길면 줄바꿈되고 선은 짧아집니다. 선은 양쪽에 최소 16px 남습니다.
- `aria-label` 을 넘기면 글자 대신 그 이름을 씁니다.

## 장식용 선

```tsx
<Divider orientation="vertical" decorative />
```

- 의미 없이 모양만 나누는 선은 `decorative` 로 접근성 트리에서 뺍니다. 버튼 묶음 사이의 선처럼 앞뒤 요소가 이미 구분될 때 씁니다.

## 상태

| 상태          | 뜻                 |
| ------------- | ------------------ |
| `orientation` | 넘긴 방향          |
| `labelled`    | 가운데 글자가 있다 |
| `align`       | 넘긴 정렬          |
| `decorative`  | 장식용이다         |

- 요소에는 `data-divider`, `data-orientation`, 글자가 있으면 `data-labelled` 와 `data-align` 이 붙습니다.

## 속성

| 속성                  | 기본 / 동작                                      |
| --------------------- | ------------------------------------------------ |
| `orientation`         | `horizontal`(기본) / `vertical`                  |
| `children`            | 가운데 글자                                      |
| `align`               | `center`(기본) / `start` / `end`. 글자가 있을 때 |
| `decorative`          | `false`. `true` 면 접근성 트리에서 뺀다          |
| `className` / `style` | 상태를 받는 함수도 된다                          |
| 그 외 속성            | div로 간다                                       |

## 알아둘 것

- 바깥 여백이 없습니다. 위아래 간격은 부모의 `gap` 으로 둡니다.
- 두께와 색은 `className` 으로 바꿉니다. 가운데 글자가 있으면 선은 `before:` / `after:` 로 그려지므로 `before:bg-*` `after:bg-*` 를 씁니다.
